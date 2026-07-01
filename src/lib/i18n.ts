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
  techStackTitle: string
  cookiesTitle: string
  cookieNoIssues: string
  cookiesNone: string
  exposedFilesTitle: string
  exposedFilesNone: string
  infoLeaksTitle: string
  infoLeaksNone: string
  extSecurityTitle: string
  seoExtrasTitle: string
  compressionLabel: string
  redirectHttpsLabel: string
  directoryListingLabel: string
  sitemapLabel: string
  securityTxtLabel: string
  openGraphLabel: string
  twitterCardLabel: string
  schemaOrgLabel: string
  corsLabel: string
  corsRiskyNote: string
  enabled: string
  notEnabled: string
  found: string
  notFound: string
  present: string
  missing: string
  risky: string
  tabOverview: string
  tabSecurity: string
  tabSeo: string
  tabIssues: string
  noIssuesFound: string
  emailResultsTitle: string
  emailResultsBtn: string
  emailResultsSending: string
  emailResultsSent: string
  emailResultsError: string
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
      { icon: "📡", title: "Uptime Monitor", desc: "24/7 monitoring, instant alerts when your site goes down" },
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
    techStackTitle: "Technology Stack",
    cookiesTitle: "Cookie Security",
    cookieNoIssues: "No issues",
    cookiesNone: "No cookies were set by this page",
    exposedFilesTitle: "Sensitive Files",
    exposedFilesNone: "No sensitive files exposed",
    infoLeaksTitle: "Information Exposure",
    infoLeaksNone: "No information leaks detected",
    extSecurityTitle: "Extended Security",
    seoExtrasTitle: "SEO Extras",
    compressionLabel: "Compression",
    redirectHttpsLabel: "HTTP → HTTPS Redirect",
    directoryListingLabel: "Directory Listing",
    sitemapLabel: "sitemap.xml",
    securityTxtLabel: "security.txt",
    openGraphLabel: "Open Graph Tags",
    twitterCardLabel: "Twitter Card",
    schemaOrgLabel: "Schema.org",
    corsLabel: "CORS Policy",
    corsRiskyNote: "Wildcard (*) allows any origin — risky if credentials are involved",
    enabled: "Enabled",
    notEnabled: "Not enabled",
    found: "Found",
    notFound: "Not found",
    present: "Present",
    missing: "Missing",
    risky: "Risky",
    tabOverview: "Overview",
    tabSecurity: "Security",
    tabSeo: "SEO",
    tabIssues: "Issues",
    noIssuesFound: "No issues found — great job!",
    emailResultsTitle: "Send results to your email",
    emailResultsBtn: "Send",
    emailResultsSending: "Sending...",
    emailResultsSent: "Sent! Check your inbox.",
    emailResultsError: "Failed to send. Try again.",
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
      { icon: "📡", title: "Uptime Monitor", desc: "Παρακολούθηση 24/7, άμεση ειδοποίηση αν πέσει το site" },
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
    techStackTitle: "Τεχνολογίες",
    cookiesTitle: "Ασφάλεια Cookies",
    cookieNoIssues: "Χωρίς πρόβλημα",
    cookiesNone: "Δεν βρέθηκαν cookies σε αυτή τη σελίδα",
    exposedFilesTitle: "Εκτεθειμένα Αρχεία",
    exposedFilesNone: "Δεν βρέθηκαν εκτεθειμένα αρχεία",
    infoLeaksTitle: "Διαρροή Πληροφοριών",
    infoLeaksNone: "Δεν εντοπίστηκαν διαρροές πληροφοριών",
    extSecurityTitle: "Εκτεταμένη Ασφάλεια",
    seoExtrasTitle: "SEO Λεπτομέρειες",
    compressionLabel: "Συμπίεση",
    redirectHttpsLabel: "Ανακατεύθυνση HTTP → HTTPS",
    directoryListingLabel: "Εμφάνιση Καταλόγου",
    sitemapLabel: "sitemap.xml",
    securityTxtLabel: "security.txt",
    openGraphLabel: "Open Graph Tags",
    twitterCardLabel: "Twitter Card",
    schemaOrgLabel: "Schema.org",
    corsLabel: "CORS Policy",
    corsRiskyNote: "Wildcard (*) επιτρέπει οποιοδήποτε origin — επικίνδυνο αν εμπλέκονται credentials",
    enabled: "Ενεργή",
    notEnabled: "Ανενεργή",
    found: "Βρέθηκε",
    notFound: "Δεν βρέθηκε",
    present: "Υπάρχει",
    missing: "Λείπει",
    risky: "Επικίνδυνο",
    tabOverview: "Επισκόπηση",
    tabSecurity: "Ασφάλεια",
    tabSeo: "SEO",
    tabIssues: "Προβλήματα",
    noIssuesFound: "Δεν βρέθηκαν προβλήματα — συγχαρητήρια!",
    emailResultsTitle: "Αποστολή αποτελεσμάτων στο email σου",
    emailResultsBtn: "Αποστολή",
    emailResultsSending: "Αποστολή...",
    emailResultsSent: "Στάλθηκε! Έλεγξε τα εισερχόμενά σου.",
    emailResultsError: "Αποτυχία αποστολής. Δοκίμασε ξανά.",
  },
}

