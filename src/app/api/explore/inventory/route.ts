import { NextResponse } from "next/server";
import { getInventory } from "@/lib/explore/inventory";

/* Айл, зогсоолын төлөв — Explorer минут тутам татна (kiosk ч мөн).
   Үнэ агуулахгүй. Эх сурвалж: Vertmonhub, тохируулаагүй үед mockup. */

export const dynamic = "force-dynamic";

export async function GET() {
  const inventory = await getInventory();
  return NextResponse.json(inventory, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
