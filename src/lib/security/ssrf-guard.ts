import dns from "dns/promises";
import net from "net";

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",
]);

function isPrivateIP(ip: string): boolean {
  return PRIVATE_RANGES.some((re) => re.test(ip));
}

export async function assertPublicDomain(domain: string): Promise<void> {
  const lower = domain.toLowerCase().trim();

  if (BLOCKED_HOSTNAMES.has(lower)) {
    throw new Error("Μη επιτρεπτό domain");
  }

  if (net.isIP(domain)) {
    if (isPrivateIP(domain)) throw new Error("Μη επιτρεπτό domain");
    return;
  }

  try {
    const [v4, v6] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
    ]);

    const ips: string[] = [];
    if (v4.status === "fulfilled") ips.push(...v4.value);
    if (v6.status === "fulfilled") ips.push(...v6.value);

    for (const ip of ips) {
      if (isPrivateIP(ip)) throw new Error("Μη επιτρεπτό domain");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Μη επιτρεπτό domain") throw e;
    // DNS failure — ο downstream έλεγχος θα αποτύχει φυσιολογικά
  }
}
