import axios from "axios";
import { assertPublicDomain } from "@/lib/security/ssrf-guard";

export interface TechItem {
  name: string;
  category: "cms" | "framework" | "server" | "cdn" | "analytics" | "language" | "library";
  version?: string;
}

export interface CookieAuditItem {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
  issues: string[];
}

export interface ExposedFileItem {
  path: string;
  risk: "critical" | "high" | "medium";
  description: string;
}

export interface ExtendedAuditResult {
  technologies: TechItem[];
  cookies: CookieAuditItem[];
  infoLeaks: Array<{ header: string; value: string; description: string }>;
  exposedFiles: ExposedFileItem[];
  sitemapFound: boolean;
  securityTxtFound: boolean;
  cors: { allowOrigin: string; allowCredentials: boolean; risky: boolean } | null;
  compression: { enabled: boolean; encoding?: string };
  openGraph: { title?: string; description?: string; image?: string } | null;
  twitterCard: { card?: string; title?: string } | null;
  schemaOrg: boolean;
  redirectsToHttps: boolean;
  directoryListing: boolean;
}

const EXPOSED_PATHS: Array<{ path: string; risk: ExposedFileItem["risk"]; description: string }> = [
  { path: "/.git/HEAD",          risk: "critical", description: "Git repository exposed — full source code can be extracted" },
  { path: "/.env",               risk: "critical", description: ".env file exposed — contains API keys and credentials" },
  { path: "/.env.local",         risk: "critical", description: ".env.local exposed — contains credentials" },
  { path: "/.env.production",    risk: "critical", description: ".env.production exposed — contains production credentials" },
  { path: "/backup.zip",         risk: "critical", description: "Backup archive exposed" },
  { path: "/backup.sql",         risk: "critical", description: "Database backup exposed" },
  { path: "/db.sql",             risk: "critical", description: "Database dump exposed" },
  { path: "/dump.sql",           risk: "critical", description: "Database dump exposed" },
  { path: "/wp-config.php.bak",  risk: "critical", description: "WordPress config backup with DB credentials exposed" },
  { path: "/config.php.bak",     risk: "high",     description: "Config backup file exposed" },
  { path: "/config.old",         risk: "high",     description: "Old config file exposed" },
  { path: "/phpinfo.php",        risk: "high",     description: "PHP info page exposed — reveals full server config" },
  { path: "/test.php",           risk: "medium",   description: "Test file exposed on production" },
  { path: "/info.php",           risk: "medium",   description: "PHP info file exposed" },
  { path: "/server-status",      risk: "medium",   description: "Apache server status page exposed" },
];

function parseCookie(raw: string): CookieAuditItem {
  const parts = raw.split(";").map((p) => p.trim());
  const name = (parts[0] ?? "").split("=")[0].trim() || "unknown";
  const secure = parts.some((p) => p.toLowerCase() === "secure");
  const httpOnly = parts.some((p) => p.toLowerCase() === "httponly");
  const sameSitePart = parts.find((p) => p.toLowerCase().startsWith("samesite="));
  const sameSite = sameSitePart ? sameSitePart.split("=")[1] : undefined;
  const issues: string[] = [];
  if (!secure) issues.push("Missing Secure flag");
  if (!httpOnly) issues.push("Missing HttpOnly flag");
  if (!sameSite) issues.push("Missing SameSite attribute");
  else if (sameSite.toLowerCase() === "none" && !secure) issues.push("SameSite=None requires Secure flag");
  return { name, secure, httpOnly, sameSite, issues };
}

