// תוכן האתר שנוח לערוך בלי לגעת ב-HTML.
// Site content that is easy to edit without touching the HTML.

export const SITE = {
  name: "איתן שלם",

  // WhatsApp number in international format, digits only (972 + number without the leading 0).
  whatsappNumber: "972527203300",
  whatsappDisplay: "052-720-3300",
  whatsappGreeting: "שלום איתן! ראיתי את האתר ואשמח לשמוע פרטים.",

  // Hero background. Replace with a real photo, e.g. "img/hero.jpg" (put the file in public/img/).
  // Until then it uses a frame from the first video.
  heroImage: "https://img.youtube.com/vi/bldIPtF_41g/maxresdefault.jpg",

  // Portfolio videos (YouTube video IDs).
  videos: [
    { id: "bldIPtF_41g", title: "קליפ חתונה", tag: "קולנועי · 4K" },
    { id: "vWXUBp826NU", title: "הפקת קליפ", tag: "כיסוי מלא" },
    { id: "yliPwjc1xls", title: "וידאו לסושיאל", tag: "פורמט אנכי" },
  ],

  // Used ONLY while Firebase is not configured yet (see js/firebase-config.js).
  // After Firebase is connected, booked dates live in Firestore and are managed from /admin.html.
  fallbackBookedDates: [
    "2026-07-04", "2026-07-18", "2026-08-01", "2026-08-15",
    "2026-09-05", "2026-09-26", "2026-10-10",
  ],
};
