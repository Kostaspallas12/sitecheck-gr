export type Lang = "en" | "el"

type T = {
  badge: string
  title1: string
  title2: string
  subtitle: string
  domainLabel: string
  emailLabel: string
  startBtn: string
  starting: string
  connError: string
  features: Array<{ icon: string; title: string; desc: string }>
  verifyTitle: string
  verifyDesc: string
  metaInstruction: string
  metaNote: string
  verifyBtn: string
  verifying: string
  verifyOk: string
  verifyFail: string
  connFailed: string
  sessionExpired: string
  backHome: string
  scanTitle: string
  scanSubtitle: string
  scanSteps: string[]
  resultsFor: string
  scoresTitle: string
  overallScore: string
  excellent: string
  good: string
  fair: string
  poor: string
  sslTitle: string
  sslStatus: string
  sslIssuer: string
  sslExpiry: string
  sslProtocol: string
  sslValid: string
  sslInvalid: string
  days: string
  secHeadersTitle: string
  issuesTitle: string
  returnHome: string
  scoreLabels: Record<string, string>
  privacyLink: string
}

export const translations: Record<Lang, T> = {
  en: {
    badge: "Free tool",
    title1: "Audit your website",
    title2: "in minutes",
    subtitle: "Full Security, SEO, Performance and Accessibility analysis. We first verify it belongs to you.",
    domainLabel: "Domain",
    emailLabel: "Email",
    startBtn: "Start analysis →",
    starting: "Processing...",
    connError: "Connection error. Please try again.",
    features: [
      { icon: "🔒", title: "Security Headers", desc: "CSP, HSTS, X-Frame-Options and other critical headers" },
      { icon: "⚡", title: "Performance", desc: "Core Web Vitals, LCP, CLS, speed score" },
      { icon: "🔍", title: "SEO", desc: "Meta tags, canonicals, robots.txt, structured data" },
      { icon: "👁️", title: "Accessibility", desc: "Contrast ratio, ARIA labels, keyboard navigation" },
    ],
    verifyTitle: "Verify ownership",
    verifyDesc: "We verify that {domain} is yours before scanning.",
    metaInstruction: 'Add the following meta tag inside the <head> of your homepage:',
    metaNote: 'Once added and deployed, click "Verify".',
    verifyBtn: "Verify →",
    verifying: "Checking...",
    verifyOk: "Verified! Starting scan...",
    verifyFail: "Verification failed. Make sure you followed the instructions.",
    connFailed: "Connection error.",
    sessionExpired: "Session expired. Start over.",
    backHome: "← Home",
    scanTitle: "Scanning...",
    scanSubtitle: "This may take 30–60 seconds.",
    scanSteps: [
      "Connecting to server...",
      "Running Lighthouse analysis...",
      "Checking security headers...",
      "Analyzing SSL certificate...",
      "Processing results...",
    ],
    resultsFor: "Results for",
    scoresTitle: "Analysis scores",
    overallScore: "Overall score",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Needs improvement",
    sslTitle: "SSL / HTTPS",
    sslStatus: "Status",
    sslIssuer: "Issuer",
    sslExpiry: "Expires in",
    sslProtocol: "Protocol",
    sslValid: "Valid",
    sslInvalid: "Invalid",
    days: "days",
    secHeadersTitle: "Security Headers",
    issuesTitle: "Issues",
    returnHome: "← Back to homepage",
    scoreLabels: {
      "Performance": "Performance",
      "SEO": "SEO",
      "Accessibility": "Accessibility",
      "Best Practices": "Best Practices",
      "Security": "Security",
    },
    privacyLink: "Privacy Policy",
  },
  el: {
    badge: "Δωρεάν εργαλείο",
    title1: "Audit του site σου",
    title2: "σε λεπτά",
    subtitle: "Πλήρης ανάλυση Security, SEO, Performance και Accessibility. Πρώτα επαληθεύουμε ότι είναι δικό σου.",
    domainLabel: "Domain",
    emailLabel: "Email",
    startBtn: "Ξεκίνα ανάλυση →",
    starting: "Καταχώρηση...",
    connError: "Σφάλμα σύνδεσης. Δοκιμάστε ξανά.",
    features: [
      { icon: "🔒", title: "Security Headers", desc: "CSP, HSTS, X-Frame-Options και άλλα critical headers" },
      { icon: "⚡", title: "Απόδοση", desc: "Core Web Vitals, LCP, CLS, speed score" },
      { icon: "🔍", title: "SEO", desc: "Meta tags, canonicals, robots.txt, structured data" },
      { icon: "👁️", title: "Προσβασιμότητα", desc: "Contrast ratio, ARIA labels, keyboard navigation" },
    ],
    verifyTitle: "Επαλήθευση ιδιοκτησίας",
    verifyDesc: "Επαληθεύουμε ότι το {domain} είναι δικό σου πριν κάνουμε ανάλυση.",
    metaInstruction: "Πρόσθεσε το παρακάτω meta tag μέσα στο <head> της αρχικής σελίδας:",
    metaNote: "Αφού το προσθέσεις και κάνεις deploy, πάτα \"Επαλήθευση\".",
    verifyBtn: "Επαλήθευση →",
    verifying: "Γίνεται έλεγχος...",
    verifyOk: "Επαλήθευση επιτυχής! Ξεκινά το scan...",
    verifyFail: "Επαλήθευση απέτυχε. Ελέγξτε ότι ακολουθήσατε τις οδηγίες.",
    connFailed: "Σφάλμα σύνδεσης.",
    sessionExpired: "Η σύνδεση έληξε. Ξεκίνα από την αρχή.",
    backHome: "← Αρχική",
    scanTitle: "Γίνεται ανάλυση...",
    scanSubtitle: "Αυτό μπορεί να πάρει 30–60 δευτερόλεπτα.",
    scanSteps: [
      "Σύνδεση με τον server...",
      "Τρέχει Lighthouse ανάλυση...",
      "Ελέγχονται security headers...",
      "Αναλύεται το SSL πιστοποιητικό...",
      "Επεξεργασία αποτελεσμάτων...",
    ],
    resultsFor: "Αποτελέσματα για",
    scoresTitle: "Βαθμολογίες ανάλυσης",
    overallScore: "Συνολική βαθμολογία",
    excellent: "Εξαιρετικό",
    good: "Καλό",
    fair: "Μέτριο",
    poor: "Χρειάζεται βελτίωση",
    sslTitle: "SSL / HTTPS",
    sslStatus: "Κατάσταση",
    sslIssuer: "Εκδότης",
    sslExpiry: "Λήγει σε",
    sslProtocol: "Πρωτόκολλο",
    sslValid: "Έγκυρο",
    sslInvalid: "Μη έγκυρο",
    days: "μέρες",
    secHeadersTitle: "Security Headers",
    issuesTitle: "Προβλήματα",
    returnHome: "← Επιστροφή στην αρχική",
    scoreLabels: {
      "Performance": "Απόδοση",
      "SEO": "SEO",
      "Accessibility": "Προσβασιμότητα",
      "Best Practices": "Βέλτιστες Πρακτικές",
      "Security": "Ασφάλεια",
    },
    privacyLink: "Πολιτική Απορρήτου",
  },
}