export function getT(lang: Lang): T {
  return translations[lang]
}

export const lighthouseDescriptionsEn: Record<string, string> = {
  "First Contentful Paint": "Visitors have to wait too long before they see anything on your page. If it takes more than 2 seconds, most people will leave before it finishes loading.",
  "Speed Index": "Your page reveals its content slowly — users stare at a blank or partial screen. Even a 1-second delay can reduce conversions by 7%.",
  "Largest Contentful Paint": "The main content (hero image or headline) loads too slowly. This is the moment users decide whether your site feels fast or not.",
  "Time to Interactive": "Your page looks ready but buttons and links don't actually respond to clicks for several seconds. This frustrates users who think something is broken.",
  "Total Blocking Time": "Your JavaScript is freezing the browser while it runs. During this time the page looks frozen and ignores all user input.",
  "Cumulative Layout Shift": "Elements on your page (text, images, buttons) jump around while loading. Users accidentally click the wrong thing because the layout keeps shifting.",
  "Eliminate render-blocking resources": "Some files (CSS or JS) are making the browser pause and wait before showing anything to the user, causing a visible delay on every page load.",
  "Reduce unused JavaScript": "Your site downloads JavaScript code it never actually uses. This wastes the visitor's data and slows the page for no benefit.",
  "Reduce unused CSS": "Your site loads CSS styles that are never applied to any element. Dead code that slows every page load.",
  "Efficiently encode images": "Your images are much larger than they need to be. The page is forcing visitors to download unnecessary file size on every visit.",
  "Serve images in next-gen formats": "Your images use old formats (JPG/PNG). Modern formats like WebP look identical but are 25–35% smaller, making your page load noticeably faster.",
  "Document does not have a meta description": "When your page appears in Google results, there's no description beneath the title. Users can't tell what the page is about, so they skip it.",
  "Document doesn't have a <title> element": "Your page has no title. Google and browsers don't know what to call it, which hurts your search ranking and confuses users.",
  "Image elements do not have [alt] attributes": "Some images have no description. Blind users using screen readers hear nothing, and Google can't understand what the images show.",
  "Links do not have a discernible name": "Some links have no text or label — just an icon or empty anchor. Users with screen readers have no idea where the link goes.",
  "Links are not crawlable": "Some links on your page can't be followed by Google's crawler. Those pages will never appear in search results.",
  "robots.txt is not valid": "Your robots.txt file has errors. Search engines may misread it and crawl pages you don't want, or skip pages you do want indexed.",
  "Document does not have a valid canonical URL": "Without a canonical URL, Google may index duplicate versions of your page and split the SEO value between them.",
  "Background and foreground colors do not have a sufficient contrast ratio.": "The text color is too close to the background color. People with vision problems, color blindness, or those reading in bright sunlight can't read your content.",
  "Form elements do not have associated labels": "Your form inputs have no labels. Users with screen readers hear 'edit text' with no context — they don't know what information to type in each field.",
  "Buttons do not have an accessible name": "Some buttons have no text or label. Screen reader users hear 'button' with no description — they can't tell what the button does.",
  "Heading elements are not in a sequentially-descending order": "Your headings (H1, H2, H3) are out of order. Screen readers use headings to navigate the page, and out-of-order headings break that navigation. Google also uses heading structure for SEO.",
  "[role]s do not have all required [aria-*] attributes": "Some interactive elements are missing required accessibility attributes. Assistive technologies will behave unpredictably for users who rely on them.",
  "Does not use HTTPS": "Your site uses an unencrypted connection. Browsers show a 'Not Secure' warning that scares visitors away. Google also ranks HTTPS sites higher.",
  "Includes front-end JavaScript libraries with known security vulnerabilities": "Your site uses outdated JavaScript libraries with publicly known security holes. Attackers can exploit these to steal data or compromise your users.",
  "Ensure CSP is effective against XSS attacks": "Your site has no Content Security Policy, or it's too weak. This makes it easy for attackers to inject malicious scripts that steal user data or passwords.",
  "Uses deprecated APIs": "Your code uses browser features that are being removed. They may stop working entirely in an upcoming browser update, breaking parts of your site.",
  "Browser errors were logged to the console": "Your page is throwing JavaScript errors silently in the background. These errors can cause features to fail or behave unexpectedly for users.",
}

