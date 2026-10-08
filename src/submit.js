// decksandstories.com v2 - submit page entry.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/submit.css";
import "./styles/sections/reveal.css";
import "./styles/sections/cookie-consent.css";
import { initRevealsLite } from "./modules/reveals.js";
import { initCookieConsent } from "./modules/cookie-consent.js";

const tabs = document.querySelectorAll(".submit-tab");
const forms = document.querySelectorAll(".submit-form");
const heroButtons = document.querySelectorAll(".submit-cta-row .submit-cta");

function activateForm(targetId) {
  forms.forEach((f) => f.classList.toggle("active", f.id === targetId));
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === targetId));
  heroButtons.forEach((b) => b.classList.toggle("active", b.dataset.target === targetId));
}

function scrollToForm(targetId) {
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (forms.length) {
  activateForm("mix-form");

  [...tabs, ...heroButtons].forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = el.dataset.target;
      if (!targetId) return;
      activateForm(targetId);
      scrollToForm(targetId);
    });
  });

  // Aggregate the story textareas / quiz inputs into their hidden fields.
  const buildHidden = (form, hiddenSel, itemSel, joiner) => {
    const hidden = form.querySelector(hiddenSel);
    const items = form.querySelectorAll(itemSel);
    if (!hidden || !items.length) return;
    hidden.value = [...items]
      .map((el) => {
        const q = el.dataset.question || "";
        const a = (el.value || "").trim();
        return a || itemSel === ".quiz-answer" ? `${q} - ${a}` : "";
      })
      .filter(Boolean)
      .join(joiner);
  };

  const NEWSLETTER_API = "/api/newsletter-subscribe";
  const FORMSPREE = "https://formspree.io/f/mlglprvj";
  const redirectUrl = "https://decksandstories.com/thank-you";

  const BLOCKED_LINK_RE = /soundcloud\.com|mixcloud\.com|on\.soundcloud\.com|youtube\.com|youtu\.be|open\.spotify\.com|spotify\.link/i;
  const NO_LINKS_FIELDS = ["artist", "contact-name", "location", "born-in", "genre"];
  const IG_HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;
  const IG_URL_RE = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i;

  function normalizeInstagram(raw) {
    let v = String(raw || "").trim();
    if (!v) return { ok: true, value: "" };

    const urlMatch = v.match(IG_URL_RE);
    if (urlMatch) {
      v = urlMatch[1];
      const reserved = new Set([
        "p", "reel", "reels", "stories", "tv", "explore", "accounts", "direct", "share",
      ]);
      if (reserved.has(v.toLowerCase())) {
        return { ok: false, value: "" };
      }
    }
    if (v.startsWith("@")) v = v.slice(1);
    v = v.trim();

    if (!IG_HANDLE_RE.test(v)) {
      return { ok: false, value: "" };
    }
    return { ok: true, value: v };
  }

  function validateMixLinks(form) {
    if (form.id !== "mix-form") return true;
    const field = form.querySelector("#photo-links");
    const errorEl = form.querySelector("#photo-links-error");
    if (!field) return true;

    const value = (field.value || "").trim();
    const blocked = BLOCKED_LINK_RE.test(value);
    field.classList.toggle("is-invalid", blocked);
    if (errorEl) errorEl.hidden = !blocked;
    if (blocked) {
      console.warn("submit rejected: blocked_mix_links", { field: "photo-links" });
      field.focus();
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function validateNoLinksFields(form) {
    for (const name of NO_LINKS_FIELDS) {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) continue;
      if (/https?:\/\//i.test(String(el.value || ""))) {
        console.warn("submit rejected: links_not_allowed", { field: name });
        el.classList.add("is-invalid");
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        showSubmitError(form, `Please remove links from the ${name} field`);
        return false;
      }
      el.classList.remove("is-invalid");
    }
    return true;
  }

  function normalizeAndValidateInstagram(form) {
    const el = form.querySelector('[name="instagram"]');
    if (!el) return true;
    const ig = normalizeInstagram(el.value);
    if (!ig.ok) {
      console.warn("submit rejected: invalid_instagram", { field: "instagram" });
      el.classList.add("is-invalid");
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      showSubmitError(form, "Please enter a valid Instagram username (not a post or reel link).");
      return false;
    }
    el.value = ig.value;
    el.classList.remove("is-invalid");
    return true;
  }

  function showSubmitError(form, message) {
    const btn = form.querySelector(".formSubmit");
    if (!btn) return;
    let notice = form.querySelector(".form-submit-notice");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "form-submit-notice";
      btn.before(notice);
    }
    notice.textContent =
      message ||
      "Something went wrong. Please try again or email decksandstories@gmail.com";
    notice.hidden = false;
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function messageForSubmitError(body) {
    if (body?.error === "links_not_allowed" && body.field) {
      return `Please remove links from the ${body.field} field`;
    }
    if (body?.error === "invalid_instagram") {
      return "Please enter a valid Instagram username (not a post or reel link).";
    }
    return null;
  }

  forms.forEach((form) => {
    const mixLinks = form.querySelector("#photo-links");
    if (mixLinks) {
      mixLinks.addEventListener("input", () => validateMixLinks(form));
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateMixLinks(form)) return;
      if (!validateNoLinksFields(form)) return;
      if (!normalizeAndValidateInstagram(form)) return;

      buildHidden(form, "#story-letter", ".story-answer", "\n\n");
      buildHidden(form, "#quiz", ".quiz-answer", "\n");

      // Optional newsletter opt-in → Resend Contacts + Formspree backup (fire-and-forget).
      const opt = form.querySelector("#newsletter-optin, input[name='newsletter_optin']");
      const emailEl = form.querySelector("input[type='email']");
      if (opt?.checked && emailEl?.value.trim()) {
        const emailVal = emailEl.value.trim();
        const p = new FormData();
        p.append("email", emailVal);
        p.append("source", `submit-optin-${form.id}`);
        p.append("page", location.pathname);
        Promise.allSettled([
          fetch(NEWSLETTER_API, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailVal }),
            keepalive: true,
          }),
          fetch(FORMSPREE, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: p,
            keepalive: true,
          }),
        ]).catch(() => {});
      }

      try {
        const res = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        let body = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        if (res.ok && body?.ok === true) {
          window.location.href = redirectUrl;
        } else {
          if (body?.error === "links_not_allowed" || body?.error === "invalid_instagram") {
            console.warn("submit rejected:", body.error, { field: body.field || "instagram" });
          }
          showSubmitError(form, messageForSubmitError(body));
        }
      } catch {
        showSubmitError(form);
      }
    });
  });
}

initRevealsLite();
initCookieConsent();
