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

export const lighthouseFixesEn: Record<string, string> = {
  "First Contentful Paint": "Minimize server response time, eliminate render-blocking resources, and inline critical CSS.",
  "Speed Index": "Minimize main thread work, reduce JavaScript execution time, and optimize images.",
  "Largest Contentful Paint": "Preload the hero image, optimize server response time, and remove render-blocking resources.",
  "Time to Interactive": "Split your JavaScript bundles and defer unused scripts until after the page loads.",
  "Total Blocking Time": "Break up long JavaScript tasks into smaller ones. Avoid heavy third-party scripts.",
  "Cumulative Layout Shift": "Always set width and height on images and videos. Avoid inserting content above existing content.",
  "Eliminate render-blocking resources": "Add defer or async to non-critical scripts. Inline critical CSS.",
  "Reduce unused JavaScript": "Use code splitting (e.g. dynamic imports) and remove unused dependencies.",
  "Reduce unused CSS": "Remove unused CSS rules. Use a tool like PurgeCSS.",
  "Efficiently encode images": "Compress images using tools like Squoosh or ImageOptim before uploading.",
  "Serve images in next-gen formats": "Convert images to WebP or AVIF format for smaller file sizes.",
  "Document does not have a meta description": "Add <meta name=\"description\" content=\"...\"> in your page's <head>.",
  "Document doesn't have a <title> element": "Add a <title> element inside your page's <head>.",
  "Image elements do not have [alt] attributes": "Add a descriptive alt=\"...\" attribute to every <img> element.",
  "Links do not have a discernible name": "Add visible text or an aria-label attribute to every <a> element.",
  "Links are not crawlable": "Ensure all links use valid href attributes that search engines can follow.",
  "robots.txt is not valid": "Fix the syntax errors in your robots.txt file.",
  "Document does not have a valid canonical URL": "Add <link rel=\"canonical\" href=\"https://yourdomain.com/page\"> in your <head>.",
  "Background and foreground colors do not have a sufficient contrast ratio.": "Increase color contrast to at least 4.5:1 for normal text. Use a tool like WebAIM Contrast Checker.",
  "Form elements do not have associated labels": "Add a <label for=\"inputId\"> or aria-label attribute to every form input.",
  "Buttons do not have an accessible name": "Add visible text or aria-label to every <button> element.",
  "Heading elements are not in a sequentially-descending order": "Use headings in order (h1 → h2 → h3). Never skip a level.",
  "[role]s do not have all required [aria-*] attributes": "Add the required aria-* attributes for each ARIA role you use.",
  "Does not use HTTPS": "Install an SSL certificate and redirect all HTTP traffic to HTTPS.",
  "Includes front-end JavaScript libraries with known security vulnerabilities": "Update all JavaScript dependencies to their latest versions (run npm audit fix).",
  "Ensure CSP is effective against XSS attacks": "Add a strict Content-Security-Policy header that restricts script sources.",
  "Uses deprecated APIs": "Replace deprecated browser APIs with their modern equivalents.",
  "Browser errors were logged to the console": "Open DevTools → Console and fix all JavaScript errors shown.",
}

export const lighthouseFixesEl: Record<string, string> = {
  "First Contentful Paint": "Μείωσε τον χρόνο απόκρισης του server, αφαίρεσε πόρους που μπλοκάρουν το rendering και κάνε inline το κρίσιμο CSS.",
  "Speed Index": "Μείωσε τον χρόνο εκτέλεσης JavaScript και βελτιστοποίησε τις εικόνες σου.",
  "Largest Contentful Paint": "Κάνε preload την κύρια εικόνα, βελτιστοποίησε τον server και αφαίρεσε render-blocking resources.",
  "Time to Interactive": "Χώρισε τα JavaScript bundles σε μικρότερα και αναβάλλε scripts που δεν χρειάζονται αμέσως.",
  "Total Blocking Time": "Χώρισε τις μακρές JavaScript εργασίες. Απέφυγε βαριά third-party scripts.",
  "Cumulative Layout Shift": "Ορίζε πάντα πλάτος και ύψος σε εικόνες/videos. Μην εισάγεις περιεχόμενο πάνω από υπάρχον.",
  "Eliminate render-blocking resources": "Πρόσθεσε defer ή async σε non-critical scripts. Κάνε inline το κρίσιμο CSS.",
  "Reduce unused JavaScript": "Χρησιμοποίησε code splitting (π.χ. dynamic imports) και αφαίρεσε αχρησιμοποίητες βιβλιοθήκες.",
  "Reduce unused CSS": "Αφαίρεσε αχρησιμοποίητα CSS rules. Χρησιμοποίησε εργαλείο όπως το PurgeCSS.",
  "Efficiently encode images": "Συμπίεσε εικόνες με εργαλεία όπως το Squoosh ή ImageOptim.",
  "Serve images in next-gen formats": "Μετατρέψε τις εικόνες σε WebP ή AVIF format για μικρότερο μέγεθος.",
  "Document does not have a meta description": "Πρόσθεσε <meta name=\"description\" content=\"...\"> στο <head> της σελίδας σου.",
  "Document doesn't have a <title> element": "Πρόσθεσε ένα <title> element μέσα στο <head> της σελίδας σου.",
  "Image elements do not have [alt] attributes": "Πρόσθεσε alt=\"...\" σε κάθε <img> element με περιγραφή της εικόνας.",
  "Links do not have a discernible name": "Πρόσθεσε ορατό κείμενο ή aria-label σε κάθε <a> element.",
  "Links are not crawlable": "Βεβαιώσου ότι όλα τα links έχουν έγκυρο href attribute.",
  "robots.txt is not valid": "Διόρθωσε τα συντακτικά σφάλματα στο αρχείο robots.txt.",
  "Document does not have a valid canonical URL": "Πρόσθεσε <link rel=\"canonical\" href=\"https://yourdomain.com/page\"> στο <head>.",
  "Background and foreground colors do not have a sufficient contrast ratio.": "Αύξησε την αντίθεση χρωμάτων σε τουλάχιστον 4.5:1 για κανονικό κείμενο. Χρησιμοποίησε το WebAIM Contrast Checker.",
  "Form elements do not have associated labels": "Πρόσθεσε <label for=\"inputId\"> ή aria-label σε κάθε input της φόρμας.",
  "Buttons do not have an accessible name": "Πρόσθεσε ορατό κείμενο ή aria-label σε κάθε <button>.",
  "Heading elements are not in a sequentially-descending order": "Χρησιμοποίησε headings με σειρά (h1 → h2 → h3). Μην παραλείπεις επίπεδα.",
  "[role]s do not have all required [aria-*] attributes": "Πρόσθεσε τα απαιτούμενα aria-* attributes για κάθε ARIA role που χρησιμοποιείς.",
  "Does not use HTTPS": "Εγκατάστησε SSL πιστοποιητικό και ανακατεύθυνε όλη την HTTP κίνηση σε HTTPS.",
  "Includes front-end JavaScript libraries with known security vulnerabilities": "Ενημέρωσε όλες τις JavaScript εξαρτήσεις (τρέξε npm audit fix).",
  "Ensure CSP is effective against XSS attacks": "Πρόσθεσε αυστηρό Content-Security-Policy header που περιορίζει τις πηγές scripts.",
  "Uses deprecated APIs": "Αντικατάστησε τα παρωχημένα browser APIs με τα σύγχρονα αντίστοιχά τους.",
  "Browser errors were logged to the console": "Άνοιξε DevTools → Console και διόρθωσε όλα τα JavaScript errors.",
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