export const lighthouseDescriptionsEl: Record<string, string> = {
  "First Contentful Paint": "Οι επισκέπτες περιμένουν πολύ πριν δουν οτιδήποτε στη σελίδα. Αν αργεί πάνω από 2 δευτερόλεπτα, οι περισσότεροι θα φύγουν πριν φορτώσει.",
  "Speed Index": "Η σελίδα εμφανίζει το περιεχόμενό της αργά — οι χρήστες κοιτάζουν κενή οθόνη. Καθυστέρηση 1 δευτερολέπτου μπορεί να μειώσει τις μετατροπές κατά 7%.",
  "Largest Contentful Paint": "Η κύρια εικόνα ή ο κύριος τίτλος φορτώνει αργά. Αυτή είναι η στιγμή που οι χρήστες αποφασίζουν αν το site σου είναι γρήγορο ή αργό.",
  "Time to Interactive": "Η σελίδα φαίνεται έτοιμη αλλά τα κουμπιά και links δεν ανταποκρίνονται σε κλικ για αρκετά δευτερόλεπτα. Οι χρήστες νομίζουν ότι κάτι έχει σπάσει.",
  "Total Blocking Time": "Η JavaScript παγώνει τον browser ενώ εκτελείται. Κατά τη διάρκεια αυτή η σελίδα αγνοεί όλες τις ενέργειες του χρήστη.",
  "Cumulative Layout Shift": "Στοιχεία της σελίδας (κείμενο, εικόνες, κουμπιά) μετακινούνται κατά τη φόρτωση. Οι χρήστες κάνουν κλικ λάθος επειδή η σελίδα αλλάζει συνεχώς.",
  "Eliminate render-blocking resources": "Κάποια αρχεία (CSS ή JS) κάνουν τον browser να σταματά και να περιμένει πριν εμφανίσει οτιδήποτε, προκαλώντας ορατή καθυστέρηση σε κάθε φόρτωση.",
  "Reduce unused JavaScript": "Το site κατεβάζει JavaScript που δεν χρησιμοποιεί ποτέ. Σπαταλά τα δεδομένα του επισκέπτη και επιβραδύνει τη σελίδα χωρίς κανένα όφελος.",
  "Reduce unused CSS": "Το site φορτώνει CSS styles που δεν εφαρμόζονται πουθενά. Νεκρός κώδικας που επιβραδύνει κάθε φόρτωση.",
  "Efficiently encode images": "Οι εικόνες σου είναι πολύ μεγαλύτερες από ό,τι χρειάζεται. Αναγκάζουν τους επισκέπτες να κατεβάζουν περιττό μέγεθος αρχείου σε κάθε επίσκεψη.",
  "Serve images in next-gen formats": "Οι εικόνες χρησιμοποιούν παλιά formats (JPG/PNG). Το WebP έχει ίδια ποιότητα αλλά 25–35% μικρότερο μέγεθος — η σελίδα φορτώνει αισθητά πιο γρήγορα.",
  "Document does not have a meta description": "Όταν η σελίδα εμφανίζεται στα αποτελέσματα Google, δεν υπάρχει περιγραφή κάτω από τον τίτλο. Οι χρήστες δεν ξέρουν τι είναι η σελίδα και την παρακάμπτουν.",
  "Document doesn't have a <title> element": "Η σελίδα δεν έχει τίτλο. Το Google και οι browsers δεν ξέρουν πώς να την αποκαλέσουν, κάτι που βλάπτει την κατάταξη και μπερδεύει τους χρήστες.",
  "Image elements do not have [alt] attributes": "Κάποιες εικόνες δεν έχουν περιγραφή. Τυφλοί χρήστες με screen reader δεν ακούν τίποτα, και το Google δεν καταλαβαίνει τι δείχνουν.",
  "Links do not have a discernible name": "Κάποια links δεν έχουν κείμενο ή ετικέτα — μόνο εικόνα ή κενό anchor. Χρήστες με screen reader δεν ξέρουν πού οδηγεί το link.",
  "Links are not crawlable": "Κάποια links δεν μπορεί να τα ακολουθήσει το Google. Αυτές οι σελίδες δεν θα εμφανιστούν ποτέ στα αποτελέσματα αναζήτησης.",
  "robots.txt is not valid": "Το αρχείο robots.txt έχει σφάλματα. Οι μηχανές αναζήτησης μπορεί να το διαβάσουν λάθος και να αγνοήσουν σελίδες που θέλεις να ευρετηριαστούν.",
  "Document does not have a valid canonical URL": "Χωρίς canonical URL, το Google μπορεί να ευρετηριάσει διπλές εκδόσεις της σελίδας και να μοιράσει το SEO value μεταξύ τους.",
  "Background and foreground colors do not have a sufficient contrast ratio.": "Το χρώμα του κειμένου είναι πολύ κοντά στο χρώμα του φόντου. Άτομα με προβλήματα όρασης, αχρωματοψία ή σε φωτεινό περιβάλλον αδυνατούν να διαβάσουν το περιεχόμενο.",
  "Form elements do not have associated labels": "Τα πεδία των φορμών δεν έχουν ετικέτες. Χρήστες με screen reader ακούν 'edit text' χωρίς πλαίσιο — δεν ξέρουν τι πληροφορία να πληκτρολογήσουν.",
  "Buttons do not have an accessible name": "Κάποια κουμπιά δεν έχουν κείμενο ή ετικέτα. Χρήστες με screen reader ακούν 'κουμπί' χωρίς περιγραφή — δεν ξέρουν τι κάνει.",
  "Heading elements are not in a sequentially-descending order": "Τα headings (H1, H2, H3) δεν είναι σε σωστή σειρά. Τα screen readers τα χρησιμοποιούν για πλοήγηση, και η λάθος σειρά σπάει αυτή τη λειτουργία. Επίσης επηρεάζει αρνητικά το SEO.",
  "[role]s do not have all required [aria-*] attributes": "Κάποια διαδραστικά στοιχεία δεν έχουν τα απαιτούμενα accessibility attributes. Τα assistive technologies θα συμπεριφέρονται απρόβλεπτα.",
  "Does not use HTTPS": "Το site χρησιμοποιεί μη κρυπτογραφημένη σύνδεση. Οι browsers εμφανίζουν προειδοποίηση 'Μη ασφαλές' που απομακρύνει επισκέπτες. Το Google επίσης κατατάσσει χαμηλότερα τα HTTP sites.",
  "Includes front-end JavaScript libraries with known security vulnerabilities": "Το site χρησιμοποιεί παλιές βιβλιοθήκες με γνωστές τρύπες ασφαλείας. Επιτιθέμενοι μπορούν να τις εκμεταλλευτούν για να κλέψουν δεδομένα ή να παραβιάσουν το site.",
  "Ensure CSP is effective against XSS attacks": "Το site δεν έχει σωστό Content Security Policy. Επιτιθέμενοι μπορούν εύκολα να εισάγουν κακόβουλα scripts που κλέβουν κωδικούς και δεδομένα χρηστών.",
  "Uses deprecated APIs": "Ο κώδικας χρησιμοποιεί λειτουργίες browser που καταργούνται. Μπορεί να σταματήσουν τελείως να λειτουργούν σε επερχόμενη ενημέρωση browser.",
  "Browser errors were logged to the console": "Η σελίδα παράγει JavaScript σφάλματα στο παρασκήνιο. Αυτά μπορεί να κάνουν λειτουργίες να αποτυγχάνουν ή να συμπεριφέρονται λανθασμένα για τους χρήστες.",
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