# SiteCheck

Website audit tool: Security, SSL, SEO, Performance and Accessibility (Lighthouse) for sites whose ownership the user has verified.

- **Hosting:** Vercel (`sitecheck-gr.vercel.app`)
- **Auth & database:** Firebase Authentication + Firestore (`sitecheck-gr` project)
- **Email:** Brevo

## Development

```bash
npm install
npm run dev
```

Locally, scans use puppeteer's bundled Chrome; on Vercel they use `@sparticuz/chromium`.

## Environment variables

| Variable | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON for `firebase-admin` (required) |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | Sending emails |
| `CRON_SECRET` | Protects `/api/cron/rescan` and `/api/cron/uptime` (`x-cron-secret` header) |
| `CLEANUP_SECRET` | Protects `/api/cleanup` (`Authorization: Bearer`) |
| `NEXT_PUBLIC_BASE_URL` | Optional; defaults to the Vercel URL |

The public Firebase web config and GA id have defaults in the code and can be overridden with the `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_GA_ID` variables.
