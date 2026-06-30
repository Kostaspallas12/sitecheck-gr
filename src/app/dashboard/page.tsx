import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getSitesByUserId, getLatestCompletedScan, getScansHistory } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const lang = ((await cookies()).get("lang")?.value ?? "en") as Lang;
  const userId = user.email ?? user.uid;

  const sites = await getSitesByUserId(userId);

  const sitesWithData = await Promise.all(
    sites.map(async (site) => {
      const [latest, history] = await Promise.all([
        getLatestCompletedScan(site.id),
        getScansHistory(site.id, 6),
      ]);
      return { site, latest, history };
    })
  );

  return (
    <DashboardClient
      user={{ name: user.displayName, email: user.email }}
      sites={sitesWithData.map(({ site, latest, history }) => ({
        id: site.id,
        domain: site.domain,
        verified: site.verified,
        latest: latest
          ? {
              scanId: latest.scanId,
              createdAt: latest.createdAt.toISOString(),
              scores: latest.scores,
            }
          : null,
        history: history.map((h) => ({
          scanId: h.scanId,
          createdAt: h.createdAt.toISOString(),
          scores: h.scores,
        })),
      }))}
      lang={lang}
    />
  );
}
