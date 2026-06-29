import { scannerQueue, ScanJobData } from "@/lib/queue/scanner-queue";
import { runFullScan } from "@/lib/scanner";
import { prisma } from "@/lib/db";

scannerQueue.process(async (job) => {
  const { scanId, url } = job.data as ScanJobData;

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "RUNNING" },
  });

  try {
    const result = await runFullScan(url);

    await prisma.scanResult.create({
      data: {
        scanId,
        performanceScore: result.scores.performance,
        seoScore: result.scores.seo,
        accessibilityScore: result.scores.accessibility,
        bestPracticesScore: result.scores.bestPractices,
        securityScore: result.scores.security,
        lighthouseData: result.lighthouse as object,
        securityHeaders: result.securityHeaders as object,
        sslData: result.ssl as object,
        issues: result.lighthouse.issues as object,
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "DONE", finishedAt: new Date() },
    });
  } catch (err) {
    console.error(`[Scanner] Scan ${scanId} failed:`, err);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "FAILED", finishedAt: new Date() },
    });
    throw err;
  }
});

console.log("[Scanner Worker] Listening for scan jobs...");
