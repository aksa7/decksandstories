# Decks&Stories — Website (v2)

**Live:** [decksandstories.com](https://decksandstories.com) · A global electronic music platform sharing international DJ mixes and the human stories behind each set.

Crimson-matte, cinematic, vinyl-centered experience. Full scroll-scrubbed choreography on desktop, a deliberately lighter tier on mobile — targeting (and hitting) 100 Lighthouse mobile.

## Stack

- Vanilla HTML / CSS / JS, bundled with **Vite** (multi-page).
- **anime.js v4** for the desktop scroll experience (lazy-loaded, desktop-only chunk).
- 2D canvas vinyl centerpiece (no WebGL).
- Self-hosted **Space Grotesk** (subset woff2, no Google Fonts).
- Deploy: **Cloudflare Pages**.

## Develop

```bash
npm install
npm run dev        # vite dev server
npm run build      # → dist/
npm run preview    # serve the production build
```

## Asset pipelines

Optimized images are committed under `public/img/`, so a normal build needs neither
`sharp` nor network access. Re-run only when source images change:

```bash
npm run images     # sharp: assets/ + gallery/ → public/img (AVIF+WebP srcset, ≤250KB)
npm run yt         # download + optimize YouTube episode thumbnails → public/img/yt-*
```

Source images live in `assets/` and `gallery/` (pipeline inputs only — not shipped).

## Structure

```
index.html, submit/, thank-you/   # page entries (Vite multi-page)
public/                           # copied verbatim (img, fonts, favicons, robots, sitemap, _headers, CNAME)
src/
  main.js  submit.js  thank-you.js   # entry points
  data/content.js                    # all content (episodes, sessions, countries, gallery, …)
  modules/                           # vinyl, scroll (desktop), reveals (mobile), ytFacade, gallery, render, interactions
  styles/                            # tokens.css, base.css, sections/*.css
scripts/                            # optimize-images.mjs, fetch-yt-thumbs.mjs
```

## Content

Add an episode / session / country / gallery item = push one object to
`src/data/content.js`; cards render from data.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Node: 20+
- Cache headers: `public/_headers` (hashed assets + fonts immutable; images 30d).
