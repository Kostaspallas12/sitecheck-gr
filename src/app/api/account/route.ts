import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { adminAuth } from "@/lib/firebase";
import { deleteUserData } from "@/lib/db";

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete all Firestore data
    if (user.email) await deleteUserData(user.email);

    // Delete Firebase Auth user
    await adminAuth.deleteUser(user.uid);

    // Clear session cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", "", { maxAge: 0, path: "/" });
    return res;
  } catch (e) {
    console.error("[account/delete]", e);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
