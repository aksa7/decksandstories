// decksandstories.com v2 — submit page entry.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/submit.css";

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
        return a || itemSel === ".quiz-answer" ? `${q} – ${a}` : "";
      })
      .filter(Boolean)
      .join(joiner);
  };

  const NEWSLETTER = "https://formspree.io/f/mlglprvj";
  const redirectUrl = "https://decksandstories.com/thank-you";

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      buildHidden(form, "#story-letter", ".story-answer", "\n\n");
      buildHidden(form, "#quiz", ".quiz-answer", "\n");

      // Optional newsletter opt-in → separate Formspree endpoint (fire-and-forget).
      const opt = form.querySelector("#newsletter-optin, input[name='newsletter_optin']");
      const emailEl = form.querySelector("input[type='email']");
      if (opt?.checked && emailEl?.value.trim()) {
        const p = new FormData();
        p.append("email", emailEl.value.trim());
        p.append("source", `submit-optin-${form.id}`);
        p.append("page", location.pathname);
        fetch(NEWSLETTER, { method: "POST", headers: { Accept: "application/json" }, body: p, keepalive: true }).catch(() => {});
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
          alert("Something went wrong while submitting the form. Please try again or contact us directly.");
        }
      } catch {
        alert("Network error. Please try again later.");
      }
    });
  });
}
