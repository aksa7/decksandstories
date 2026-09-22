// Shared entry for /privacy/ and /cookies/
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections/cookie-consent.css";
import "./styles/sections/legal.css";
import { initCookieConsent } from "./modules/cookie-consent.js";

initCookieConsent();
