import { NextRequest, NextResponse } from "next/server";
import { findSiteById, updateSite } from "@/lib/db";
import { verifyDNSTxtRecord, verifyMetaTag, verifyFileUpload } from "@/lib/scanner/dns-verify";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!checkRateLimit(`verify:${getClientIP(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Υπερβολικά πολλά αιτήματα. Δοκιμάστε σε λίγο." }, { status: 429 });
  }

  const { siteId } = await params;
  const site = await findSiteById(siteId);

  if (!site) {
    return NextResponse.json({ error: "Site δεν βρέθηκε" }, { status: 404 });
  }

  if (site.verified) {
    return NextResponse.json({ verified: true, message: "Ήδη επαληθευμένο" });
  }

  let result: { verified: boolean; error?: string };

  switch (site.verifyMethod) {
    case "dns":
      result = await verifyDNSTxtRecord(site.domain, site.verifyToken);
      break;
    case "meta":
      result = await verifyMetaTag(`https://${site.domain}`, site.verifyToken);
      break;
    case "file":
      result = await verifyFileUpload(site.domain, site.verifyToken);
      break;
    default:
      return NextResponse.json({ error: "Άγνωστη μέθοδος επαλήθευσης" }, { status: 400 });
  }

  if (result.verified) {
    await updateSite(siteId, { verified: true });
    return NextResponse.json({ verified: true, message: "Επαλήθευση επιτυχής!" });
  }

  return NextResponse.json({
    verified: false,
    error: result.error ?? "Το token δεν βρέθηκε. Ελέγξτε ότι έχετε προσθέσει σωστά το record.",
  });
}
