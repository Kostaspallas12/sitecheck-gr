import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { adminAuth, db } from "@/lib/firebase";
import { getStorage } from "firebase-admin/storage";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `avatars/${user.uid}/avatar.${ext}`;

  const bucket = getStorage().bucket();
  const fileRef = bucket.file(path);
  await fileRef.save(buffer, { metadata: { contentType: file.type } });
  await fileRef.makePublic();

  const photoURL = `https://storage.googleapis.com/${bucket.name}/${path}`;

  await Promise.all([
    adminAuth.updateUser(user.uid, { photoURL }),
    db.collection("users").doc(user.email).set({ photoURL }, { merge: true }),
  ]);

  return NextResponse.json({ ok: true, photoURL });
}