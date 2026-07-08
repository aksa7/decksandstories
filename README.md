# Decks&Stories — Website

**Live URL:** [decksandstories.com](https://decksandstories.com)  
**Hosting:** GitHub Pages + Cloudflare (CDN, DNS, Cache)  
**Tech:** Plain HTML · CSS · Vanilla JS — zero frameworks, zero build tools

---

## Project Overview

Decks&Stories is a global electronic music platform featuring international DJ mixes and the human stories behind each set. This is a fully static website — no server, no database, no CMS. Every page is a hand-written HTML file deployed directly via GitHub Pages.

---

## File & Folder Structure

```
decksandstories/
│
├── index.html               # Main landing page (home)
├── styles.css               # All global styles (1230 lines)
├── script.js                # All JS for index.html (426 lines)
│
├── submit/
│   └── index.html           # Mix / demo / event submission page
├── submit.css               # Styles for submit page (648 lines)
├── submit.js                # JS for submit page — form logic, tab switching (242 lines)
│
├── registration/
│   └── index.html           # Open Decks event DJ registration page
├── registration.css         # Styles for registration page
│
├── thank-you/
│   └── index.html           # Thank-you page shown after form submit
│
├── assets/                  # All static assets
│   ├── *.webp               # All images (logos, backgrounds, OG images)
│   ├── *.png                # Favicons + 2 sponsor logos still in PNG
│   ├── *.avif               # SUN365 logo (sun365logo.avif)
│   ├── favicon.ico          # Browser favicon
│   ├── submissionGuidelines.pdf  # PDF linked in submit form
│   ├── og-image.webp        # Open Graph share image for homepage
│   ├── submit-og-image.webp # Open Graph share image for /submit/
│   ├── herovisual.webp      # Full-bleed background photo (hero + submit bg)
│   ├── fourPeople.webp      # Background photo for episodes & gallery sections
│   ├── 1920x1080DCKS_transparent.webp  # Hero logo (used on all pages)
│   └── pickaquestion/       # 10 artist portrait thumbnails (.webp)
│
├── gallery/                 # Gallery photos (all .webp, 13 files)
│
├── icons/                   # SVG control icons for the music bar
│   ├── play.svg
│   ├── pause.svg
│   ├── prev.svg
│   ├── next.svg
│   └── close.svg
│
├── CNAME                    # Custom domain: decksandstories.com
├── robots.txt               # Allow all, points to sitemap
├── sitemap.xml              # XML sitemap for SEO
└── .htaccess                # Cache headers (Apache fallback, Cloudflare does the real work)
```

---

## Pages

| URL | File | Purpose |
|-----|------|---------|
| `/` | `index.html` | Main landing page — hero, episodes, studio sessions, Pick a Question, gallery, collab CTA |
| `/submit/` | `submit/index.html` | Three-tab submission form (Mix episode / Demo track / Event proposal) |
| `/registration/` | `registration/index.html` | Open Decks DJ contest registration |
| `/thank-you/` | `thank-you/index.html` | Post-form redirect confirmation page |

---

## Sections in index.html

1. **Bottom Music Bar** — YouTube playlist player (fixed bar, always visible)
2. **Hero** — logo, H1, navigation, ADE collab note
3. **Who Trusts Us** — partner logos (CULT, TEILE, beskar, runemark, SUN365)
4. **Countries Featured** — country pill grid (22 countries)
5. **About** — platform mission text
6. **Episodes** — 6 latest YouTube episode cards
7. **Studio Sessions** — 6 latest YouTube studio session cards
8. **Pick a Question** — 6 Instagram Reels cards with artist portraits
9. **Gallery** — lightGallery grid (13 photos)
10. **Collab / Reach Out** — CTA with two buttons
11. **Social Dock Bar** — fixed social icons (FB, IG, YouTube, BuyMeACoffee)
12. **Newsletter Toast** — scroll-triggered email signup popup (Formspree)

---

## JavaScript — What Each File Does

### `script.js` (index.html only)
- **Page fade-in** — removes `is-preload` class on `window.load`
- **Smooth scroll** — handles all `.scrolly` anchor links
- **Clickable media cards** — whole card opens YouTube in new tab; hides placeholder cards
- **YouTube Bar Player** — loads YT IFrame API, plays a random track from playlist `PLpO5SCIZiofW3wdYBluol3nICkDQRxrP3`, handles play/pause/next/prev/volume/close, persists volume + last track index in `localStorage`
- **LightGallery init** — initialises `#utopija-gallery` with zoom + thumbnail plugins
- **Newsletter Toast** — scroll-triggered (35% scroll depth), Formspree submission, 14-day hide cooldown via `localStorage`

### `submit.js` (submit/index.html only)
- **Tab switching** — Mix / Demo / Event form tabs
- **Story builder** — combines story textarea fields into a hidden input before submit
- **Quiz builder** — combines 6 quiz answer fields into a hidden textarea before submit
- **Scroll-spy nav** — highlights active nav link based on scroll position

---

## External Services

| Service | What it's used for |
|---------|-------------------|
| **GitHub Pages** | Static hosting |
| **Cloudflare** | CDN, DNS, HTTPS, cache rules, DDoS protection |
| **Formspree** | Three separate form endpoints (mix, demo, event submission + newsletter) |
| **Google Fonts** | Lexend Deca (loaded async) |
| **YouTube IFrame API** | Music bar playlist player |
| **lightGallery v2.7.1** | Fullscreen gallery with zoom + thumbnails (loaded async CSS) |
| **cdn.jsdelivr.net** | lightGallery JS + CSS delivery |

---

## CSS Architecture

All styles live in two files:

- **`styles.css`** (1230 lines) — global styles + all section styles + gallery CSS (merged from `gallery.css`)
  - Custom properties-free — uses direct `rgba()` values throughout
  - Background sections: `.intro-about-bg`, `.episodes-studio-bg`, `.gallery-reachout-bg`
  - Media bar: `#yt-bar-player-container`
  - Social dock: `.social-fixed-bar`
  - Newsletter toast: `.nl-toast`
- **`submit.css`** (648 lines) — submit page only; `body.submit-page` background uses `herovisual.webp` with `backdrop-filter: blur`
- **`registration.css`** — registration page styles

---

## Images — Current State

All images have been converted to **WebP** format (originals deleted).  
Gallery photos were converted with `--autoOrient` to bake EXIF rotation into pixels.

| Directory | Count | Format | Quality |
|-----------|-------|--------|---------|
| `gallery/` | 13 | `.webp` | 82 |
| `assets/pickaquestion/` | 10 | `.webp` | 82 |
| `assets/` — photos | 9 | `.webp` | 82 |
| `assets/` — logos/branding | 20 | `.webp` | 90 |
| `assets/` — favicons | 7 | `.png` / `.ico` | original |
| `assets/` — special | 2 | `.avif` / `.pdf` | original |

---

## Performance Optimisations Applied

- All images → WebP (47–71% size reduction on gallery photos)
- Hero logo preloaded: `<link rel="preload" as="image" fetchpriority="high">`
- Google Fonts loaded async (`media="print"` + `onload` swap)
- lightGallery CSS loaded async (`rel="preload"` + `onload` swap)
- Hero `<img>` has `loading="eager" fetchpriority="high" decoding="sync"`
- All other images have `loading="lazy" decoding="async"`
- `<picture>` + `<source type="image/webp">` on every local image
- `width` + `height` attributes on all images (prevents layout shift)
- CSS background images use plain `url("*.webp")` — no `image-set()`
- YouTube IFrame API loaded dynamically (not blocking)
- `.htaccess` cache headers (1 year for images, 3 months for CSS/JS)
- Cloudflare CDN + Cache Rules in front of GitHub Pages

---

## SEO

- Unique `<title>` and `<meta description>` per page
- `<link rel="canonical">` on every page
- JSON-LD structured data: `WebSite`, `Organization`, `ItemList` (episodes)
- `og:image` → `assets/og-image.webp` (homepage)
- `og:image` → `assets/submit-og-image.webp` (/submit/)
- `robots.txt` + `sitemap.xml` in root

---

## Deployment

Push to `main` branch → GitHub Pages auto-deploys → Cloudflare serves from cache.  
No build step. No npm. No bundler. Direct file deployment.

```bash
git add .
git commit -m "your message"
git push origin main
```

> **Cloudflare cache purge:** After pushing major CSS/JS/image changes, purge the Cloudflare cache manually from the dashboard (Caching → Purge Everything) or wait for TTL expiry.

---

## Known Issues / TODO

- `balansas_white_300x300.png` and `bronx.png` still in PNG (referenced in registration page — needs WebP update)
- `letterExample.jpg` and `photoExample.jpg` kept as fallback in `<picture>` tags (webp versions exist)
- `firebase-debug.log` in root — leftover from Firebase experiment, safe to delete
- PageSpeed mobile score: ~56 — main bottleneck is YouTube IFrame API and render-blocking third-party scripts