function detectTech(headers: Record<string, string>, html: string): TechItem[] {
  const items: TechItem[] = [];
  const seen = new Set<string>();
  const add = (item: TechItem) => {
    if (!seen.has(item.name)) { seen.add(item.name); items.push(item); }
  };

  const server = headers["server"] ?? "";
  if (/nginx/i.test(server))          add({ name: "Nginx",       category: "server",    version: server.match(/nginx\/([\d.]+)/i)?.[1] });
  if (/apache/i.test(server))         add({ name: "Apache",      category: "server",    version: server.match(/apache\/([\d.]+)/i)?.[1] });
  if (/microsoft-iis/i.test(server))  add({ name: "IIS",         category: "server",    version: server.match(/iis\/([\d.]+)/i)?.[1] });
  if (/cloudflare/i.test(server))     add({ name: "Cloudflare",  category: "cdn" });
  if (/litespeed/i.test(server))      add({ name: "LiteSpeed",   category: "server" });
  if (/openresty/i.test(server))      add({ name: "OpenResty",   category: "server" });
  if (/caddy/i.test(server))          add({ name: "Caddy",       category: "server" });

  if (headers["cf-ray"])                                              add({ name: "Cloudflare",     category: "cdn" });
  if (headers["x-vercel-id"] || headers["x-vercel-cache"])           add({ name: "Vercel",         category: "cdn" });
  if (headers["x-nf-request-id"])                                     add({ name: "Netlify",        category: "cdn" });
  if (headers["x-amz-cf-id"] || /cloudfront/i.test(headers["via"] ?? "")) add({ name: "AWS CloudFront", category: "cdn" });
  if (headers["x-fastly-request-id"])                                 add({ name: "Fastly",         category: "cdn" });
  if (headers["x-akamai-transformed"])                                add({ name: "Akamai",         category: "cdn" });

  const pb = headers["x-powered-by"] ?? "";
  const phpVer = pb.match(/php\/([\d.]+)/i)?.[1];
  if (phpVer)              add({ name: "PHP",        category: "language", version: phpVer });
  else if (/php/i.test(pb)) add({ name: "PHP",       category: "language" });
  if (/asp\.net/i.test(pb)) add({ name: "ASP.NET",   category: "language" });
  if (/express/i.test(pb)) { add({ name: "Express.js", category: "framework" }); add({ name: "Node.js", category: "language" }); }
  if (/next\.js/i.test(pb)) add({ name: "Next.js",   category: "framework" });

  const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1]
           ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i)?.[1]
           ?? "";
  if (/wordpress/i.test(gen)) {
    add({ name: "WordPress", category: "cms", version: gen.match(/wordpress ([\d.]+)/i)?.[1] });
    add({ name: "PHP", category: "language" });
  } else if (/joomla/i.test(gen))    add({ name: "Joomla",      category: "cms" });
  else if (/drupal/i.test(gen))      add({ name: "Drupal",      category: "cms",  version: gen.match(/drupal ([\d.]+)/i)?.[1] });
  else if (/wix/i.test(gen))         add({ name: "Wix",         category: "cms" });
  else if (/squarespace/i.test(gen)) add({ name: "Squarespace", category: "cms" });
  else if (/ghost/i.test(gen))       add({ name: "Ghost",       category: "cms" });
  else if (/gatsby/i.test(gen))      { add({ name: "Gatsby",   category: "framework" }); add({ name: "React", category: "library" }); }
  else if (/hugo/i.test(gen))        add({ name: "Hugo",        category: "framework" });
  else if (/webflow/i.test(gen))     add({ name: "Webflow",     category: "cms" });

  if (/\/wp-content\//i.test(html) || /\/wp-includes\//i.test(html)) {
    add({ name: "WordPress", category: "cms" }); add({ name: "PHP", category: "language" });
  }
  if (/drupalSettings|drupal\.js/i.test(html))                      add({ name: "Drupal",    category: "cms" });
  if (/joomla/i.test(html) && /\/components\/com_/i.test(html))     add({ name: "Joomla",    category: "cms" });
  if (/Mage\.|magento/i.test(html))                                  { add({ name: "Magento", category: "cms" }); add({ name: "PHP", category: "language" }); }
  if (/cdn\.shopify\.com/i.test(html))                               add({ name: "Shopify",   category: "cms" });

  if (/__NEXT_DATA__|_next\/static\//i.test(html))  { add({ name: "Next.js", category: "framework" }); add({ name: "React", category: "library" }); }
  if (/__nuxt|_nuxt\//i.test(html))                 { add({ name: "Nuxt.js", category: "framework" }); add({ name: "Vue.js", category: "library" }); }
  if (/ng-version|zone\.js/i.test(html))             add({ name: "Angular",  category: "framework" });
  if (/data-reactroot|react-dom/i.test(html))        add({ name: "React",    category: "library" });
  if (/vue\.min\.js|__vue_load_retry__/i.test(html)) add({ name: "Vue.js",   category: "library" });
  if (/___gatsby|gatsby-chunk/i.test(html))          { add({ name: "Gatsby", category: "framework" }); add({ name: "React", category: "library" }); }
  if (/sveltekit|@sveltejs/i.test(html))             add({ name: "SvelteKit", category: "framework" });
  else if (/svelte/i.test(html))                     add({ name: "Svelte",   category: "library" });
  if (/csrfmiddlewaretoken/i.test(html))             { add({ name: "Django", category: "framework" }); add({ name: "Python", category: "language" }); }
  if (/data-turbo|turbolinks/i.test(html))           { add({ name: "Ruby on Rails", category: "framework" }); add({ name: "Ruby", category: "language" }); }
  if (/laravel/i.test(html))                         { add({ name: "Laravel", category: "framework" }); add({ name: "PHP", category: "language" }); }

  const jqVer = html.match(/jquery[.\-]([\d.]+)(?:\.min)?\.js/i)?.[1];
  if (jqVer)                   add({ name: "jQuery",    category: "library", version: jqVer });
  else if (/jquery/i.test(html)) add({ name: "jQuery",  category: "library" });

  const bsVer = html.match(/bootstrap[.\-]([\d.]+)(?:\.min)?\.(?:js|css)/i)?.[1];
  if (/bootstrap/i.test(html)) add({ name: "Bootstrap", category: "library", version: bsVer });
  if (/tailwindcss|tailwind\.min\.css/i.test(html)) add({ name: "Tailwind CSS", category: "library" });

  if (/gtag\.js|googletag|google-analytics\.com\/analytics/i.test(html)) add({ name: "Google Analytics",  category: "analytics" });
  if (/googletagmanager\.com\/gtm|GTM-[A-Z0-9]+/i.test(html))           add({ name: "Google Tag Manager", category: "analytics" });
  if (/fbevents\.js|facebook\.net\/.*\/fbq/i.test(html))                 add({ name: "Facebook Pixel",     category: "analytics" });
  if (/hotjar\.com|hjSiteSettings/i.test(html))                          add({ name: "Hotjar",             category: "analytics" });
  if (/clarity\.ms/i.test(html))                                         add({ name: "Microsoft Clarity",  category: "analytics" });
  if (/hs-scripts\.com|hubspot\.com\/hs\//i.test(html))                  add({ name: "HubSpot",            category: "analytics" });
  if (/intercomcdn\.com|intercom\.io/i.test(html))                       add({ name: "Intercom",           category: "analytics" });
  if (/crisp\.chat/i.test(html))                                         add({ name: "Crisp",              category: "analytics" });
  if (/tawk\.to/i.test(html))                                            add({ name: "Tawk.to",            category: "analytics" });
  if (/mouseflow\.com/i.test(html))                                      add({ name: "Mouseflow",          category: "analytics" });

  return items;
}

function extractOG(html: string): ExtendedAuditResult["openGraph"] {
  const get = (prop: string) =>
    html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']{1,300})["']`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']{1,300})["'][^>]+property=["']${prop}["']`, "i"))?.[1];
  const title = get("og:title");
  const description = get("og:description");
  const image = get("og:image");
  if (!title && !description) return null;
  return { title, description, image };
}

