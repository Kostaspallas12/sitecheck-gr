export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-2">Πολιτική Απορρήτου</h1>
          <p className="text-slate-500 text-sm">Τελευταία ενημέρωση: Ιούνιος 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">1. Ποιοι είμαστε</h2>
          <p className="text-slate-400 leading-relaxed">
            Το SiteCheck είναι μια δωρεάν υπηρεσία ανάλυσης ιστοσελίδων. Αναλύουμε websites για θέματα
            Security, SEO, Performance και Accessibility.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">2. Τι δεδομένα συλλέγουμε</h2>
          <ul className="text-slate-400 leading-relaxed space-y-2 list-disc list-inside">
            <li><strong className="text-slate-300">Email:</strong> Το χρησιμοποιούμε μόνο για να συνδέσουμε τα scans σου με τον λογαριασμό σου.</li>
            <li><strong className="text-slate-300">Domain:</strong> Το domain που καταχωρείς για ανάλυση.</li>
            <li><strong className="text-slate-300">Αποτελέσματα scan:</strong> Αποθηκεύονται για να μπορείς να τα δεις αργότερα.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">3. Πώς χρησιμοποιούμε τα δεδομένα</h2>
          <p className="text-slate-400 leading-relaxed">
            Τα δεδομένα σου χρησιμοποιούνται αποκλειστικά για την παροχή της υπηρεσίας. Δεν τα πουλάμε,
            δεν τα μοιραζόμαστε με τρίτους και δεν τα χρησιμοποιούμε για διαφήμιση.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">4. Αποθήκευση & Διαγραφή δεδομένων</h2>
          <p className="text-slate-400 leading-relaxed">
            Τα δεδομένα αποθηκεύονται με ασφάλεια στο Google Firestore (servers εντός ΕΕ).
          </p>
          <p className="text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Περίοδος διατήρησης:</strong> Τα δεδομένα σου (email, domain, αποτελέσματα scan)
            διατηρούνται για <strong className="text-slate-300">2 μήνες</strong> από τη δημιουργία τους.
            Μετά την πάροδο αυτής της περιόδου, διαγράφονται αυτόματα και μόνιμα.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Μπορείς επίσης να ζητήσεις τη διαγραφή των δεδομένων σου νωρίτερα επικοινωνώντας μαζί μας.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">5. Τα δικαιώματά σου (GDPR)</h2>
          <ul className="text-slate-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>Δικαίωμα πρόσβασης στα δεδομένα σου</li>
            <li>Δικαίωμα διόρθωσης ανακριβών δεδομένων</li>
            <li>Δικαίωμα διαγραφής ("δικαίωμα στη λήθη")</li>
            <li>Δικαίωμα φορητότητας δεδομένων</li>
          </ul>
          <p className="text-slate-400 leading-relaxed">
            Για οποιοδήποτε αίτημα επικοινώνησε μαζί μας στο:{" "}
            <a href="mailto:pallaskostas675@gmail.com" className="text-indigo-400 hover:underline">
              pallaskostas675@gmail.com
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">6. Cookies</h2>
          <p className="text-slate-400 leading-relaxed">
            Δεν χρησιμοποιούμε cookies tracking ή διαφημίσεων. Χρησιμοποιούμε μόνο sessionStorage
            για τεχνικούς λόγους (προσωρινή αποθήκευση token επαλήθευσης).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-indigo-400">7. Αλλαγές στην πολιτική</h2>
          <p className="text-slate-400 leading-relaxed">
            Σε περίπτωση σημαντικών αλλαγών θα ενημερώνουμε την ημερομηνία στην κορυφή αυτής της σελίδας.
          </p>
        </section>

      </div>
    </main>
  );
}
