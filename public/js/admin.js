import { SITE } from "./content.js";
import { ADMIN_EMAILS } from "./firebase-config.js";
import { isFirebaseConfigured, getFirebase } from "./firebase.js";

const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const formatHe = (iso) => { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };

function say(text) {
  const box = $("#msg");
  box.textContent = text;
  box.hidden = !text;
}

if (!isFirebaseConfigured) {
  $("#who").textContent = "";
  say("Firebase עדיין לא מחובר. אחרי שממלאים את js/firebase-config.js ומפרסמים, הדף הזה ינהל את התאריכים והבקשות.");
} else {
  start();
}

async function start() {
  const f = await getFirebase();
  const { auth, authMod, db, fs } = f;

  $("#sign-in").addEventListener("click", () =>
    authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider()).catch((e) => say(`הכניסה נכשלה: ${e.message}`))
  );
  $("#sign-out").addEventListener("click", () => authMod.signOut(auth));

  let unsub = [];
  authMod.onAuthStateChanged(auth, (user) => {
    unsub.forEach((u) => u());
    unsub = [];
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);
    $("#who").textContent = user ? `מחובר כ-${user.email}` : "לא מחובר";
    $("#sign-in").hidden = !!user;
    $("#sign-out").hidden = !user;
    $("#dates-panel").hidden = !isAdmin;
    $("#req-panel").hidden = !isAdmin;
    say(user && !isAdmin ? "החשבון הזה לא מורשה לנהל את האתר." : "");
    if (isAdmin) unsub = [watchDates(db, fs), watchRequests(db, fs)];
  });

  $("#new-date").min = todayIso();
  $("#add-date-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const iso = $("#new-date").value;
    if (!iso) return;
    try {
      await fs.setDoc(fs.doc(db, "bookedDates", iso), { createdAt: fs.serverTimestamp() });
      $("#new-date").value = "";
    } catch (err) { say(`שמירה נכשלה: ${err.message}`); }
  });
}

function watchDates(db, fs) {
  return fs.onSnapshot(fs.collection(db, "bookedDates"), (snap) => {
    const today = todayIso();
    const ids = snap.docs.map((d) => d.id).sort();
    const ul = $("#dates");
    ul.innerHTML = "";
    if (!ids.length) { ul.innerHTML = "<li>אין תאריכים תפוסים</li>"; return; }
    for (const iso of ids) {
      const li = document.createElement("li");
      if (iso < today) li.className = "past";
      li.textContent = formatHe(iso);
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "×";
      del.setAttribute("aria-label", `הסרת ${formatHe(iso)}`);
      del.addEventListener("click", () => fs.deleteDoc(fs.doc(db, "bookedDates", iso)).catch((e) => say(e.message)));
      li.appendChild(del);
      ul.appendChild(li);
    }
  }, (err) => say(`אין הרשאה לקרוא תאריכים: ${err.message}`));
}

function watchRequests(db, fs) {
  const q = fs.query(fs.collection(db, "quoteRequests"), fs.orderBy("createdAt", "desc"), fs.limit(200));
  return fs.onSnapshot(q, (snap) => {
    const box = $("#requests");
    box.innerHTML = "";
    if (snap.empty) { box.textContent = "אין עדיין בקשות."; return; }
    for (const d of snap.docs) {
      const r = d.data();
      const el = document.createElement("div");
      el.className = `req ${r.status === "handled" ? "handled" : ""}`;
      const when = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString("he-IL") : "";
      el.innerHTML = `
        <div class="top"><span class="name"></span><span class="tag"></span></div>
        <div class="when"></div>
        <div class="msg"></div>
        <div class="actions"></div>`;
      el.querySelector(".name").textContent = r.name || "(בלי שם)";
      el.querySelector(".tag").textContent = r.eventType;
      el.querySelector(".when").textContent = `תאריך האירוע: ${formatHe(r.date)} · נשלח: ${when}`;
      el.querySelector(".msg").textContent = r.message || "";
      const toggle = document.createElement("button");
      toggle.className = "b light";
      toggle.type = "button";
      toggle.textContent = r.status === "handled" ? "סימון כחדש" : "סימון כטופל";
      toggle.addEventListener("click", () =>
        fs.updateDoc(d.ref, { status: r.status === "handled" ? "new" : "handled" }).catch((e) => say(e.message))
      );
      el.querySelector(".actions").appendChild(toggle);
      if (r.date && r.status !== "handled") {
        const book = document.createElement("button");
        book.className = "b light";
        book.type = "button";
        book.textContent = `סימון ${formatHe(r.date)} כתפוס`;
        book.addEventListener("click", () =>
          fs.setDoc(fs.doc(db, "bookedDates", r.date), { createdAt: fs.serverTimestamp() }).catch((e) => say(e.message))
        );
        el.querySelector(".actions").appendChild(book);
      }
      box.appendChild(el);
    }
  }, (err) => say(`אין הרשאה לקרוא בקשות: ${err.message}`));
}

// keep the import used (site name in title) so content.js stays the single source of the name
document.title = `ניהול · ${SITE.name}`;
