// ============================================================
// reveals.js — LITE tier (mobile + prefers-reduced-motion) and shared
// helpers used by both tiers. No scroll-scrubbing, no anime.js: just
// IntersectionObserver one-shot reveals via a CSS class, plus the
// 0->26 countdown and country-pill lighting. scroll.js (desktop) reuses
// tagReveals() and initCounters() but drives the reveals with anime.js.
// The two tiers are mutually exclusive — picked at runtime in main.js.
// ============================================================

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mark the elements that should reveal, and enable the hidden initial state
// only when JS is running (no-JS shows everything).
export function tagReveals() {
  document.documentElement.classList.add("reveal-ready");
  const seen = new Set();
  document.querySelectorAll(".section").forEach((section) => {
    let i = 0;
    const push = (el) => {
      if (!el || seen.has(el)) return;
      seen.add(el);
      el.setAttribute("data-reveal", "");
      // per-section index → CSS stagger delay without per-item JS
      el.style.setProperty("--reveal-i", String(i++ % 8));
    };
    push(section.querySelector(".section-head, .trust-title, h2"));
    section
      .querySelectorAll(".card, .country-pill, .gallery-item, .trust-logo, .ask-box, .cta-row, .collab > p, .about > p")
      .forEach(push);
  });
  return [...seen];
}

// Count [data-count-to] elements up from 0 when they scroll into view.
export function initCounters() {
  document.querySelectorAll("[data-count-to]").forEach((el) => {
    const to = parseInt(el.dataset.countTo, 10) || 0;
    if (reduce()) {
      el.textContent = String(to);
      return;
    }
    el.textContent = "0";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        countUp(el, to, 3400);
      },
      { threshold: 1 },
    );
    io.observe(el);
  });
}

function countUp(el, to, dur) {
  const t0 = performance.now();
  function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    // easeInOutCubic — deliberate, dramatic count
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    el.textContent = String(Math.round(eased * to));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// LITE reveals: toggle .is-in when elements enter; CSS handles the transition.
export function initRevealsLite() {
  tagReveals();
  initCounters();

  if (reduce()) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
}
