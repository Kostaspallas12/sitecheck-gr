import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";


// ── USERS ──────────────────────────────────────────────────────────────────────

export async function findOrCreateUser(email: string) {
  const ref = db.collection("users").doc(email);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ email, createdAt: Timestamp.now() });
  }
  return { id: email, email };
}

// ── SITES ──────────────────────────────────────────────────────────────────────

export interface SiteDoc {
  id: string;
  domain: string;
  userId: string;
  verified: boolean;
  verifyToken: string;
  verifyMethod: string;
  // uptime
  uptimeMonitoring?: boolean;
  uptimeStatus?: "up" | "down";
  uptimeCheckedAt?: Timestamp;
  uptimeResponseTime?: number;
  downtimeSince?: Timestamp;
}


export async function findSiteByDomainAndUser(domain: string, userId: string): Promise<SiteDoc | null> {
  const snap = await db.collection("sites")
    .where("domain", "==", domain)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<SiteDoc, "id">) };
}

export async function findSiteById(id: string): Promise<SiteDoc | null> {
  const snap = await db.collection("sites").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<SiteDoc, "id">) };
}

export async function createSite(data: {
  domain: string;
  userId: string;
  verifyToken: string;
  verifyMethod: string;
}): Promise<SiteDoc> {
  const ref = db.collection("sites").doc();
  await ref.set({ ...data, verified: false, createdAt: Timestamp.now() });
  return { id: ref.id, ...data, verified: false };
}

export async function updateSite(id: string, data: Partial<Pick<SiteDoc, "verified" | "verifyToken" | "verifyMethod" | "uptimeMonitoring">>) {
  await db.collection("sites").doc(id).update(data);
}

// ── SCANS ──────────────────────────────────────────────────────────────────────

export type ScanStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface ScanDoc {
  id: string;
  siteId: string;
  status: ScanStatus;
  createdAt: Timestamp;
  finishedAt?: Timestamp;
}

export async function findRunningScan(siteId: string): Promise<Pick<ScanDoc, "id" | "status"> | null> {
  const snap = await db.collection("scans")
    .where("siteId", "==", siteId)
    .where("status", "in", ["PENDING", "RUNNING"])
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, status: doc.data().status };
}

export async function createScan(siteId: string): Promise<{ id: string }> {
  const ref = db.collection("scans").doc();
  await ref.set({ siteId, status: "RUNNING", createdAt: Timestamp.now() });
  return { id: ref.id };
}

export async function updateScan(id: string, data: { status: ScanStatus; finishedAt?: Date }) {
  await db.collection("scans").doc(id).update({
    status: data.status,
    ...(data.finishedAt ? { finishedAt: Timestamp.fromDate(data.finishedAt) } : {}),
  });
}

// ── SCAN RESULTS ───────────────────────────────────────────────────────────────

export interface ScanResultDoc {
  scanId: string;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  bestPracticesScore?: number;
  securityScore?: number;
  lighthouseData?: string;
  securityHeaders?: string;
  sslData?: string;
  issues?: string;
  extendedAudit?: string;
}

export async function createScanResult(data: Omit<ScanResultDoc, never>) {
  await db.collection("scan_results").doc(data.scanId).set(data);
}

// ── DASHBOARD QUERIES ──────────────────────────────────────────────────────────

export async function getSitesByUserId(userId: string): Promise<SiteDoc[]> {
  const snap = await db.collection("sites")
    .where("userId", "==", userId)
    .get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<SiteDoc, "id">) }))
    .sort(() => 0); // order doesn't matter for display
}

export interface ScanSummary {
  scanId: string;
  status: ScanStatus;
  createdAt: Date;
  finishedAt?: Date;
  scores?: {
    performance?: number;
    seo?: number;
    accessibility?: number;
    bestPractices?: number;
    security?: number;
  };
}

