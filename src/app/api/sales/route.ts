import { NextResponse } from "next/server";
import { searchSales } from "@/lib/grocery/flyers";

export const dynamic = "force-dynamic";

/** Flyer deals matching one grocery item near a zip code. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const zip = (params.get("zip") ?? "").trim();
  const q = (params.get("q") ?? "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Enter a 5-digit zip code" }, { status: 400 });
  }
  if (!q) return NextResponse.json({ matches: [] });

  try {
    const matches = await searchSales(zip, q);
    return NextResponse.json({ matches }, { headers: { "Cache-Control": "public, max-age=1800" } });
  } catch (err) {
    console.error("sales lookup failed", err);
    return NextResponse.json({ error: "Could not check flyers right now" }, { status: 502 });
  }
}
