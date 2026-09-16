// decksandstories.com v2 - submit page entry.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/submit.css";
import "./styles/sections/reveal.css";
import { initRevealsLite } from "./modules/reveals.js";

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
      field.focus();
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function showSubmitNotice(form) {
    const btn = form.querySelector(".formSubmit");
    if (!btn) return;
    let notice = form.querySelector(".form-submit-notice");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "form-submit-notice";
      btn.before(notice);
    }
    notice.textContent =
      "Your submission was received, but we couldn't send a confirmation email right now. We've got your info either way — no need to resubmit.";
    notice.hidden = false;
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  forms.forEach((form) => {
    const mixLinks = form.querySelector("#photo-links");
    if (mixLinks) {
      mixLinks.addEventListener("input", () => validateMixLinks(form));
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateMixLinks(form)) return;

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
        if (res.ok) {
          window.location.href = redirectUrl;
        } else {
          showSubmitNotice(form);
        }
      } catch {
        showSubmitNotice(form);
      }
    });
  });
}

initRevealsLite();
