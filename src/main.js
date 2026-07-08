// decksandstories.com v2 — entry point.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/layout.css";
import "./styles/sections/cards.css";
import "./styles/sections/countries.css";
import "./styles/sections/gallery.css";
import "./styles/sections/blocks.css";
import "./styles/sections/vinyl.css";

import { renderContent } from "./modules/render.js";
import { initInteractions } from "./modules/interactions.js";
import { createVinyl } from "./modules/vinyl.js";

renderContent();
initInteractions();

// Hero vinyl centerpiece. Scroll choreography (setSpeed/pulse driving) is wired in F5.
const stage = document.querySelector(".vinyl-stage");
const canvas = stage?.querySelector(".vinyl-canvas");
if (canvas) {
  createVinyl(canvas, { logoSrc: "/img/1920x1080DCKS_transparent.webp" });
  stage.classList.add("is-ready");
}
