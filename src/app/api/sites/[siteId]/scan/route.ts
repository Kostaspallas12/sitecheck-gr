import { NextRequest, NextResponse, after } from "next/server";
import { findSiteById, findRunningScan, createScan } from "@/lib/db";
import { runAndSaveScan } from "@/lib/scanner/run-and-save";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limiter";
import { getSessionUser } from "@/lib/auth-server";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!checkRateLimit(`scan:${getClientIP(req)}`, 3, 60_000)) {
    return NextResponse.json({ error: "Υπερβολικά πολλά αιτήματα. Δοκιμάστε σε λίγο." }, { status: 429 });
  }

  const user = await getSessionUser();

  const { siteId } = await params;
  const site = await findSiteById(siteId);

  if (!site) {
    return NextResponse.json({ error: "Site δεν βρέθηκε" }, { status: 404 });
  }

  // If logged in, must own the site
  if (user?.email && site.userId !== user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!site.verified) {
    return NextResponse.json(
      { error: "Το site δεν έχει επαληθευτεί. Επαληθεύστε πρώτα την ιδιοκτησία σας." },
      { status: 403 }
    );
  }

  const running = await findRunningScan(siteId);
  if (running) {
    return NextResponse.json({ scanId: running.id, status: running.status });
  }

  const scan = await createScan(siteId);

  // after() keeps the serverless function alive until the scan finishes (up to maxDuration)
  after(() => runAndSaveScan(scan.id, site.domain));

  return NextResponse.json({ scanId: scan.id, status: "RUNNING" }, { status: 202 });
}
