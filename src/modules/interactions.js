// ============================================================
// interactions.js — non-animation behaviour ported from the old
// script.js: smooth in-page scroll, whole-card click-through, and
// the newsletter toast. The YouTube bar player and lightGallery are
// intentionally gone (locked decision: player removed; F6/F7 handle
// facade + custom lightbox).
// ============================================================

// Smooth scroll for in-page nav links (delegated).
function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.scrolly");
    if (!link) return;
    const id = link.getAttribute("href");
    const target = id && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Whole media card opens its data-url (unless a real link inside was clicked).
function initClickableCards() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("a")) return; // real link handles itself
    const card = e.target.closest(".card[data-url]");
    if (!card) return;
    const url = card.getAttribute("data-url");
    if (url) window.open(url, "_blank", "noopener");
  });
}

// Newsletter toast — shows once per session after 35% scroll; Formspree submit.
function initNewsletterToast() {
  const toast = document.getElementById("nl-toast");
  if (!toast) return;

  const FORMSPREE = "https://formspree.io/f/mlglprvj";
  const KEY_JOINED = "ds_nl_joined";
  const KEY_HIDE_UNTIL = "ds_nl_hide_until";
  const KEY_SESSION = "ds_nl_session_shown";
  const HIDE_DAYS = 14;
  const SHOW_AT = 0.35;

  const now = () => Date.now();
  const daysMs = (d) => d * 864e5;
  const joined = () => localStorage.getItem(KEY_JOINED) === "1";
  const hiddenByTime = () => {
    const until = parseInt(localStorage.getItem(KEY_HIDE_UNTIL) || "0", 10);
    return until && now() < until;
  };
  const shownThisSession = () => sessionStorage.getItem(KEY_SESSION) === "1";

  const open = () => {
    toast.classList.add("is-open");
    toast.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    toast.classList.remove("is-open");
    toast.setAttribute("aria-hidden", "true");
    localStorage.setItem(KEY_HIDE_UNTIL, String(now() + daysMs(HIDE_DAYS)));
  };

  if (joined() || hiddenByTime() || shownThisSession()) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    if ((doc.scrollTop || 0) / max >= SHOW_AT) {
      sessionStorage.setItem(KEY_SESSION, "1");
      open();
      window.removeEventListener("scroll", onScroll);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  toast.querySelector(".nl-toast-close")?.addEventListener("click", close);

  const form = document.getElementById("nl-toast-form");
  const msg = document.getElementById("nl-toast-msg");
  const email = document.getElementById("nl-toast-email");
  if (!form || !msg || !email) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = (email.value || "").trim();
    if (!val) return;
    msg.textContent = "Joining...";
    try {
      const body = new FormData();
      body.append("email", val);
      body.append("source", "index-toast");
      body.append("page", location.pathname);
      const res = await fetch(FORMSPREE, { method: "POST", headers: { Accept: "application/json" }, body });
      if (res.ok) {
        msg.textContent = "You’re in. See you in the next episode 👀";
        localStorage.setItem(KEY_JOINED, "1");
        localStorage.setItem(KEY_HIDE_UNTIL, String(now() + daysMs(365)));
        setTimeout(close, 1200);
      } else {
        msg.textContent = "Something went wrong. Try again.";
      }
    } catch {
      msg.textContent = "Network error. Try again.";
    }
  });
}

export function initInteractions() {
  initSmoothScroll();
  initClickableCards();
  initNewsletterToast();
}