export function getT(lang: Lang): T {
  return translations[lang]
}

export const lighthouseTitlesEl: Record<string, string> = {
  // Performance
  "First Contentful Paint": "Πρώτο Περιεχόμενο (FCP)",
  "Speed Index": "Δείκτης Ταχύτητας",
  "Largest Contentful Paint": "Μεγαλύτερο Περιεχόμενο (LCP)",
  "Time to Interactive": "Χρόνος Απόκρισης (TTI)",
  "Total Blocking Time": "Συνολικός Χρόνος Αποκλεισμού (TBT)",
  "Cumulative Layout Shift": "Μετατοπίσεις Layout (CLS)",
  "Eliminate render-blocking resources": "Αφαίρεση πόρων που μπλοκάρουν το rendering",
  "Reduce unused JavaScript": "Μείωση αχρησιμοποίητης JavaScript",
  "Reduce unused CSS": "Μείωση αχρησιμοποίητου CSS",
  "Efficiently encode images": "Βελτιστοποίηση εικόνων",
  "Serve images in next-gen formats": "Χρήση σύγχρονων formats εικόνας (WebP)",
  // SEO
  "Document does not have a meta description": "Λείπει meta description",
  "Document doesn't have a <title> element": "Λείπει ο τίτλος σελίδας",
  "Image elements do not have [alt] attributes": "Εικόνες χωρίς alt text",
  "Links do not have a discernible name": "Links χωρίς εμφανές όνομα",
  "Links are not crawlable": "Links που δεν ανιχνεύονται",
  "robots.txt is not valid": "Μη έγκυρο robots.txt",
  "Document does not have a valid canonical URL": "Λείπει canonical URL",
  // Accessibility
  "Background and foreground colors do not have a sufficient contrast ratio.": "Ανεπαρκής αντίθεση χρωμάτων",
  "Form elements do not have associated labels": "Στοιχεία φόρμας χωρίς labels",
  "Buttons do not have an accessible name": "Κουμπιά χωρίς προσβάσιμο όνομα",
  "Heading elements are not in a sequentially-descending order": "Λανθασμένη σειρά headings",
  "[role]s do not have all required [aria-*] attributes": "Λείπουν ARIA attributes",
  // Best Practices
  "Does not use HTTPS": "Δεν χρησιμοποιεί HTTPS",
  "Includes front-end JavaScript libraries with known security vulnerabilities": "JavaScript libraries με γνωστές ευπάθειες",
  "Ensure CSP is effective against XSS attacks": "Αναποτελεσματικό CSP κατά XSS",
  "Uses deprecated APIs": "Χρήση παρωχημένων APIs",
  "Browser errors were logged to the console": "Σφάλματα στην κονσόλα",
}