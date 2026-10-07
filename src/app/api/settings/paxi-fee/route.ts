import { NextResponse } from "next/server";
import { getPaxiFee } from "@/lib/settings";

export async function GET() {
  const fee = await getPaxiFee();
  return NextResponse.json({ fee });
}
