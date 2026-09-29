import { NextResponse } from "next/server";
import { fetchStores } from "@/lib/grocery/flyers";

export const dynamic = "force-dynamic";

/** Stores that currently have a grocery flyer near a zip code. */
export async function GET(req: Request) {
  const zip = (new URL(req.url).searchParams.get("zip") ?? "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Enter a 5-digit zip code" }, { status: 400 });
  }
  try {
    const stores = await fetchStores(zip);
    return NextResponse.json({ stores }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (err) {
    console.error("flyers lookup failed", err);
    return NextResponse.json({ error: "Could not load flyers right now" }, { status: 502 });
  }
}
