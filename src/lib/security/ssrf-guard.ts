import dns from "dns";
import dnsPromises from "dns/promises";
import http from "http";
import https from "https";
import net from "net";
import axios, { type AxiosRequestConfig } from "axios";

// Προστασία SSRF: ο scanner επισκέπτεται sites που δίνουν οι χρήστες, οπότε δεν πρέπει ποτέ να
// συνδεθεί σε εσωτερική/ειδική διεύθυνση (localhost, ιδιωτικά δίκτυα, metadata του cloud κ.λπ.).
//
// Ο έλεγχος γίνεται τη στιγμή της ΣΥΝΔΕΣΗΣ (safeLookup) και σε ΚΑΘΕ redirect (beforeRedirect),
// όχι μόνο μία φορά στην αρχή: έτσι δεν περνά ούτε redirect προς 127.0.0.1 ούτε «DNS rebinding»
// (ένα domain που την πρώτη φορά απαντά δημόσια IP και τη δεύτερη εσωτερική).

const BLOCKED_MSG = "Μη επιτρεπτό domain";

const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ["0.0.0.0", 8], // «αυτό το δίκτυο» (και 0.0.0.0)
  ["10.0.0.0", 8], // ιδιωτικό
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local (και metadata του cloud: 169.254.169.254)
  ["172.16.0.0", 12], // ιδιωτικό
  ["192.0.0.0", 24], // IETF
  ["192.0.2.0", 24], // τεκμηρίωση
  ["192.88.99.0", 24], // 6to4 relay
  ["192.168.0.0", 16], // ιδιωτικό
  ["198.18.0.0", 15], // benchmark
  ["198.51.100.0", 24], // τεκμηρίωση
  ["203.0.113.0", 24], // τεκμηρίωση
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // δεσμευμένο + broadcast
] as const) blocked.addSubnet(addr, prefix, "ipv4");
for (const [addr, prefix] of [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  // (όχι ::ffff:0:0/96 εδώ: το BlockList τον εφαρμόζει σε ΟΛΕΣ τις IPv4· οι IPv4-mapped ελέγχονται στο isPrivateIP)
  ["64:ff9b::", 96], // NAT64
  ["100::", 64], // discard
  ["2001:db8::", 32], // τεκμηρίωση
  ["2002::", 16], // 6to4
  ["fc00::", 7], // unique local (fc../fd..)
  ["fe80::", 10], // link-local
  ["ff00::", 8], // multicast
] as const) blocked.addSubnet(addr, prefix, "ipv6");

/** true αν η διεύθυνση ΔΕΝ είναι δημόσια (ή δεν είναι καν διεύθυνση IP). */
export function isPrivateIP(ip: string): boolean {
  const clean = ip.trim().replace(/^\[|\]$/g, "").split("%")[0];
  const family = net.isIP(clean);
  if (family === 4) return blocked.check(clean, "ipv4");
  if (family === 6) {
    // IPv4-mapped (::ffff:127.0.0.1 ή ::ffff:7f00:1): ελέγχεται η IPv4 που περιέχει.
    const dotted = clean.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    if (dotted) return isPrivateIP(dotted[1]);
    const hex = clean.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
    if (hex) {
      const hi = parseInt(hex[1], 16), lo = parseInt(hex[2], 16);
      return isPrivateIP(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    return blocked.check(clean, "ipv6");
  }
  return true;
}

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal", "metadata", "instance-data"]);

function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  return BLOCKED_HOSTNAMES.has(h) || /\.(localhost|local|internal|intranet|lan|home\.arpa)$/.test(h);
}

/** Έλεγχος πριν ξεκινήσει ένα scan: το domain δεν πρέπει να δείχνει σε εσωτερική διεύθυνση. */
export async function assertPublicDomain(domain: string): Promise<void> {
  const host = domain.toLowerCase().trim().replace(/^\[|\]$/g, "");

  if (!host || isBlockedHostname(host)) throw new Error(BLOCKED_MSG);

  if (net.isIP(host)) {
    if (isPrivateIP(host)) throw new Error(BLOCKED_MSG);
    return;
  }

  const [v4, v6] = await Promise.allSettled([dnsPromises.resolve4(host), dnsPromises.resolve6(host)]);
  const ips: string[] = [];
  if (v4.status === "fulfilled") ips.push(...v4.value);
  if (v6.status === "fulfilled") ips.push(...v6.value);
  if (ips.some(isPrivateIP)) throw new Error(BLOCKED_MSG);
  // Αποτυχία DNS: ο downstream έλεγχος θα αποτύχει φυσιολογικά (και η safeLookup μπλοκάρει ούτως ή άλλως).
}

/** Ο έλεγχος τη στιγμή της σύνδεσης: αν ΟΠΟΙΑΔΗΠΟΤΕ IP του ονόματος είναι εσωτερική, η σύνδεση απορρίπτεται. */
function safeLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void,
): void {
  if (isBlockedHostname(hostname)) {
    callback(Object.assign(new Error(BLOCKED_MSG), { code: "EBLOCKED" }), "", 0);
    return;
  }
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    const list = addresses as dns.LookupAddress[];
    if (!list.length || list.some((a) => isPrivateIP(a.address))) {
      return callback(Object.assign(new Error(BLOCKED_MSG), { code: "EBLOCKED" }), "", 0);
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

function assertSafeUrl(raw: string | URL): void {
  const u = new URL(String(raw));
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error(BLOCKED_MSG);
  const host = u.hostname.replace(/^\[|\]$/g, "");
  // Μια σκέτη IP στη διεύθυνση δεν περνά από lookup, οπότε ελέγχεται εδώ.
  if (isBlockedHostname(host) || (net.isIP(host) && isPrivateIP(host))) throw new Error(BLOCKED_MSG);
}

/**
 * Το μόνο HTTP client που πρέπει να χρησιμοποιεί ο scanner για διευθύνσεις χρηστών.
 * Κάθε σύνδεση (και κάθε redirect) ελέγχεται ότι πάει σε δημόσια διεύθυνση.
 */
export const safeHttp = axios.create({
  httpAgent: new http.Agent({ lookup: safeLookup } as http.AgentOptions),
  httpsAgent: new https.Agent({ lookup: safeLookup } as https.AgentOptions),
  lookup: safeLookup,
  maxRedirects: 5,
  maxContentLength: 5 * 1024 * 1024,
  beforeRedirect: (options: Record<string, unknown>) => {
    const host = String(options.hostname ?? options.host ?? "");
    const protocol = String(options.protocol ?? "https:");
    assertSafeUrl(`${protocol}//${host.includes(":") && !host.startsWith("[") ? `[${host}]` : host}/`);
  },
} as AxiosRequestConfig);

safeHttp.interceptors.request.use((config) => {
  assertSafeUrl(new URL(config.url ?? "", config.baseURL));
  return config;
});
