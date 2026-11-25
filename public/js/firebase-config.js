// ============================================================
//  FIREBASE CONFIG — the only file that must be filled in.
//  Firebase console → Project settings → General → "Your apps"
//  → Web app → SDK setup and configuration → Config.
//  These values are public by design (security is in firestore.rules).
// ============================================================

export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.firebasestorage.app",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

// Google accounts allowed into /admin.html.
// Must match the list in firestore.rules (function isAdmin).
export const ADMIN_EMAILS = [
  "REPLACE_WITH_ADMIN_EMAIL@gmail.com",
];

export const isFirebaseConfigured =
  !Object.values(firebaseConfig).some((v) => String(v).includes("REPLACE_ME"));
