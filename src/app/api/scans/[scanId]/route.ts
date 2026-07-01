import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ scanId: string }> }) {
  try {
    const { scanId } = await params;
    const snap = await db.collection("scans").doc(scanId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = snap.data()!;

    // If logged in, verify the scan belongs to one of their sites
    const user = await getSessionUser();
    if (user?.email) {
      const siteSnap = await db.collection("sites").doc(data.siteId).get();
      if (siteSnap.exists && siteSnap.data()!.userId !== user.email) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ status: data.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
