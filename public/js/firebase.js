// Thin wrapper around the Firebase Web SDK (loaded from Google's CDN, no build step).
// Everything here is a no-op until js/firebase-config.js is filled in.

import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

let cache = null;

async function sdk() {
  if (!isFirebaseConfigured) return null;
  if (cache) return cache;
  const [appMod, fsMod, authMod] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
    import(`${SDK}/firebase-auth.js`),
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  cache = {
    db: fsMod.getFirestore(app),
    auth: authMod.getAuth(app),
    fs: fsMod,
    authMod,
  };
  return cache;
}

export { isFirebaseConfigured };
export const getFirebase = sdk;

/** Is this ISO date (YYYY-MM-DD) booked? Reads one document only, never the whole calendar. */
export async function isDateBooked(iso) {
  const f = await sdk();
  if (!f) return null; // not configured
  const snap = await f.fs.getDoc(f.fs.doc(f.db, "bookedDates", iso));
  return snap.exists();
}

/** Saves a quote request so it is not lost even if the WhatsApp message is never sent. */
export async function saveQuoteRequest({ name, eventType, date, message }) {
  const f = await sdk();
  if (!f) return false;
  await f.fs.addDoc(f.fs.collection(f.db, "quoteRequests"), {
    name: String(name || "").slice(0, 100),
    eventType,
    date: date || "",
    message: String(message || "").slice(0, 2000),
    createdAt: f.fs.serverTimestamp(),
    status: "new",
    source: "website",
  });
  return true;
}
