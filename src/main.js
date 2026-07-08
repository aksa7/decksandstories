// decksandstories.com v2 — entry point.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/layout.css";
import "./styles/sections/cards.css";
import "./styles/sections/countries.css";
import "./styles/sections/gallery.css";
import "./styles/sections/blocks.css";
import "./styles/sections/vinyl.css";
import "./styles/sections/reveal.css";

import { renderContent } from "./modules/render.js";
import { initInteractions } from "./modules/interactions.js";
import { createVinyl } from "./modules/vinyl.js";
import { tagReveals } from "./modules/reveals.js";

renderContent();
initInteractions();

// Tag reveal targets synchronously so their hidden initial state applies
// before first paint (no flash-of-content), before the tier driver loads.
tagReveals();

// Hero vinyl centerpiece.
const stage = document.querySelector(".vinyl-stage");
const canvas = stage?.querySelector(".vinyl-canvas");
let vinyl = null;
if (canvas) {
  vinyl = createVinyl(canvas, { logoSrc: "/img/1920x1080DCKS_transparent.webp" });
  stage.classList.add("is-ready");
}

// Pick tier at runtime — the two are mutually exclusive.
// Desktop = full scroll-scrubbed choreography (anime.js, lazy-loaded when idle
// so it never blocks the hero LCP). Everything else = lite reveals (no anime.js).
const desktopFull =
  matchMedia("(min-width: 1024px)").matches &&
  matchMedia("(prefers-reduced-motion: no-preference)").matches;

const loadTier = () => {
  if (desktopFull) {
    document.documentElement.classList.add("tier-scroll");
    import("./modules/scroll.js").then((m) => m.initScrollExperience(vinyl));
  } else {
    import("./modules/reveals.js").then((m) => m.initRevealsLite());
  }
};

if ("requestIdleCallback" in window) {
  requestIdleCallback(loadTier, { timeout: 1500 });
} else {
  setTimeout(loadTier, 300);
}
