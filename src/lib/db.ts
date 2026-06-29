import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

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

export async function updateSite(id: string, data: Partial<Pick<SiteDoc, "verified" | "verifyToken" | "verifyMethod">>) {
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
}

export async function createScanResult(data: Omit<ScanResultDoc, never>) {
  await db.collection("scan_results").doc(data.scanId).set(data);
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
  const domain = siteSnap.exists ? (siteSnap.data()!.domain as string) : "unknown";

  return {
    id: scanSnap.id,
    siteId: scanData.siteId,
    status: scanData.status,
    finishedAt: scanData.finishedAt?.toDate() ?? null,
    result,
    site: { domain },
  };
}
