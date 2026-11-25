import { SITE } from "./content.js";
import { isFirebaseConfigured, isDateBooked, saveQuoteRequest } from "./firebase.js";

const $ = (sel) => document.querySelector(sel);

const pad = (n) => String(n).padStart(2, "0");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const formatHe = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};
const waLink = (text) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;

/* ---------- static bits ---------- */
$("#hero-img").src = SITE.heroImage;
$("#year").textContent = new Date().getFullYear();
document.querySelectorAll(".js-wa").forEach((a) => (a.href = waLink(SITE.whatsappGreeting)));
document.querySelectorAll(".js-wa-display").forEach((el) => (el.textContent = SITE.whatsappDisplay));
["#avail-date", "#q-date"].forEach((s) => ($(s).min = todayIso()));

/* ---------- portfolio ---------- */
const videosEl = $("#videos");
for (const v of SITE.videos) {
  const card = document.createElement("article");
  card.className = "video-card";
  card.innerHTML = `
    <div class="frame">
      <img src="https://img.youtube.com/vi/${v.id}/maxresdefault.jpg" alt="" loading="lazy">
      <div class="shade"></div>
      <div class="icon" aria-hidden="true"></div>
      <button class="play" type="button"></button>
    </div>
    <div class="meta"><h3></h3><p></p></div>`;
  card.querySelector("h3").textContent = v.title;
  card.querySelector(".meta p").textContent = v.tag;
  const btn = card.querySelector("button.play");
  btn.setAttribute("aria-label", `ניגון: ${v.title}`);
  btn.addEventListener("click", () => {
    const frame = card.querySelector(".frame");
    frame.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`;
    iframe.title = v.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    iframe.focus();
  });
  videosEl.appendChild(card);
}

/* ---------- pricing buttons preselect the event type ---------- */
document.querySelectorAll(".plan a[data-type]").forEach((a) =>
  a.addEventListener("click", () => ($("#q-type").value = a.dataset.type))
);

/* ---------- availability ---------- */
const result = $("#avail-result");
const showResult = (kind, title, text) => {
  result.className = `result ${kind}`;
  $("#avail-title").textContent = title;
  $("#avail-text").textContent = text;
  $("#avail-cta").hidden = kind !== "free";
  result.hidden = false;
};

$("#avail-date").addEventListener("input", () => (result.hidden = true));

$("#avail-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const iso = $("#avail-date").value;
  if (!iso) return;
  const btn = $("#avail-btn");
  btn.disabled = true;
  try {
    let booked = await isDateBooked(iso); // null when Firebase is not configured
    if (booked === null) booked = SITE.fallbackBookedDates.includes(iso);
    if (booked) {
      showResult("busy", "תפוס בתאריך הזה", `לצערי ${formatHe(iso)} כבר תפוס. נשמח לבדוק תאריך סמוך.`);
    } else {
      showResult("free", "פנוי! 🎉", `התאריך ${formatHe(iso)} עדיין פתוח. בואו נתפוס אותו לפני שמישהו אחר.`);
      $("#q-date").value = iso;
    }
  } catch (err) {
    console.error(err);
    showResult("error", "לא הצלחנו לבדוק כרגע", "כתבו לי בוואטסאפ ואבדוק בשבילכם.");
  } finally {
    btn.disabled = false;
  }
});

/* ---------- quote form → WhatsApp (+ saved to Firestore when connected) ---------- */
$("#quote-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    name: $("#q-name").value.trim(),
    eventType: $("#q-type").value,
    date: $("#q-date").value,
    message: $("#q-msg").value.trim(),
  };
  const lines = [
    "שלום איתן, אשמח להצעת מחיר.",
    data.name && `שם: ${data.name}`,
    `סוג אירוע: ${data.eventType}`,
    data.date && `תאריך: ${formatHe(data.date)}`,
    data.message && `פרטים: ${data.message}`,
  ].filter(Boolean);

  // Open WhatsApp synchronously inside the click so popup blockers allow it.
  window.open(waLink(lines.join("\n")), "_blank", "noopener");

  if (isFirebaseConfigured) {
    saveQuoteRequest(data)
      .then(() => ($("#q-status").textContent = "הפרטים נשמרו. אם ההודעה לא נשלחה — אחזור אליכם בכל מקרה."))
      .catch((err) => console.error("saveQuoteRequest failed", err));
  }
});
