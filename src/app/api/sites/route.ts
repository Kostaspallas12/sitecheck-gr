import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, findSiteByDomainAndUser, createSite, updateSite } from "@/lib/db";
import { randomUUID } from "crypto";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limiter";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`sites:${getClientIP(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Υπερβολικά πολλά αιτήματα. Δοκιμάστε σε λίγο." }, { status: 429 });
  }

  try {
    const { domain, email } = await req.json();
    const verifyMethod = "meta";

    if (!domain || !email) {
      return NextResponse.json({ error: "domain και email είναι υποχρεωτικά" }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Μη έγκυρη διεύθυνση email" }, { status: 400 });
    }

    const hostname = new URL(`https://${domain.replace(/^https?:\/\//, "")}`).hostname;

    const user = await findOrCreateUser(email);

    const existing = await findSiteByDomainAndUser(hostname, user.id);

    if (existing) {
      if (existing.verifyMethod !== verifyMethod) {
        const newToken = randomUUID();
        await updateSite(existing.id, { verifyMethod, verifyToken: newToken, verified: false });
        return NextResponse.json({ siteId: existing.id, verifyToken: newToken, verifyMethod, verified: false });
      }
      return NextResponse.json({
        siteId: existing.id,
        verifyToken: existing.verifyToken,
        verifyMethod: existing.verifyMethod,
        verified: existing.verified,
      });
    }

    const site = await createSite({
      domain: hostname,
      userId: user.id,
      verifyToken: randomUUID(),
      verifyMethod,
    });

    return NextResponse.json({ siteId: site.id, verifyToken: site.verifyToken, verifyMethod, verified: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Εσωτερικό σφάλμα" }, { status: 500 });
  }
}
