import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ scanId: string }> }) {
  try {
    const { scanId } = await params;
    const snap = await db.collection("scans").doc(scanId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = snap.data()!;
    return NextResponse.json({ status: data.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
