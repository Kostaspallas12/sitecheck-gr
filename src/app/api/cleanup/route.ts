import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase-admin/firestore";

// Καλείται από cron job κάθε 2 μήνες
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CLEANUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));

  try {
    let deletedUsers = 0;
    let deletedSites = 0;
    let deletedScans = 0;

    // Βρες users που δημιουργήθηκαν πριν από 2+ μήνες
    const usersSnap = await db.collection("users")
      .where("createdAt", "<", cutoff)
      .get();

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;

      // Βρες τα sites του user
      const sitesSnap = await db.collection("sites")
        .where("userId", "==", userId)
        .get();

      for (const siteDoc of sitesSnap.docs) {
        // Βρες τα scans του site
        const scansSnap = await db.collection("scans")
          .where("siteId", "==", siteDoc.id)
          .get();

        for (const scanDoc of scansSnap.docs) {
          // Διέγραψε scan result
          await db.collection("scan_results").doc(scanDoc.id).delete();
          // Διέγραψε scan
          await scanDoc.ref.delete();
          deletedScans++;
        }

        // Διέγραψε site
        await siteDoc.ref.delete();
        deletedSites++;
      }

      // Διέγραψε user
      await userDoc.ref.delete();
      deletedUsers++;
    }

    return NextResponse.json({
      success: true,
      deleted: { users: deletedUsers, sites: deletedSites, scans: deletedScans },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Cleanup απέτυχε" }, { status: 500 });
  }
}
