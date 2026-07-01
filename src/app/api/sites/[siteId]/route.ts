import { NextRequest, NextResponse } from "next/server";
import { findSiteById, updateSite } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const user = await getSessionUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await findSiteById(siteId);
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (site.userId !== user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    domain: site.domain,
    verifyToken: site.verifyToken,
    verifyMethod: site.verifyMethod,
    verified: site.verified,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const user = await getSessionUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await findSiteById(siteId);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (site.userId !== user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (typeof body.uptimeMonitoring === "boolean") {
    await updateSite(siteId, { uptimeMonitoring: body.uptimeMonitoring });
  }

  return NextResponse.json({ ok: true });
}