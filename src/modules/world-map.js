// ============================================================
// world-map.js — interactive featured-countries SVG map.
// Reuses [data-countries-stat] / [data-count-to] from render.js + reveals.js.
// Desktop: floating tooltip. Mobile: bottom-sheet for a single pin.
// "See all" opens a roster grid of every featured country.
// Ambient: soft cycling DJ nick + country labels near pins.
// ============================================================

import geometry from "../data/world-geometry.json";
import { countries } from "../data/content.js";

const VIEW_W = 980;
const VIEW_H = 480;
/** Region helper bbox (x 450–622, y 48–198) — kept for future use. */
const CLUSTER_BOX = { x: 450, y: 48, w: 172, h: 150 };
void CLUSTER_BOX;

const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width: 620px)").matches;

const CONTAINER_PAD = 10;
const PIN_LABEL_OFFSET = 9;

/** Shift a viewport rect inward when it overflows container edges. */
function clampRectToContainer(rect, containerRect, pad) {
  const minX = containerRect.left + pad;
  const maxX = containerRect.right - pad;
  const minY = containerRect.top + pad;
  const maxY = containerRect.bottom - pad;
  let dx = 0;
  let dy = 0;
  if (rect.left < minX) dx = minX - rect.left;
  else if (rect.right > maxX) dx = maxX - rect.right;
  if (rect.top < minY) dy = minY - rect.top;
  else if (rect.bottom > maxY) dy = maxY - rect.bottom;
  return { dx, dy };
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}

function artistsLabel(c) {
  return (c.artists || []).join(", ");
}

function hitRadiusPx12(svgEl) {
  const rect = svgEl.getBoundingClientRect();
  if (!rect.width) return 12;
  const scale = svgEl.viewBox.baseVal.width / rect.width;
  return 12 * scale;
}

