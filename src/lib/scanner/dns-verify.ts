import dns from "dns/promises";
import { assertPublicDomain } from "@/lib/security/ssrf-guard";

export async function verifyDNSTxtRecord(
  domain: string,
  token: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    await assertPublicDomain(domain);
    const records = await dns.resolveTxt(domain);
    const flat = records.flat();
    const verified = flat.some((r) => r === `site-verify=${token}`);
    return { verified };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "DNS lookup απέτυχε";
    return { verified: false, error: msg };
  }
}

export async function verifyMetaTag(
  url: string,
  token: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    const hostname = new URL(url).hostname;
    await assertPublicDomain(hostname);
    const { default: axios } = await import("axios");
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "SiteAuditor/1.0" },
    });
    const html: string = res.data;
    const verified = html.includes(`content="site-verify=${token}"`);
    return { verified };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "HTTP request απέτυχε";
    return { verified: false, error: msg };
  }
}

export async function verifyFileUpload(
  domain: string,
  token: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    await assertPublicDomain(domain);
    const { default: axios } = await import("axios");
    const url = `https://${domain}/.well-known/site-verify-${token}.txt`;
    const res = await axios.get(url, { timeout: 10000 });
    const verified = String(res.data).trim() === token;
    return { verified };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Το αρχείο επαλήθευσης δεν βρέθηκε";
    return { verified: false, error: msg };
  }
}
