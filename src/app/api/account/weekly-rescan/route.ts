import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { setWeeklyRescan } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await req.json();
  await setWeeklyRescan(user.email, !!enabled);
  return NextResponse.json({ ok: true });
}
