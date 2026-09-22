// ============================================================
// cookie-consent.js — GDPR prior-consent banner (LT / EU).
// Analytics & Marketing categories are reserved for future use;
// Phase 1 audit found no active non-essential trackers/embeds.
// ============================================================

const STORAGE_KEY = "ds_cookie_consent";
const TTL_MS = 183 * 864e5; // ~6 months

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.ts !== "number") return null;
    if (Date.now() - data.ts > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveConsent({ analytics, marketing }) {
  const payload = {
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    ts: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  document.documentElement.dataset.cookieConsent = "set";
  window.dispatchEvent(new CustomEvent("ds:cookie-consent", { detail: payload }));
  return payload;
}

function buildBanner() {
  const root = document.createElement("div");
  root.id = "cookie-consent";
  root.className = "cookie-consent";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "false");
  root.setAttribute("aria-labelledby", "cookie-consent-title");
  root.innerHTML = `
    <div class="cookie-consent-panel">
      <p id="cookie-consent-title" class="cookie-consent-title">We use cookies &amp; local storage</p>
      <p class="cookie-consent-text">
        We use essential storage to run forms and remember your preferences.
        Optional categories are currently unused (no analytics or third-party embeds on this site).
        See our <a href="/cookies/">Cookie Policy</a> for details.
      </p>
      <div class="cookie-consent-actions">
        <button type="button" class="cookie-btn cookie-btn-solid" data-action="accept">Accept all</button>
        <button type="button" class="cookie-btn cookie-btn-ghost" data-action="reject">Reject non-essential</button>
        <button type="button" class="cookie-btn cookie-btn-ghost" data-action="customize">Customize</button>
      </div>
    </div>
    <div class="cookie-consent-modal" hidden>
      <div class="cookie-consent-modal-panel" role="document">
        <button type="button" class="cookie-modal-close" data-action="close-modal" aria-label="Close">&times;</button>
        <h2 class="cookie-modal-title">Cookie preferences</h2>
        <ul class="cookie-cats">
          <li class="cookie-cat">
            <div class="cookie-cat-head">
              <span>Necessary</span>
              <span class="cookie-cat-lock">Always on</span>
            </div>
            <p>Required for basic site functions (forms, newsletter toast preferences, consent choice).</p>
            <input type="checkbox" checked disabled aria-label="Necessary cookies always on">
          </li>
          <li class="cookie-cat">
            <div class="cookie-cat-head">
              <label for="cookie-analytics">Analytics</label>
              <input type="checkbox" id="cookie-analytics">
            </div>
            <p>Currently unused. Reserved if we add cookieless or consent-gated analytics later.</p>
          </li>
          <li class="cookie-cat">
            <div class="cookie-cat-head">
              <label for="cookie-marketing">Marketing / Embeds</label>
              <input type="checkbox" id="cookie-marketing">
            </div>
            <p>Currently unused. YouTube and Instagram open as external links — no embeds load until that changes.</p>
          </li>
        </ul>
        <div class="cookie-consent-actions">
          <button type="button" class="cookie-btn cookie-btn-solid" data-action="save">Save preferences</button>
          <button type="button" class="cookie-btn cookie-btn-ghost" data-action="close-modal">Cancel</button>
        </div>
      </div>
    </div>`;
  return root;
}

export function initCookieConsent() {
  if (readConsent()) {
    document.documentElement.dataset.cookieConsent = "set";
    return;
  }

  const root = buildBanner();
  document.body.appendChild(root);

  const modal = root.querySelector(".cookie-consent-modal");
  const analyticsEl = root.querySelector("#cookie-analytics");
  const marketingEl = root.querySelector("#cookie-marketing");

  const hide = () => {
    root.classList.add("is-hidden");
    root.setAttribute("aria-hidden", "true");
    setTimeout(() => root.remove(), 400);
  };

  const openModal = () => {
    modal.hidden = false;
    root.setAttribute("aria-modal", "true");
  };
  const closeModal = () => {
    modal.hidden = true;
    root.setAttribute("aria-modal", "false");
  };

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) {
      if (e.target === modal) closeModal();
      return;
    }
    const action = btn.dataset.action;
    if (action === "accept") {
      saveConsent({ analytics: true, marketing: true });
      hide();
    } else if (action === "reject") {
      saveConsent({ analytics: false, marketing: false });
      hide();
    } else if (action === "customize") {
      openModal();
    } else if (action === "close-modal") {
      closeModal();
    } else if (action === "save") {
      saveConsent({
        analytics: analyticsEl.checked,
        marketing: marketingEl.checked,
      });
      hide();
    }
  });
}

export function getCookieConsent() {
  return readConsent();
}
