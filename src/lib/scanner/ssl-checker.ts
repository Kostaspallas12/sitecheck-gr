import https from "https";
import tls from "tls";
import { assertPublicDomain } from "@/lib/security/ssrf-guard";

export interface SSLResult {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysUntilExpiry?: number;
  protocol?: string;
  issues: string[];
  score: number;
}

export async function checkSSL(hostname: string): Promise<SSLResult> {
  try {
    await assertPublicDomain(hostname);
  } catch {
    return { valid: false, issues: ["Μη επιτρεπτό domain"], score: 0 };
  }
  return new Promise((resolve) => {
    const issues: string[] = [];

    const options = {
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate(true);
      const protocol = socket.getProtocol() ?? "";

      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        resolve({ valid: false, issues: ["Δεν βρέθηκε SSL πιστοποιητικό"], score: 0 });
        return;
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) issues.push("Το SSL πιστοποιητικό έχει λήξει");
      else if (daysUntilExpiry < 30) issues.push(`Το SSL λήγει σε ${daysUntilExpiry} μέρες`);

      if (protocol === "TLSv1" || protocol === "TLSv1.1") {
        issues.push(`Παλιά έκδοση TLS (${protocol}) — χρησιμοποιήστε TLS 1.2+`);
      }

      if (!socket.authorized) issues.push("Το πιστοποιητικό δεν είναι έγκυρο / δεν είναι αξιόπιστο");

      let score = 100;
      if (daysUntilExpiry < 0) score -= 50;
      else if (daysUntilExpiry < 30) score -= 20;
      if (protocol === "TLSv1" || protocol === "TLSv1.1") score -= 20;
      if (!socket.authorized) score -= 30;
      score = Math.max(0, score);

      socket.destroy();
      resolve({
        valid: socket.authorized,
        issuer: [cert.issuer?.O, cert.issuer?.CN].flat().find((v) => typeof v === "string"),
        subject: [cert.subject?.CN].flat().find((v) => typeof v === "string"),
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        daysUntilExpiry,
        protocol,
        issues,
        score,
      });
    });

    socket.on("error", () => {
      resolve({ valid: false, issues: ["Αδύνατη σύνδεση SSL / Δεν υπάρχει HTTPS"], score: 0 });
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      resolve({ valid: false, issues: ["Timeout κατά τον έλεγχο SSL"], score: 0 });
    });
  });
}
