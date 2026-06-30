import { cookies } from "next/headers";
import { adminAuth } from "./firebase";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = (await cookies()).get("__session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}