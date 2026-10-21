import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Web config is public (shipped to every browser); env vars override these defaults.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA-R3QSnb9lmM3sdR3BDdFSTcqj6CWLba8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sitecheck-gr.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sitecheck-gr",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1082649173637:web:0267588b3c4298f66b13ec",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const clientAuth = getAuth(app);