import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  await setSetting(key, String(value));
  return NextResponse.json({ success: true });
}
