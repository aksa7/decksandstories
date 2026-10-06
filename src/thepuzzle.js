// /thepuzzle — ADE QR landing entry.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/cards.css";
import "./styles/sections/blocks.css";
import "./styles/sections/cookie-consent.css";
import "./styles/sections/reveal.css";
import "./styles/sections/thepuzzle.css";

import { initRevealsLite, tagReveals } from "./modules/reveals.js";

tagReveals();
initRevealsLite();
