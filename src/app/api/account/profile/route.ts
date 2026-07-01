import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { adminAuth, db } from "@/lib/firebase";

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName } = await req.json();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

  await Promise.all([
    adminAuth.updateUser(user.uid, { displayName: displayName ?? undefined }),
    db.collection("users").doc(user.email).set({ firstName: firstName ?? "", lastName: lastName ?? "", displayName }, { merge: true }),
  ]);

  return NextResponse.json({ ok: true, displayName });
}