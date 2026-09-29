import { NextResponse } from "next/server";
import { getStorage, makeHouseholdCode } from "@/lib/grocery/storage";
import { DEFAULT_SETTINGS, type HouseholdState } from "@/lib/grocery/types";

export const dynamic = "force-dynamic";

/** Start a brand-new shared list and hand back its code. */
export async function POST() {
  const storage = getStorage();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeHouseholdCode();
    const now = Date.now();
    const state: HouseholdState = {
      code,
      version: 1,
      items: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: now,
      updatedAt: now,
    };
    const ok = await storage.compareAndSet(code, 0, state);
    if (ok) return NextResponse.json({ state, storage: storage.kind });
  }

  return NextResponse.json({ error: "Could not create a list, please try again" }, { status: 500 });
}
