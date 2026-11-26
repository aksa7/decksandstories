// /merch — Limited Collection. No prices, no cart: "message us for more info".
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/cards.css";
import "./styles/sections/blocks.css";
import "./styles/sections/cookie-consent.css";
import "./styles/sections/reveal.css";
import "./styles/sections/merch.css";

import { initRevealsLite, tagReveals } from "./modules/reveals.js";

// ------------------------------------------------------------
// The collection. Add / remove / reorder a tee = edit this list.
// Images live in public/img/merch/{slug}-{front|back}-{480|760}.{avif|webp}
// ------------------------------------------------------------
const MERCH_ITEMS = [
  { slug: "identity-black", name: "Where Music Reveals Identity", color: "Black" },
  { slug: "identity-white", name: "Where Music Reveals Identity", color: "White" },
  { slug: "no-song-requests-black", name: "No Song Requests", color: "Black" },
  { slug: "no-song-requests-white", name: "No Song Requests", color: "White" },
  { slug: "dance-now-black", name: "Dance Now, Think Later", color: "Black" },
  { slug: "dance-now-white", name: "Dance Now, Think Later", color: "White" },
  { slug: "music-answer-white", name: "Music Is The Answer", color: "White" },
];

const CONTACT_URL = "https://ig.me/m/decksandstories";
const IMG_W = 760;
const IMG_H = 1024;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function picture(slug, side, alt) {
  const base = `/img/merch/${slug}-${side}`;
  const sizes = "(min-width: 1024px) 280px, (min-width: 700px) 45vw, 50vw";
  return `
    <picture class="merch-face merch-face--${side}">
      <source type="image/avif" srcset="${base}-480.avif 480w, ${base}-760.avif 760w" sizes="${sizes}">
      <source type="image/webp" srcset="${base}-480.webp 480w, ${base}-760.webp 760w" sizes="${sizes}">
      <img src="${base}-760.webp" alt="${esc(alt)}" width="${IMG_W}" height="${IMG_H}" loading="lazy" decoding="async">
    </picture>`;
}

function card(item, i) {
  const label = `${item.name}, ${item.color}`;
  return `
    <li class="merch-item" data-reveal style="--reveal-i:${i % 8}">
      <article class="merch-card">
        <button class="merch-flip" type="button" aria-pressed="false" aria-label="Show the back of the ${esc(label)} tee">
          <span class="merch-tag">Limited</span>
          ${picture(item.slug, "front", `${label} tee, front`)}
          ${picture(item.slug, "back", `${label} tee, back`)}
          <span class="merch-side" aria-hidden="true">
            <span class="merch-side-front">Front</span><span class="merch-side-back">Back</span>
          </span>
        </button>
        <div class="merch-meta">
          <h3 class="merch-name">${esc(item.name)}</h3>
          <div class="merch-meta-row">
            <p class="merch-color">${esc(item.color)}</p>
            <button class="merch-size-btn" type="button" aria-haspopup="dialog" aria-controls="size-guide" data-item="${esc(label)}">Size guide</button>
          </div>
        </div>
      </article>
    </li>`;
}

function secretCard(i) {
  return `
    <li class="merch-item" data-reveal style="--reveal-i:${i % 8}">
      <a class="merch-secret" href="${CONTACT_URL}" target="_blank" rel="noopener noreferrer">
        <span class="merch-secret-mark" aria-hidden="true">?</span>
        <span class="merch-secret-title">Something else is coming</span>
        <span class="merch-secret-text">Ask us about the next drop</span>
      </a>
      <div class="merch-meta">
        <h3 class="merch-name">Unreleased</h3>
        <p class="merch-color">Message for more info</p>
      </div>
    </li>`;
}

function renderGrid() {
  const grid = document.querySelector(".merch-grid");
  if (!grid) return;
  grid.innerHTML = MERCH_ITEMS.map(card).join("") + secretCard(MERCH_ITEMS.length);
}

// Tap / click / Enter / Space flips a tee to its back and back again.
// On mouse devices hover also shows the back (CSS); the click makes it stick.
function initFlips() {
  document.querySelectorAll(".merch-flip").forEach((btn) => {
    const label = btn.getAttribute("aria-label").replace(/^Show the back of /, "");
    btn.addEventListener("click", () => {
      const toBack = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(toBack));
      btn.setAttribute("aria-label", `${toBack ? "Show the front of" : "Show the back of"} ${label}`);
    });
  });
}

// One shared size guide (S / M / L) for every tee.
function initSizeGuide() {
  const dialog = document.getElementById("size-guide");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const itemLine = dialog.querySelector("[data-size-guide-item]");

  const close = () => dialog.close();
  dialog.addEventListener("close", () => document.documentElement.classList.remove("size-guide-open"));
  dialog.querySelector("[data-size-guide-close]")?.addEventListener("click", close);
  // Click on the dimmed backdrop (outside the panel) closes it.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });

  document.querySelectorAll(".merch-size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (itemLine) itemLine.textContent = btn.dataset.item || "";
      document.documentElement.classList.add("size-guide-open");
      dialog.showModal();
    });
  });
}

renderGrid();
initFlips();
initSizeGuide();
tagReveals();
initRevealsLite();
