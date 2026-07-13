// ============================================================
// render.js — builds card grids & lists from content.js data.
// Runtime rendering keeps index.html markup minimal and data-driven.
// (No animations here — reveals/scroll choreography come in F4/F5.)
// ============================================================

import {
  nav,
  trustLogos,
  countries,
  countriesStat,
  episodes,
  sessions,
  pickAQuestion,
  gallery,
  socials,
} from "../data/content.js";

const IMG = "/img";

const esc = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Responsive <picture> from local AVIF/WebP variants (public/img/<base>-<w>.ext).
function picture({ base, widths, alt, w, h, sizes = "100vw", eager = false, className = "" }) {
  const set = (ext) => widths.map((wd) => `${IMG}/${base}-${wd}.${ext} ${wd}w`).join(", ");
  const fallbackW = widths[widths.length - 1];
  return `<picture>
      <source type="image/avif" srcset="${set("avif")}" sizes="${sizes}">
      <source type="image/webp" srcset="${set("webp")}" sizes="${sizes}">
      <img src="${IMG}/${base}-${fallbackW}.webp" alt="${esc(alt)}" width="${w}" height="${h}"
           loading="${eager ? "eager" : "lazy"}" decoding="async"${className ? ` class="${className}"` : ""}>
    </picture>`;
}

// Simple single-image logo (tiny assets — no srcset needed).
function logo(base, alt, w, h, format = "webp") {
  const dims = w && h ? ` width="${w}" height="${h}"` : "";
  return `<img src="${IMG}/${base}.${format}" alt="${esc(alt)}"${dims} loading="lazy" decoding="async">`;
}

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

function mediaCard({ title, genre, number, ytId, text }, kind) {
  const url = `https://www.youtube.com/watch?v=${ytId}`;
  const displayTitle = genre ? `${title} | ${genre}` : title;
  const badge = kind === "episode" ? `Episode #${number}` : `Studio Session #${number}`;
  const cta = kind === "episode" ? "Watch Episode" : "Watch Session";
  // Local optimized thumbnail — whole thumb + play icon link to YouTube (no embed).
  return `<article class="card">
      <a class="card-thumb" href="${url}" target="_blank" rel="noopener" aria-label="Watch ${esc(displayTitle)} on YouTube">
        ${picture({ base: `yt-${ytId}`, widths: [480, 800], alt: "", w: 800, h: 450, sizes: "(max-width: 700px) 100vw, 33vw" })}
        <span class="card-play" aria-hidden="true">${PLAY_ICON}</span>
      </a>
      <div class="card-body">
        <div class="card-head">
          <h3 class="card-title">${esc(displayTitle)}</h3>
          <span class="card-badge">${esc(badge)}</span>
        </div>
        <p class="card-text">${esc(text)}</p>
        <a class="btn" href="${url}" target="_blank" rel="noopener">${cta}</a>
      </div>
    </article>`;
}

function pickCard({ title, base, url, text }) {
  return `<article class="card" data-url="${url}">
      <div class="card-thumb">
        ${picture({ base, widths: [480, 800], alt: `Pick a Question - ${title}`, w: 400, h: 400, sizes: "(max-width: 700px) 100vw, 33vw" })}
      </div>
      <div class="card-body">
        <div class="card-head"><h3 class="card-title">${esc(title)}</h3></div>
        <p class="card-text">${esc(text)}</p>
        <a class="btn" href="${url}" target="_blank" rel="noopener">Watch on Instagram</a>
      </div>
    </article>`;
}

function galleryItem({ base, widths, alt, w, h }, i) {
  const fallbackW = widths[widths.length - 1];
  return `<a class="gallery-item" href="${IMG}/${base}-${fallbackW}.webp" data-gallery-index="${i}" aria-label="View: ${esc(alt)}">
      ${picture({ base, widths, alt, w, h, sizes: "(max-width: 700px) 50vw, 25vw" })}
    </a>`;
}

// Inject HTML into a container if it exists.
function fill(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function navItem(n) {
  return `<li><a href="${n.href}"${n.external ? "" : ' class="scrolly"'}>${esc(n.label)}</a></li>`;
}

export function renderContent() {
  const navHtml = nav.map(navItem).join("");

  // Primary nav (desktop) + mobile drawer
  fill("#hero-nav ul", navHtml);
  fill("#mobile-nav ul", navHtml);

  // Trust logos
  fill(
    "[data-grid=trust]",
    trustLogos
      .map(
        (t) =>
          `<a class="trust-logo${
            t.base === "sun365logo"
              ? " trust-logo--sun365"
              : t.base === "proeventsLogo"
                ? " trust-logo--proevents"
                : ""
          }" href="${t.url}" target="_blank" rel="noopener" aria-label="${esc(t.alt)}">${logo(
            t.base,
            t.alt,
            t.w,
            t.h,
            t.format || "webp",
          )}</a>`,
      )
      .join(""),
  );

  // Countries pills + stat footnote
  fill(
    "[data-grid=countries]",
    countries
      .map(
        (c) =>
          `<span class="country-pill"><span class="flag">${c.flag}</span><span>${esc(c.name)}</span></span>`,
      )
      .join(""),
  );
  fill(
    "[data-countries-stat]",
    `Already featured: <strong><span data-count-to="${countriesStat.featured}">${countriesStat.featured}</span>/${countriesStat.total}</strong> countries and counting.`,
  );

  // Episodes / Sessions / Pick a Question
  fill("[data-grid=episodes]", episodes.map((e) => mediaCard(e, "episode")).join(""));
  fill("[data-grid=sessions]", sessions.map((s) => mediaCard(s, "session")).join(""));
  fill("[data-grid=pick]", pickAQuestion.map(pickCard).join(""));

  // Gallery
  fill("[data-grid=gallery]", gallery.map(galleryItem).join(""));

  // Social dock
  fill(
    "[data-grid=social]",
    socials
      .map(
        (s) =>
          `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${logo(
            s.base,
            s.label,
            s.w,
            s.h,
          )}</a>`,
      )
      .join(""),
  );
}
