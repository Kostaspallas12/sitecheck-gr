import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "lighthouse",
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "firebase-admin",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https://www.google-analytics.com https://*.googleusercontent.com",
              "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://region1.analytics.google.com https://*.analytics.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.firebaseio.com",
              "frame-src https://accounts.google.com https://*.firebaseapp.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
