import { cookies } from "next/headers";
import { adminAuth, db } from "./firebase";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = (await cookies()).get("__session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const email = decoded.email ?? null;

    // Fetch photoURL from Firestore (base64 avatar stored there)
    let photoURL: string | null = decoded.picture ?? null;
    if (email) {
      const userDoc = await db.collection("users").doc(email).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.photoURL) photoURL = data.photoURL as string;
      }
    }

    return {
      uid: decoded.uid,
      email,
      displayName: decoded.name ?? null,
      photoURL,
    };
  } catch {
    return null;
  }
}