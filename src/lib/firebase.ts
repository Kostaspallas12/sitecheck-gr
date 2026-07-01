import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function init() {
  if (getApps().length > 0) return;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    initializeApp();
  }
}

init();
export const db = getFirestore();
export const adminAuth = getAuth();
