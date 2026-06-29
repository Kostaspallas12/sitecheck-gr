import { NextRequest, NextResponse } from "next/server";
import { findScanWithResult } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const scan = await findScanWithResult(scanId);

  if (!scan) {
    return NextResponse.json({ error: "Scan δεν βρέθηκε" }, { status: 404 });
  }

  return NextResponse.json({
    id: scan.id,
    domain: scan.site.domain,
    status: scan.status,
    finishedAt: scan.finishedAt,
    result: scan.result,
  });
}