export async function getLatestCompletedScan(siteId: string): Promise<ScanSummary | null> {
  const snap = await db.collection("scans")
    .where("siteId", "==", siteId)
    .where("status", "==", "DONE")
    .get();
  if (snap.empty) return null;
  // Sort in memory — avoids needing a Firestore composite index
  const sorted = snap.docs.sort((a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis());
  const doc = sorted[0];
  const data = doc.data();
  const resultSnap = await db.collection("scan_results").doc(doc.id).get();
  const result = resultSnap.exists ? resultSnap.data()! : null;
  return {
    scanId: doc.id,
    status: data.status,
    createdAt: data.createdAt.toDate(),
    finishedAt: data.finishedAt?.toDate(),
    scores: result ? {
      performance: result.performanceScore,
      seo: result.seoScore,
      accessibility: result.accessibilityScore,
      bestPractices: result.bestPracticesScore,
      security: result.securityScore,
    } : undefined,
  };
}

export async function getScansHistory(siteId: string, limit = 8): Promise<ScanSummary[]> {
  const snap = await db.collection("scans")
    .where("siteId", "==", siteId)
    .where("status", "==", "DONE")
    .get();
  if (snap.empty) return [];
  // Sort newest first in memory, take top N
  snap.docs.sort((a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis());
  snap.docs.splice(limit);
  return Promise.all(snap.docs.map(async (doc) => {
    const data = doc.data();
    const resultSnap = await db.collection("scan_results").doc(doc.id).get();
    const result = resultSnap.exists ? resultSnap.data()! : null;
    return {
      scanId: doc.id,
      status: data.status as ScanStatus,
      createdAt: data.createdAt.toDate(),
      finishedAt: data.finishedAt?.toDate(),
      scores: result ? {
        performance: result.performanceScore,
        seo: result.seoScore,
        accessibility: result.accessibilityScore,
        bestPractices: result.bestPracticesScore,
        security: result.securityScore,
      } : undefined,
    };
  }));
}

export async function getUserDoc(email: string) {
  const snap = await db.collection("users").doc(email).get();
  if (!snap.exists) return null;
  return snap.data() as { email: string; paused?: boolean; weeklyRescan?: boolean; createdAt: Timestamp };
}

export async function setUserPaused(email: string, paused: boolean) {
  await db.collection("users").doc(email).set({ paused }, { merge: true });
}

export async function setWeeklyRescan(email: string, enabled: boolean) {
  await db.collection("users").doc(email).set({ weeklyRescan: enabled }, { merge: true });
}

export async function deleteUserData(email: string) {
  const sitesSnap = await db.collection("sites").where("userId", "==", email).get();
  const batch = db.batch();
  for (const siteDoc of sitesSnap.docs) {
    const scansSnap = await db.collection("scans").where("siteId", "==", siteDoc.id).get();
    for (const scanDoc of scansSnap.docs) {
      batch.delete(db.collection("scan_results").doc(scanDoc.id));
      batch.delete(scanDoc.ref);
    }
    batch.delete(siteDoc.ref);
  }
  batch.delete(db.collection("users").doc(email));
  await batch.commit();
}

export async function migrateUserEmail(oldEmail: string, newEmail: string) {
  const batch = db.batch();
  const oldUserSnap = await db.collection("users").doc(oldEmail).get();
  if (oldUserSnap.exists) {
    const data = oldUserSnap.data()!;
    batch.set(db.collection("users").doc(newEmail), { ...data, email: newEmail });
    batch.delete(db.collection("users").doc(oldEmail));
  }
  const sitesSnap = await db.collection("sites").where("userId", "==", oldEmail).get();
  for (const siteDoc of sitesSnap.docs) {
    batch.update(siteDoc.ref, { userId: newEmail });
  }
  await batch.commit();
}

export async function getSitesForWeeklyRescan(): Promise<Array<{ siteId: string; domain: string; userId: string }>> {
  const usersSnap = await db.collection("users").where("weeklyRescan", "==", true).where("paused", "!=", true).get();
  const results: Array<{ siteId: string; domain: string; userId: string }> = [];
  for (const userDoc of usersSnap.docs) {
    const email = userDoc.id;
    const sitesSnap = await db.collection("sites").where("userId", "==", email).where("verified", "==", true).get();
    for (const siteDoc of sitesSnap.docs) {
      results.push({ siteId: siteDoc.id, domain: siteDoc.data().domain as string, userId: email });
    }
  }
  return results;
}

// ── UPTIME MONITORING ──────────────────────────────────────────────────────────

export async function getAllVerifiedSites() {
  const snap = await db.collection("sites").where("verified", "==", true).get();
  return snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        domain: data.domain as string,
        userId: data.userId as string,
        uptimeMonitoring: (data.uptimeMonitoring as boolean | undefined) ?? true,
        uptimeStatus: (data.uptimeStatus as "up" | "down" | undefined) ?? null,
        downtimeSince: data.downtimeSince ? (data.downtimeSince as Timestamp).toDate() : null,
      };
    })
    .filter((s) => s.uptimeMonitoring !== false);
}

export async function saveUptimeCheck(
  siteId: string,
  status: "up" | "down",
  responseTime: number,
  statusCode: number | null
) {
  await db.collection("uptime_checks").add({
    siteId,
    status,
    responseTime,
    statusCode,
    checkedAt: Timestamp.now(),
  });
}

export async function updateSiteUptimeStatus(
  siteId: string,
  status: "up" | "down",
  responseTime: number,
  downtimeSince: Date | null
) {
  await db.collection("sites").doc(siteId).update({
    uptimeStatus: status,
    uptimeCheckedAt: Timestamp.now(),
    uptimeResponseTime: responseTime,
    downtimeSince: downtimeSince ? Timestamp.fromDate(downtimeSince) : null,
  });
}

export async function getUptimeChecks(siteId: string, limit = 24) {
  const snap = await db.collection("uptime_checks")
    .where("siteId", "==", siteId)
    .get();
  if (snap.empty) return [];
  return snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        status: data.status as "up" | "down",
        responseTime: data.responseTime as number,
        checkedAt: (data.checkedAt as Timestamp).toDate(),
      };
    })
    .sort((a, b) => b.checkedAt.getTime() - a.checkedAt.getTime())
    .slice(0, limit);
}

// ── COMBINED QUERY FOR RESULTS PAGE ────────────────────────────────────────────

export async function findScanWithResult(scanId: string) {
  const [scanSnap, resultSnap] = await Promise.all([
    db.collection("scans").doc(scanId).get(),
    db.collection("scan_results").doc(scanId).get(),
  ]);

  if (!scanSnap.exists) return null;

  const scanData = scanSnap.data() as Omit<ScanDoc, "id">;
  const result = resultSnap.exists ? (resultSnap.data() as ScanResultDoc) : null;

  const siteSnap = await db.collection("sites").doc(scanData.siteId).get();
  const siteData = siteSnap.exists ? siteSnap.data()! : null;
  const domain = siteData ? (siteData.domain as string) : "unknown";
  const userEmail = siteData ? (siteData.userId as string) : null;

  return {
    id: scanSnap.id,
    siteId: scanData.siteId,
    status: scanData.status,
    finishedAt: scanData.finishedAt?.toDate() ?? null,
    result,
    site: { domain, userEmail },
  };
}
