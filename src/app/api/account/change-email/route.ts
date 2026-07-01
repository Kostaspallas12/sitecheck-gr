import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { migrateUserEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { newEmail } = await req.json();
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!newEmail || newEmail === user.email || !EMAIL_RE.test(newEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await migrateUserEmail(user.email, newEmail);
  return NextResponse.json({ ok: true });
}