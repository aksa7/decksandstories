// ============================================================
// gallery.js — lightweight custom lightbox (replaces lightGallery).
// Masonry grid links open a full-screen overlay with prev/next, Esc / click-out
// to close, keyboard navigation and a focus trap. Uses the optimized srcset.
// ============================================================

import { gallery } from "../data/content.js";

const IMG = "/img";
let overlay, pic, imgEl, capEl, counterEl, prevBtn, nextBtn, closeBtn;
let idx = 0;
let lastFocus = null;

function srcset(base, widths, ext) {
  return widths.map((w) => `${IMG}/${base}-${w}.${ext} ${w}w`).join(", ");
}

function build() {
  overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Gallery image viewer");
  overlay.innerHTML = `
    <button class="lb-btn lb-close" type="button" aria-label="Close">×</button>
    <button class="lb-btn lb-prev" type="button" aria-label="Previous image">‹</button>
    <figure class="lb-figure">
      <picture class="lb-pic">
        <source class="lb-avif" type="image/avif">
        <source class="lb-webp" type="image/webp">
        <img class="lb-img" alt="">
      </picture>
      <figcaption class="lb-cap"></figcaption>
    </figure>
    <button class="lb-btn lb-next" type="button" aria-label="Next image">›</button>
    <div class="lb-counter" aria-hidden="true"></div>`;
  document.body.appendChild(overlay);

  pic = overlay.querySelector(".lb-pic");
  imgEl = overlay.querySelector(".lb-img");
  capEl = overlay.querySelector(".lb-cap");
  counterEl = overlay.querySelector(".lb-counter");
  prevBtn = overlay.querySelector(".lb-prev");
  nextBtn = overlay.querySelector(".lb-next");
  closeBtn = overlay.querySelector(".lb-close");

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(); // click-out
  });
}

function render() {
  const item = gallery[idx];
  overlay.querySelector(".lb-avif").srcset = srcset(item.base, item.widths, "avif");
  overlay.querySelector(".lb-webp").srcset = srcset(item.base, item.widths, "webp");
  imgEl.src = `${IMG}/${item.base}.webp`;
  imgEl.alt = item.alt;
  imgEl.width = item.w;
  imgEl.height = item.h;
  capEl.textContent = item.alt;
  counterEl.textContent = `${idx + 1} / ${gallery.length}`;
}

function open(i) {
  idx = i;
  lastFocus = document.activeElement;
  render();
  overlay.classList.add("is-open");
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKey);
  closeBtn.focus();
}

function close() {
  overlay.classList.remove("is-open");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKey);
  lastFocus?.focus();
}

function go(d) {
  idx = (idx + d + gallery.length) % gallery.length;
  render();
}

function onKey(e) {
  if (e.key === "Escape") return close();
  if (e.key === "ArrowRight") return go(1);
  if (e.key === "ArrowLeft") return go(-1);
  if (e.key === "Tab") {
    // focus trap across the three controls
    const f = [closeBtn, prevBtn, nextBtn];
    const i = f.indexOf(document.activeElement);
    e.preventDefault();
    const next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
    f[next].focus();
  }
}

export function initGallery() {
  const grid = document.querySelector("[data-grid=gallery]");
  if (!grid) return;
  build();
  grid.addEventListener("click", (e) => {
    const link = e.target.closest(".gallery-item");
    if (!link) return;
    e.preventDefault();
    open(Number(link.dataset.galleryIndex) || 0);
  });
}
