# Eitan Shalem — videographer portfolio site

Hebrew, RTL, static site. No build step, no npm dependencies. Hosted on **Firebase Hosting**, data in **Cloud Firestore**, admin login with **Firebase Auth (Google)**.
The owner (Eitan) speaks Hebrew — talk to him in Hebrew, keep it non-technical.

## Your job: connect it to Firebase and deploy

Everything is built and works locally already. What is left is only the Firebase side. Every placeholder is the string `REPLACE` — find them all with:

```
grep -rn "REPLACE" --include=*.js --include=*.rules --include=.firebaserc .
```

There are exactly 3 places:

| File | What to put there |
|---|---|
| `.firebaserc` | the Firebase project ID |
| `public/js/firebase-config.js` | `firebaseConfig` (Web app config from the console) and `ADMIN_EMAILS` (Eitan's Google account) |
| `firestore.rules` | the same admin email(s) inside `isAdmin()` |

### Steps

1. Ask Eitan which Google account should manage the site (the admin email). Ask whether he already has a Firebase project; if not, create one (Firebase console → Add project; Google Analytics not needed). The free Spark plan is enough — no Cloud Functions are used.
2. In the project: **Build → Firestore Database → Create database** (production mode, region `europe-west1` or `me-west1` Tel Aviv).
3. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
4. **Project settings → Your apps → Web (`</>`)** → register an app (no need for Firebase Hosting checkbox) → copy the config object into `public/js/firebase-config.js`.
5. Put the admin email in `ADMIN_EMAILS` (firebase-config.js) **and** in `isAdmin()` (firestore.rules). They must match.
6. Put the project ID in `.firebaserc`.
7. Install the CLI if needed (`npm install -g firebase-tools`), then `firebase login` (Eitan does the browser login himself), then from this folder:
   ```
   firebase deploy --only firestore:rules,firestore:indexes,hosting
   ```
8. Open `https://<project-id>.web.app/admin` → sign in with the admin Google account → add the booked dates (old demo list is in `public/js/content.js → fallbackBookedDates`; ask Eitan for his real ones).
9. Smoke test on the live site: pick a booked date in "בדיקת זמינות" → "תפוס"; a free date → "פנוי"; send the quote form → WhatsApp opens and the request appears in `/admin`.
10. Optional: custom domain via Hosting → Add custom domain (Eitan must own the domain). After that, set `og:image` in `public/index.html` to the absolute URL of `img/about.webp`.

Local preview any time: `firebase emulators:start --only hosting,firestore,auth` or simply `npx serve public` (without Firebase config the site runs on the fallback dates).

## How it works

- `public/index.html` + `css/styles.css` — the page. Sections: hero, about, portfolio (YouTube), pricing, availability check, quote form, footer.
- `public/js/content.js` — the things Eitan will ask to change: WhatsApp number, hero image, YouTube video IDs/titles, fallback dates.
- `public/js/main.js` — portfolio cards, availability check, quote form.
- `public/js/firebase.js` — loads the Firebase SDK **10.12.2** from `gstatic.com` (ES modules, no bundler). Does nothing while the config still has `REPLACE_ME`, so the site degrades gracefully.
- `public/admin.html` + `js/admin.js` — Google sign-in; manage booked dates; list quote requests, mark handled, mark a request's date as booked.

### Firestore data

- `bookedDates/{YYYY-MM-DD}` → `{ createdAt }`. Public **get** by id only; **list** is admin-only, so visitors can check a date without seeing the calendar. These docs are readable by anyone who knows the id — never store names/notes there.
- `quoteRequests/{auto}` → `{ name, eventType, date, message, createdAt, status: "new"|"handled", source: "website" }`. Anyone can create (strictly validated in rules), only admin reads/updates. The form opens WhatsApp **and** saves here, so leads are not lost if the visitor never presses send.

## Known gaps / things to ask Eitan

- **Hero background**: there is no real photo yet — it uses a frame of the first YouTube video (`SITE.heroImage`). Ask for a wide photo, save as `public/img/hero.jpg` (≈2000px wide, compressed), point `heroImage` to it.
- Prices, texts, stats ("200+ אירועים") are hard-coded in `index.html` — confirm they are still current.
- Spam: the quote form is open. If spam shows up, add Firebase App Check (reCAPTCHA v3) — not done yet.
- Design origin: built in Claude Design, converted to plain HTML/CSS. Keep the look (colors are CSS variables in `styles.css`; accent text color was darkened slightly for contrast).
