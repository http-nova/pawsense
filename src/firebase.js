// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // ✅ from env
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // ✅ MISSING BEFORE
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/* ================= INIT ================= */

const app = initializeApp(firebaseConfig);

/* ================= EXPORTS ================= */

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
