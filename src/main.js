// decksandstories.com v2 — entry point.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/layout.css";
import "./styles/sections/cards.css";
import "./styles/sections/countries.css";
import "./styles/sections/gallery.css";
import "./styles/sections/blocks.css";

import { renderContent } from "./modules/render.js";
import { initInteractions } from "./modules/interactions.js";

renderContent();
initInteractions();

// F4 (vinyl canvas) and F5 (scroll experience / reveals) wire in here later,
// tier-selected via matchMedia + prefers-reduced-motion.
