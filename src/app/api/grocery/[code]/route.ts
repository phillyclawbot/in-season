import { NextResponse } from "next/server";
import { getStorage, normalizeCode } from "@/lib/grocery/storage";
import { applyOps } from "@/lib/grocery/apply";
import { DEFAULT_SETTINGS, type HouseholdState, type Op } from "@/lib/grocery/types";

export const dynamic = "force-dynamic";

type Ctx = { params: { code: string } };

/** Fetch the whole list. Pass ?since=<version> to get a tiny "nothing new" reply instead. */
export async function GET(req: Request, { params }: Ctx) {
  const code = normalizeCode(params.code);
  if (!code) return NextResponse.json({ error: "Bad list code" }, { status: 400 });

  const state = await getStorage().get(code);
  if (!state) return NextResponse.json({ error: "No list with that code" }, { status: 404 });

  const since = Number(new URL(req.url).searchParams.get("since"));
  if (Number.isFinite(since) && since === state.version) {
    return NextResponse.json({ unchanged: true, version: state.version });
  }
  return NextResponse.json({ state });
}

/** Apply a batch of changes from one phone and return the merged list. */
export async function POST(req: Request, { params }: Ctx) {
  const code = normalizeCode(params.code);
  if (!code) return NextResponse.json({ error: "Bad list code" }, { status: 400 });

  let ops: Op[];
  try {
    const body = (await req.json()) as { ops?: unknown };
    if (!Array.isArray(body.ops)) throw new Error("ops must be an array");
    ops = body.ops.slice(0, 200) as Op[];
  } catch {
    return NextResponse.json({ error: "Bad request body" }, { status: 400 });
  }

  try {
    // The storage layer guarantees that two phones saving at once are applied
    // one after the other, never on top of each other.
    const { state } = await getStorage().update(code, (current) => (current ? applyOps(current, ops) : null));
    if (!state) return NextResponse.json({ error: "No list with that code" }, { status: 404 });
    return NextResponse.json({ state });
  } catch (err) {
    console.error("list update failed", err);
    return NextResponse.json({ error: "List is busy, please retry" }, { status: 409 });
  }
}

/**
 * Restore a list from a phone's saved copy. Used when the server has forgotten
 * the list (for example a host without a database recycled its memory). If the
 * list already exists on the server, that copy wins and is returned unchanged.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const code = normalizeCode(params.code);
  if (!code) return NextResponse.json({ error: "Bad list code" }, { status: 400 });

  let incoming: HouseholdState;
  try {
    const body = (await req.json()) as { state?: HouseholdState };
    if (!body.state || !Array.isArray(body.state.items)) throw new Error("state.items required");
    incoming = body.state;
  } catch {
    return NextResponse.json({ error: "Bad request body" }, { status: 400 });
  }

  const now = Date.now();
  // Rebuild through the normal change rules so every item is validated.
  const blank: HouseholdState = {
    code,
    version: 0,
    items: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: typeof incoming.createdAt === "number" ? incoming.createdAt : now,
    updatedAt: now,
  };
  const rebuilt = applyOps(blank, [
    ...incoming.items.slice(0, 500).map((item): Op => ({ type: "add", item })),
    { type: "settings", patch: incoming.settings ?? {} },
  ]);
  const restored: HouseholdState = {
    ...rebuilt,
    version: Number.isInteger(incoming.version) && incoming.version > 0 ? incoming.version : 1,
  };

  try {
    const { state } = await getStorage().update(code, (current) => (current ? null : restored));
    return NextResponse.json({ state: state ?? restored });
  } catch (err) {
    console.error("list restore failed", err);
    return NextResponse.json({ error: "List is busy, please retry" }, { status: 409 });
  }
}