export function initWorldMap() {
  const shell = document.querySelector("[data-world-map]");
  const svg = shell?.querySelector(".world-map-svg");
  if (!shell || !svg) return;

  const byIso = Object.fromEntries(countries.map((c) => [c.iso2, c]));
  const lands = geometry;
  const featured = lands.filter((g) => g.isFeatured && byIso[g.iso2] && g.cx != null);

  const tooltip = ensureTooltip();
  const sheet = document.getElementById("map-sheet");
  const seeAllBtn = shell.querySelector("[data-map-see-all]");
  if (seeAllBtn) seeAllBtn.textContent = `See all ${countries.length} countries`;

  let activePin = null;
  let floatTimer = 0;
  let floatHideTimer = 0;
  let floatEl = null;
  let floatShowing = false;
  let sheetOpen = false;
  let resizeTimer = 0;

  buildMainMap();
  wireChrome();

  if (!reduceMotion()) startFloatingNicks();

  function meta(iso2) {
    return byIso[iso2];
  }

  function buildMainMap() {
    const paths = lands
      .map((g) => {
        const featuredCls = g.isFeatured && byIso[g.iso2] ? " is-featured" : "";
        return `<path class="map-land${featuredCls}" d="${g.d}" data-iso="${g.iso2}"></path>`;
      })
      .join("");

    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
    svg.innerHTML = `${paths}<g class="map-pins"></g>`;

    const hitR = hitRadiusPx12(svg);
    const pinsHost = svg.querySelector(".map-pins");
    featured.forEach((g) => pinsHost.appendChild(makePin(g, hitR)));
  }

  function makePin(g, hitR) {
    const m = meta(g.iso2);
    const r = 3.4;
    const el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    el.setAttribute("class", "map-pin");
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${m.name}, featuring ${artistsLabel(m)}`);
    el.dataset.iso = g.iso2;
    el.innerHTML = `
      <circle class="map-pulse" cx="${g.cx}" cy="${g.cy}" r="${r}"></circle>
      <circle class="map-dot" cx="${g.cx}" cy="${g.cy}" r="${r * 0.55}"></circle>
      <circle class="map-hit" cx="${g.cx}" cy="${g.cy}" r="${hitR}" fill="transparent"></circle>`;
    attachPin(el, g);
    return el;
  }

  function refreshHitRadii() {
    const hitR = hitRadiusPx12(svg);
    svg.querySelectorAll(".map-hit").forEach((c) => c.setAttribute("r", String(hitR)));
  }

  function attachPin(el, g) {
    const m = meta(g.iso2);
    el.addEventListener("mouseenter", () => {
      if (finePointer()) showTooltip(el, m);
    });
    el.addEventListener("mouseleave", () => {
      if (finePointer()) hideTooltip();
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (finePointer()) {
        if (activePin === el) hideTooltip();
        else showTooltip(el, m);
      } else {
        openSheetCountry(m);
      }
    });
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (finePointer()) showTooltip(el, m);
      else openSheetCountry(m);
    });
  }

  function showTooltip(el, m) {
    if (activePin) activePin.classList.remove("is-active");
    activePin = el;
    el.classList.add("is-active");
    tooltip.querySelector(".map-tooltip-country").textContent = m.name;
    tooltip.querySelector(".map-tooltip-artists").textContent = artistsLabel(m);
    positionTooltip(el.querySelector(".map-hit") || el.querySelector(".map-dot"));
    tooltip.classList.add("is-show");
  }

  function hideTooltip() {
    if (activePin) activePin.classList.remove("is-active");
    activePin = null;
    tooltip.classList.remove("is-show");
  }

  function positionTooltip(target) {
    if (!target) return;
    const anchor = target.getBoundingClientRect();
    const pad = 12;
    const viewport = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

    let x = anchor.left + anchor.width / 2;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${anchor.top}px`;

    let { dx, dy } = clampRectToContainer(tooltip.getBoundingClientRect(), viewport, pad);
    if (dx || dy) {
      x += dx;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${Math.max(pad, anchor.top + dy)}px`;
      ({ dx } = clampRectToContainer(tooltip.getBoundingClientRect(), viewport, pad));
      if (dx) tooltip.style.left = `${x + dx}px`;
    }
  }

  function openSheetCountry(m) {
    if (!sheet) return;
    sheet.querySelector(".map-sheet-title").textContent = m.name;
    sheet.querySelector(".map-sheet-body").innerHTML =
      `<p class="map-sheet-artists">${esc(artistsLabel(m))}</p>`;
    openSheet();
  }

  function openSheetAll() {
    if (!sheet) return;
    hideTooltip();
    const n = countries.length;
    sheet.querySelector(".map-sheet-title").textContent = `All featured countries — ${n}`;

    const items = [...featured]
      .map((g) => meta(g.iso2))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (m) => `<div class="map-roster-item">
          <span class="map-roster-flag">${m.flag}</span>
          <span class="map-roster-text">
            <span class="map-roster-name">${esc(m.name)}</span>
            <span class="map-roster-artist">${esc(artistsLabel(m))}</span>
          </span>
        </div>`,
      )
      .join("");

    sheet.querySelector(".map-sheet-body").innerHTML = `<div class="map-roster">${items}</div>`;
    openSheet();
  }

  function openSheet() {
    sheetOpen = true;
    stopFloatingNicks();
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("is-open"));
    document.documentElement.classList.add("map-sheet-open");
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove("is-open");
    document.documentElement.classList.remove("map-sheet-open");
    const finish = () => {
      sheet.hidden = true;
      sheetOpen = false;
      resumeFloatingNicks();
    };
    const done = () => {
      sheet.removeEventListener("transitionend", done);
      finish();
    };
    sheet.addEventListener("transitionend", done);
    setTimeout(() => {
      if (!sheet.classList.contains("is-open")) finish();
    }, 400);
  }

  function wireChrome() {
    seeAllBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSheetAll();
    });
    sheet?.querySelector(".map-sheet-close")?.addEventListener("click", closeSheet);
    sheet?.querySelector(".map-sheet-backdrop")?.addEventListener("click", closeSheet);
    document.addEventListener("click", hideTooltip);
    window.addEventListener("scroll", hideTooltip, { passive: true });
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refreshHitRadii, 120);
      },
      { passive: true },
    );
    window.addEventListener("orientationchange", () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshHitRadii, 180);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      hideTooltip();
      closeSheet();
    });
  }

  /** Soft ambient: DJ nick + country fade in near random featured pins. */
  function ensureFloatEl() {
    if (floatEl) return floatEl;
    floatEl = document.createElement("div");
    floatEl.className = "map-float-nick";
    floatEl.setAttribute("aria-hidden", "true");
    floatEl.innerHTML =
      '<span class="map-float-nick-artist"></span><span class="map-float-nick-country"></span>';
    shell.appendChild(floatEl);
    return floatEl;
  }

  function stopFloatingNicks() {
    clearTimeout(floatTimer);
    clearTimeout(floatHideTimer);
    floatTimer = 0;
    floatHideTimer = 0;
    floatShowing = false;
    floatEl?.classList.remove("is-show", "is-below");
  }

  function resumeFloatingNicks() {
    if (reduceMotion() || sheetOpen || document.hidden) return;
    scheduleFloatCycle(700);
  }

  function positionFloatNick(g) {
    const el = ensureFloatEl();
    const shellRect = shell.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const dotX = svgRect.left - shellRect.left + (g.cx / VIEW_W) * svgRect.width;
    const dotY = svgRect.top - shellRect.top + (g.cy / VIEW_H) * svgRect.height;
    const pad = CONTAINER_PAD;

    el.classList.remove("is-below");
    el.style.visibility = "hidden";

    // Default: label above pin (anchor = bottom-center via translate -100%).
    el.style.left = `${dotX}px`;
    el.style.top = `${dotY - PIN_LABEL_OFFSET}px`;

    const labelH = el.offsetHeight;
    const predictedTop = dotY - PIN_LABEL_OFFSET - labelH;
    const flipBelow = predictedTop < pad;

    if (flipBelow) {
      el.classList.add("is-below");
      el.style.top = `${dotY + PIN_LABEL_OFFSET}px`;
    }

    el.style.visibility = "";

    let rect = el.getBoundingClientRect();
    let { dx, dy } = clampRectToContainer(rect, shellRect, pad);
    if (dx || dy) {
      const curLeft = parseFloat(el.style.left) || dotX;
      const curTop = parseFloat(el.style.top) || dotY;
      el.style.left = `${curLeft + dx}px`;
      el.style.top = `${curTop + dy}px`;
      rect = el.getBoundingClientRect();
      ({ dx, dy } = clampRectToContainer(rect, shellRect, pad));
      if (dx || dy) {
        el.style.left = `${parseFloat(el.style.left) + dx}px`;
        el.style.top = `${parseFloat(el.style.top) + dy}px`;
      }
    }
  }

  function scheduleFloatCycle(delayMs) {
    clearTimeout(floatTimer);
    floatTimer = window.setTimeout(runFloatCycle, delayMs);
  }

  function runFloatCycle() {
    floatTimer = 0;
    if (sheetOpen || document.hidden || !featured.length || reduceMotion()) return;
    // Mobile: never stack — wait until the previous label finished hiding.
    if (isMobile() && floatShowing) {
      scheduleFloatCycle(400);
      return;
    }

    const g = featured[Math.floor(Math.random() * featured.length)];
    const m = meta(g.iso2);
    const el = ensureFloatEl();
    const artistEl = el.querySelector(".map-float-nick-artist");
    const countryEl = el.querySelector(".map-float-nick-country");

    artistEl.textContent = artistsLabel(m);
    countryEl.textContent = m.name;

    if (sheetOpen) return;

    positionFloatNick(g);

    if (sheetOpen) return;

    floatShowing = true;
    el.classList.add("is-show");

    const showMs = 1100;
    clearTimeout(floatHideTimer);
    floatHideTimer = window.setTimeout(() => {
      floatHideTimer = 0;
      el.classList.remove("is-show");
      floatShowing = false;
      if (!sheetOpen && !document.hidden && !reduceMotion()) {
        scheduleFloatCycle(1200 + Math.random() * 700);
      }
    }, showMs);
  }

  function startFloatingNicks() {
    ensureFloatEl();
    scheduleFloatCycle(700);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopFloatingNicks();
      else resumeFloatingNicks();
    });
  }
}

function ensureTooltip() {
  let tip = document.getElementById("map-tooltip");
  if (tip) return tip;
  tip = document.createElement("div");
  tip.id = "map-tooltip";
  tip.className = "map-tooltip";
  tip.innerHTML =
    '<div class="map-tooltip-country"></div><div class="map-tooltip-artists"></div>';
  document.body.appendChild(tip);
  return tip;
}