function extractTwitter(html: string): ExtendedAuditResult["twitterCard"] {
  const get = (name: string) =>
    html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']{1,300})["']`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']${name}["']`, "i"))?.[1];
  const card = get("twitter:card");
  const title = get("twitter:title");
  if (!card && !title) return null;
  return { card, title };
}

const AGENT = "Mozilla/5.0 (compatible; SiteAuditor/1.0)";

export async function runExtendedAudit(url: string): Promise<ExtendedAuditResult> {
  const origin = new URL(url).origin;
  const hostname = new URL(url).hostname;
  const empty: ExtendedAuditResult = {
    technologies: [], cookies: [], infoLeaks: [], exposedFiles: [],
    sitemapFound: false, securityTxtFound: false, cors: null,
    compression: { enabled: false }, openGraph: null, twitterCard: null,
    schemaOrg: false, redirectsToHttps: false, directoryListing: false,
  };

  try { await assertPublicDomain(hostname); } catch { return empty; }

  // ── Main page fetch ──────────────────────────────────────────────────────────
  let headers: Record<string, string> = {};
  let rawSetCookie: string[] = [];
  let html = "";
  let redirectsToHttps = false;

  try {
    // HTTP → HTTPS redirect check
    const httpUrl = origin.replace("https://", "http://");
    try {
      const httpRes = await axios.get(httpUrl, {
        timeout: 6000, maxRedirects: 0, validateStatus: () => true,
        headers: { "User-Agent": AGENT },
      });
      const loc: string = httpRes.headers["location"] ?? "";
      redirectsToHttps = httpRes.status >= 300 && httpRes.status < 400 && loc.startsWith("https://");
    } catch { /* no redirect check */ }

    const res = await axios.get(url, {
      timeout: 15000, maxRedirects: 5, validateStatus: () => true,
      headers: { "User-Agent": AGENT, "Accept-Encoding": "gzip, br, deflate", "Accept": "text/html" },
    });

    const sc = res.headers["set-cookie"];
    rawSetCookie = Array.isArray(sc) ? sc : (sc ? [sc as string] : []);

    headers = Object.fromEntries(
      Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v[0] : String(v)])
    );
    html = typeof res.data === "string" ? res.data.slice(0, 300_000) : JSON.stringify(res.data).slice(0, 300_000);
  } catch {
    return empty;
  }

  // ── Parse everything ─────────────────────────────────────────────────────────
  const technologies = detectTech(headers, html);

  const cookies = rawSetCookie
    .filter(Boolean)
    .map(parseCookie)
    .filter((c) => c.name !== "unknown" && c.name !== "");

  const INFO_LEAK_HEADERS: Record<string, string> = {
    "server":              "Reveals server software and version to attackers",
    "x-powered-by":       "Reveals backend technology (PHP, ASP.NET, etc.)",
    "x-aspnet-version":   "Reveals exact ASP.NET version",
    "x-aspnetmvc-version":"Reveals ASP.NET MVC version",
    "x-generator":        "Reveals the CMS or framework used",
  };
  const infoLeaks = Object.entries(INFO_LEAK_HEADERS)
    .filter(([h]) => headers[h])
    .map(([header, description]) => ({ header, value: headers[header], description }));

  const corsOrigin = headers["access-control-allow-origin"];
  const cors = corsOrigin ? {
    allowOrigin: corsOrigin,
    allowCredentials: headers["access-control-allow-credentials"] === "true",
    risky: corsOrigin === "*",
  } : null;

  const enc = headers["content-encoding"] ?? "";
  const compression = { enabled: /gzip|br|deflate/.test(enc), encoding: enc || undefined };

  const openGraph = extractOG(html);
  const twitterCard = extractTwitter(html);
  const schemaOrg = /application\/ld\+json|itemtype=["']https?:\/\/schema\.org/i.test(html);
  const directoryListing = /Index of \/|Directory listing for|Parent Directory/i.test(html);

  // ── Parallel external checks ──────────────────────────────────────────────────
  const req = (path: string) =>
    axios.get(`${origin}${path}`, {
      timeout: 5000, maxRedirects: 1, validateStatus: () => true,
      headers: { "User-Agent": AGENT },
    }).catch(() => null);

  const [exposedResults, sitemapRes, secRes1, secRes2] = await Promise.all([
    Promise.all(EXPOSED_PATHS.map(async ({ path, risk, description }) => {
      const r = await req(path);
      return r?.status === 200 ? { path, risk, description } : null;
    })),
    req("/sitemap.xml"),
    req("/security.txt"),
    req("/.well-known/security.txt"),
  ]);

  return {
    technologies,
    cookies,
    infoLeaks,
    exposedFiles: exposedResults.filter((x): x is ExposedFileItem => x !== null),
    sitemapFound: sitemapRes?.status === 200,
    securityTxtFound: secRes1?.status === 200 || secRes2?.status === 200,
    cors,
    compression,
    openGraph,
    twitterCard,
    schemaOrg,
    redirectsToHttps,
    directoryListing,
  };
}