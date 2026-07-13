// decksandstories.com v2 — entry point.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/layout.css";
import "./styles/sections/hero.css";
import "./styles/sections/cards.css";
import "./styles/sections/countries.css";
import "./styles/sections/gallery.css";
import "./styles/sections/blocks.css";
import "./styles/sections/reveal.css";

import { renderContent } from "./modules/render.js";
import { initInteractions } from "./modules/interactions.js";
import { initMobileNav } from "./modules/nav.js";
import { tagReveals } from "./modules/reveals.js";
import { initGallery } from "./modules/gallery.js";

renderContent();
initInteractions();
initMobileNav();
initGallery();

tagReveals();

const desktopFull =
  matchMedia("(min-width: 1024px)").matches &&
  matchMedia("(prefers-reduced-motion: no-preference)").matches;

const loadTier = () => {
  if (desktopFull) {
    document.documentElement.classList.add("tier-scroll");
    import("./modules/scroll.js").then((m) => m.initScrollExperience());
  } else {
    import("./modules/reveals.js").then((m) => m.initRevealsLite());
  }
};

if ("requestIdleCallback" in window) {
  requestIdleCallback(loadTier, { timeout: 1500 });
} else {
  setTimeout(loadTier, 300);
}
