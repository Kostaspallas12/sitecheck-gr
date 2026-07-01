import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { base64 } = await req.json();
  if (!base64 || !base64.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  // ~10KB max after client compression — safe for Firestore
  const bytes = Buffer.byteLength(base64, "utf8");
  if (bytes > 60_000) {
    return NextResponse.json({ error: "Image too large" }, { status: 400 });
  }

  await db.collection("users").doc(user.email).set({ photoURL: base64 }, { merge: true });

  return NextResponse.json({ ok: true, photoURL: base64 });
}