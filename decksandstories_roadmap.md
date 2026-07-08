# decksandstories.com v2 — Full Rebuild Roadmap

> Juoda-raudona, „animejs.com" tipo experience, bet 90+ Lighthouse ant mobile.
> Stack: vanilla HTML/CSS/JS + Vite build + anime.js v4. Hostingas: Cloudflare Pages.
> Promptai (kodavimui) — angliškai, kad tiktų Claude Code / Cursor. Paaiškinimai — lietuviškai.

> **UŽFIKSUOTI SPRENDIMAI (v2.1):**
> 1. Experience mastas: **PILNAS** scroll-eksperiencas (desktop) + griežtas lengvas mobile forkas.
> 2. Spalvos: **gili crimson-matinė** (elegantu, tamsu, kinematografiška — ne neonas).
> 3. Audio grotuvas: **PAŠALINTAS** (greitis svarbiau). Lieka tik YT facade epizodų kortelėm.

---

## 0. TL;DR

Tavo esama svetainė yra pastatyta ant seno HTML5UP šablono (todėl atrodo „template"), ir ją stabdo ne kodas, o **~30 MB paveiksliukų** (vienas gallery/kultura.webp = 6 MB) plius **YouTube IFrame API + lightGallery**, kurie krauna­si iškart.

Planas: perstatom nuo nulio kaip vieną „vinilo experience" (centrinis besisukantis vinilas = navigacijos ašis, sekcijos atsiranda scroll'inant per anime.js v4), su griežtu greitaveikos pipeline. Šablonišką dizainą keičiam į savą juoda-raudona kryptį.

Rezultatas: greičiau, gražiau, smagiau, ir realiai pasiekiami 90+ mobile.

---

## 1. Esamos būklės analizė

### Kas jau padaryta gerai (ką IŠLAIKOM)
- Švarus statinis stack (HTML/CSS/JS) — teisinga kryptis greičiui.
- Stipri SEO bazė: JSON-LD (WebSite, Organization, ItemList su epizodais), OG/Twitter meta, canonical, sitemap, robots.
- Loginė struktūra: Hero → Trust → Countries → About → Episodes → Studio Sessions → Pick a Question → Gallery → Collab → Newsletter.
- Turinys jau angliškas (tarptautinei auditorijai) — paliekam.
- Apatinis YouTube „bar player" — signature feature (bet jį reikia optimizuoti, žr. F6).

### Kas realiai stabdo (išmatuota tavo faile)
| Problema | Detalė | Poveikis |
|---|---|---|
| Milžiniški paveiksliukai | `gallery/kultura.webp` = **6 MB**, `og-image.webp` = 2.3 MB, `submit-og` = 2.3 MB, dar ~6 gallery failai po 1-2 MB. Viso `gallery/` = **20 MB**, `assets/` = 9.3 MB | Didžiausias LCP / bandwidth žudikas |
| YouTube IFrame API | Kraunasi per `load`, autoplay „kick" listeneriai | Blokuoja main thread, LCP/TBT |
| lightGallery | CSS bundle + 3 JS failai iš CDN | +4 request'ai, render delay |
| Google Fonts (Lexend Deca, 5 svoriai) | External request | Render-blocking rizika + extra RTT |
| Nėra responsive `srcset` | Vienas dydis visiems ekranams | Mobile tempia desktop-dydžio nuotraukas |
| Junk repo | `firebase-debug.log`, `.DS_Store`, `__MACOSX` | Švara, ne greitis, bet tvarkom |

### Kodėl atrodo „nekažka"
Klasės `is-preload`, `main fullscreen`, `inner`, `major`, „split" — tai klasikinis **HTML5UP** šablono skeletas. Animacijų beveik nėra: tik `fade-in`/`fade-up` per `load`, hover transform'ai ir vienas bėgantis tekstas. Šalys — emoji vėliavos (`🇱🇹` pills) atrodo pigiai. Nėra jokios centrinės idėjos, kuri „laikytų" puslapį.

---

## 2. Tikslas + sąžininga įžanga (svarbu perskaityti)

Nori dviejų dalykų vienu metu:
1. **animejs.com „experience" pojūtis** — puslapis kaip žaidimas, viena gyva centrinė figūra, choreografuotas scroll.
2. **90+ Lighthouse ant mobile.**

Būk sąmoningas: **pats animejs.com NĖRA 90+ mobile** — tai showcase, kuris aukoja greitį dėl efekto. Todėl mes negalim aklai kopijuoti. Mūsų kelias — paimti *pojūtį*, bet ne svorį:

- Viena centrinė canvas figūra (vinilas) = pigi (2D canvas, ne WebGL).
- anime.js v4 = tik ~10 KB (arba ~3 KB WAAPI-only), tree-shakeable.
- Sunkus scroll-choreografavimas — **tik desktop**; mobile gauna lengvesnę versiją.
- `prefers-reduced-motion` gerbiamas.
- Visa kita apačioj — lazy.

Taip gauni „wow" ant desktop IR 90+ ant mobile. Tai realu.

**Tavo pasirinkimas — pilnas experience — reiškia vieną griežtą taisyklę:** desktop gauna visą scroll-scrubbed choreografiją (vinilas sukamas scroll'u, tonearm, „tracks", waveform ripple'iai). **Mobile NEGAUNA to paties sunkaus dalyko** — jis gauna sąmoningai lengvesnį „cinematic-lite" tier'į (paprastesnis vinilas, reveal'ai vietoj scroll-scrub, mažiau particle'ų). Tai ne kompromisas kokybėje — tai vienintelis būdas turėti ir pilną experience desktop, ir 90+ mobile. Vienas kodas, du tier'ai per `matchMedia` + `prefers-reduced-motion` guard'ą.

---

## 3. Sprendimas: architektūra

**Vanilla HTML/CSS/JS + Vite + anime.js v4.**

Kodėl Vite (o ne tik raw failai):
- Automatinis minify, code-splitting, asset hashing, tree-shaking — tiesiogiai kelia Lighthouse.
- Tu vis tiek rašai „paprastą" HTML/CSS/JS — Vite tik supakuoja.
- Tau, kaip Next.js dev'ui, tai 2 min setup, jokio overhead.
- `vite build` → statiniai failai → Cloudflare Pages (tą patį flow naudojai tvorteka.lt).

Kodėl anime.js v4:
- Mažas, modernus (named exports), turi `onScroll()` scroll-linked animacijoms out-of-the-box.
- Tas pats variklis, kurį naudoja animejs.com — gausi tą patį „feel".

---

## 4. Tooling: Claude Code vs Cursor (mano rekomendacija)

Naudok **abu, bet skirtingiems etapams**:

**Claude Code (pagrindinis „statybininkas" — F0-F4, F6-F8):**
- Scaffold'inti Vite, sukurti image-optimization skriptą (sharp), perpjaustyti monolitinį `index.html` į partials, generuoti vinilo canvas modulį, leisti `vite build` + Lighthouse ir matuoti, git ops.
- Jis agentic terminale: paleidžia komandas, pamato rezultatą, taiso pats. Idealu build + perf loop'ui.

**Cursor (fine-tuning — F5, poliravimas):**
- Gyvas animacijų derinimas: easing, timing, spalvų nuance, kai nori matyti inline diff ir greitai nustumdyti.

> Abu naudoja tą patį modelį — skirtumas tik workflow ergonomikoje. Build ir optimizacijai — Claude Code. Vizualiniam poliravimui — Cursor.

**Bonus:** prieš koduojant, „look" galima nusifiksuoti Claude Design (juoda-raudona vinilo estetikos mockup), kad F5 promptas turėtų aiškų taikinį.

---

## 5. Failų struktūra (tikslas po refactor)

```
decksandstories/
├─ index.html                 # tik markup, be inline junk
├─ submit/index.html
├─ public/                    # kopijuojama 1:1 (favicon, robots, sitemap, CNAME)
│  ├─ robots.txt
│  ├─ sitemap.xml
│  └─ favicon.*
├─ src/
│  ├─ main.js                 # entry: importuoja modulius
│  ├─ styles/
│  │  ├─ tokens.css           # spalvos, tipografija (design system)
│  │  ├─ base.css
│  │  └─ sections/*.css       # po failą sekcijai
│  ├─ modules/
│  │  ├─ vinyl.js             # canvas vinilo variklis
│  │  ├─ scroll.js            # anime.js onScroll choreografija
│  │  ├─ reveals.js           # IntersectionObserver reveal'ai (mobile tier)
│  │  ├─ ytFacade.js          # click-to-load epizodų thumbnail'ai (grotuvo NĖRA)
│  │  ├─ gallery.js           # lengvas lightbox (be lightGallery)
│  │  └─ countries.js         # animuotas world-dot map + counteris
│  └─ data/
│     └─ content.js           # episodes[], sessions[], pickAQuestion[], countries[], gallery[]
├─ scripts/optimize-images.mjs # sharp pipeline
├─ vite.config.js
└─ package.json
```

Svarbiausias sprendimas: **visą turinį (epizodus, sesijas, šalis, galeriją) iškelti į `content.js`**. Kortelės generuojamos iš duomenų → markup'as trumpėja, atnaujinti tampa lengva (pridedi vieną objektą, ne kopijuoji 15 eilučių HTML).

---

## 6. Dizaino sistema (juoda-raudona)

### Spalvų tokenai (`tokens.css`) — CRIMSON MATTE (užfiksuota)
```css
:root{
  --bg-0:#060404;          /* giliausias, beveik juodas su raudonu poatspalviu */
  --bg-1:#0c0607;          /* sekcijų fonas */
  --ink:#ece8e8;           /* šiltai baltas tekstas (ne grynas #fff — matinei) */
  --ink-soft:rgba(236,232,232,.55);

  --red:#B3121B;           /* gili crimson (brand core) */
  --red-deep:#7A0C12;      /* tamsesnė, foninė */
  --crimson-hi:#D42630;    /* akcentas — naudoti TAUPIAI (CTA, aktyvus) */

  --line:rgba(255,255,255,.07);
  --vignette:radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(0,0,0,.65) 100%);
  --radius:14px;
}
```
> **Matinė ≠ neonas.** Vengiam ryškių glow'ų. Vietoj `box-shadow` švytėjimo — gilios sotimos raudonos, daug beveik-juodo, subtilus **film grain** overlay + **vignette** kinematografiškam gyliui. Raudona degina taškiškai (etiketė, aktyvūs elementai, waveform), ne visur. Bendras jausmas: tamsu, elegantiška, brangu — kaip vinilo plokštelė prieblandoje.

### Tipografija
- Self-host'inam **vieną** display šriftą (pvz. variable Space Grotesk / Clash arba tavo dabartinį Lexend Deca), subset'intą į naudojamus simbolius. Jokių Google Fonts request'ų → greičiau + garantuotas render.
- Display headline'ai dideli, tight tracking; body — švarus, ramus.

### Centrinė idėja: VINILAS = puslapio ašis
- Canvas 2D vinilas hero centre: koncentriniai grioveliai, raudona centrinė etiketė su D&S logo, lėtas sukimasis.
- Scroll'inant vinilas reaguoja: greitėja/lėtėja sukimasis, iš griovelių sklinda raudonos „waveform" bangos, tonearm nusileidžia.
- Kiekviena sekcija = „takelis" (track). Perėjimai jaučiasi kaip vieno kūrinio dalys, ne kaip atskiri puslapiai.
- Mobile: vinilas paprastesnis (mažiau particle'ų, static-ish), bet vis tiek gyvas.

### Sekcijų upgrade'ai (gražiau ir smagiau)
- **Countries (26/195):** vietoj emoji pills — SVG world **dot-map**, kur featured šalys užsidega raudonai su `stagger` reveal, + animuotas counteris `26 → 195` (skaičius tik iki 26 tiksi). „and counting" pulsuoja.
- **Episodes / Studio Sessions:** kortelės atsiranda su `stagger`, hover — subtilus crimson kraštas + tilt (be neon glow). Thumbnail'ai per YT facade (žr. F6).
- **Pick a Question:** kortelės kaip „traukiamos iš vazos" — micro anime.js sekvencija.
- **Gallery:** masonry + lengvas savas lightbox (be lightGallery lib).

---

## 7. Greitaveikos strategija (acceptance checklist)

- [ ] Nė vienas paveiksliukas > ~250 KB; hero/LCP < 150 KB. `kultura.webp` (6 MB) → perdaryti.
- [ ] AVIF + WebP su `<picture>`, responsive `srcset` (pvz. 480/800/1200 w), `width`/`height` visur (CLS = 0).
- [ ] Viskas žemiau fold — `loading="lazy"` + lazy JS modules (`import()` on scroll/interaction).
- [ ] YouTube — **tik facade** (thumbnail → iframe tik paspaudus). Bottom bar player + YT IFrame API **visiškai pašalinti** (0 YT request'ų iki paspaudimo).
- [ ] Šriftas self-hosted + subset + `font-display:swap` (arba `optional`).
- [ ] anime.js importuojam tik reikalingus modulius (tree-shake).
- [ ] `prefers-reduced-motion` → statinė versija.
- [ ] Sunki scroll choreografija — desktop only (media/JS guard).
- [ ] Repo švara: pašalinti `firebase-debug.log`, `.DS_Store`, `__MACOSX`.
- [ ] Cache headers (Cloudflare): hash'inti assetai — immutable, ilgas cache.

**Target:** Lighthouse mobile Performance 90+, LCP < 2.5s, CLS < 0.1, TBT < 200ms.

---

## 8. Įgyvendinimo fazės (F0-F8)

> Dirbam **po vieną fazę**, verifikuojam, tada toliau (tavo įprastas ritmas).
> Kiekvienoje: **Tikslas → Komandos → Promptas (paste į Claude Code) → Acceptance.**

---

### F0 — Setup ir švara

**Komandos:**
```bash
# naujam repo/branch
git checkout -b v2-rebuild

# Vite (vanilla)
npm create vite@latest . -- --template vanilla
npm i
npm i animejs
npm i -D sharp glob

# junk lauk
git rm -f firebase-debug.log .DS_Store 2>/dev/null || true
echo -e "node_modules\ndist\n.DS_Store\n*.log" > .gitignore
```

**Promptas (Claude Code):**
```
Set up a Vite vanilla project for a static site. Configure vite.config.js for a
multi-page build with index.html and submit/index.html as entry points, output to
/dist. Move robots.txt, sitemap.xml, CNAME and all favicon files into /public so
they are copied verbatim. Create the folder structure: src/styles (tokens.css,
base.css, sections/), src/modules/, src/data/. Do not delete existing content yet —
just scaffold. Confirm `npm run build` and `npm run preview` work.
```

**Acceptance:** `npm run dev` atsidaro, `npm run build` sukuria `/dist`, favicon/robots/sitemap vietoje.

---

### F1 — Image pipeline (didžiausias greičio laimėjimas)

**Promptas (Claude Code):**
```
Create scripts/optimize-images.mjs using sharp. It should read every image in
src/assets/ and gallery/, and for each generate AVIF + WebP at widths [480, 800, 1200]
(never upscale beyond the source width), plus keep one fallback. Target quality that
keeps every file under ~250KB, and hero/LCP images under ~150KB. Output to
public/img/ with a predictable naming scheme (name-480.avif, name-480.webp, etc).
Add an npm script "images". Then run it and print a before/after size report.
Flag gallery/kultura.webp (currently 6MB) specifically.
```

**Acceptance:** `npm run images` sugeneruoja variantus; report'e joks failas > 250 KB; `public/img/` paruoštas `srcset`.

---

### F2 — Design tokens + base + šriftas

**Promptas (Claude Code):**
```
Create src/styles/tokens.css with a black-red design system (I'll paste my token
values). Self-host the display font: download the chosen variable font, subset it to
Latin + the characters actually used, place woff2 in public/fonts, and @font-face it
with font-display:swap. Remove the Google Fonts <link>. Create base.css: reset,
typography scale, body background (deep black with a subtle red radial), and a
prefers-reduced-motion block that disables non-essential animation. No layout yet.
```
> Prieš tai įklijuok savo `--red*` reikšmes iš atsakymo į klausimą.

**Acceptance:** Puslapis kraunasi be jokio external font request; spalvos ir tipografija atrodo kaip nustatyta.

---

### F3 — Turinys į duomenis + markup refactor

**Promptas (Claude Code):**
```
Extract all repeating content from the old index.html into src/data/content.js as
arrays: episodes[], sessions[], pickAQuestion[], countries[], gallery[]. Each item
should have the fields needed to render a card (title, youtubeId or url, thumb, text,
etc). Then rebuild index.html section markup to be semantic and minimal, and render
the card grids from content.js at build/runtime. Keep all SEO: JSON-LD, OG/Twitter
meta, canonical. Keep section order: Hero, Trust, Countries, About, Episodes,
Studio Sessions, Pick a Question, Gallery, Collab, Newsletter. No animations yet.
```

**Acceptance:** Puslapis vizualiai atkartoja seną turinį, bet markup'as trumpas ir varomas iš `content.js`. Pridėti naują epizodą = vienas objektas.

---

### F4 — Vinilo canvas variklis (centrinė figūra)

**Promptas (Claude Code):**
```
Create src/modules/vinyl.js: a 2D canvas vinyl record for the hero. Draw concentric
grooves, a red center label with the D&S logo, subtle highlight sweep. It rotates
slowly via requestAnimationFrame. Expose an API: setSpeed(), pulse(), and a
destroy(). Make it DPR-aware and responsive. On mobile and prefers-reduced-motion,
render a lighter version (fewer grooves, slower/optional rotation). Keep it under a
few KB and 60fps. Wire it into the hero. Do NOT hook scroll yet.
```

**Acceptance:** Hero centre sukasi vinilas, 60fps desktop, lengvesnis mobile, gerbia reduced-motion.

---

### F5 — PILNAS scroll experience (desktop) + lite tier (mobile)

> Svarbiausia ir ambicingiausia fazė. Geriausia derinti su **Cursor** (gyvas diff), sunkų karkasą statyti su **Claude Code**.
> Koncepcija: visas puslapis = viena vinilo plokštelė grojama nuo pradžios iki galo. Scroll = adata slenkanti per takelius. Kiekviena sekcija = „track". Tai duoda animejs.com tęstinumą.

**Promptas A — desktop full experience (Claude Code):**
```
Using anime.js v4 (named exports: animate, createTimeline, stagger, onScroll, utils,
createScope; `ease` not `easing`), build a DESKTOP scroll-scrubbed experience in
src/modules/scroll.js. Core idea: one continuous "vinyl playthrough" tied to scroll.
Create a master createTimeline() that is scroll-scrubbed via onScroll({ sync: true }):
1. Vinyl (from vinyl.js) is the anchor: its rotation, scale and position are driven by
   scroll progress. Speed shifts per section; a tonearm lowers onto the record as the
   Episodes section arrives; red "waveform" ripples pulse out of the grooves on section
   changes via vinyl.pulse().
2. Each section = a "track": heading + cards enter with translateY/opacity + stagger,
   choreographed on the same timeline so transitions feel like one piece, not separate
   pages. Use timeline labels per section.
3. Countries: counter animates 0->26, red dots stagger-light on an SVG world dot-map.
Aesthetic is crimson-matte: restrained, cinematic, no neon. Add a subtle film-grain +
vignette overlay. Everything 60fps. Lazy-import anime.js only when hero is in view.
Wrap ALL of the above behind: matchMedia('(min-width:1024px)') AND
matchMedia('(prefers-reduced-motion: no-preference)'). If either fails, do nothing here.
```

**Promptas B — mobile / reduced-motion lite tier (Claude Code):**
```
Build src/modules/reveals.js as the LITE tier for mobile and prefers-reduced-motion.
No scroll-scrubbing, no continuous timeline. Just IntersectionObserver reveals: when a
section enters view, animate heading + cards in once (translateY + opacity + small
stagger) using anime.js v4 animate(). Vinyl stays in its light mode (slow or static
rotation, no ripples/tonearm). Countries counter still animates 0->26 on reveal, dots
appear without heavy stagger. Keep JS minimal and 60fps on a mid-range phone. This
module and scroll.js are mutually exclusive — pick tier at runtime via matchMedia.
```

**Acceptance:** Desktop — vientisas scroll-scrubbed vinilo „grojimas", jauti animejs.com tęstinumą; mobile — švarūs reveal'ai, greita, 90+; reduced-motion — statiška; niekur nekrenta FPS.

---

### F6 — YouTube facade (grotuvas PAŠALINTAS)

**Promptas (Claude Code):**
```
Remove the bottom audio bar player entirely: delete its markup (#yt-bar-player-container,
cover, track info, play/pause/prev/next/volume controls), its icons (play/pause/prev/
next/volume svg), all its JS, and the YouTube IFrame API loader. The site must make ZERO
YouTube requests on initial load.
Then create src/modules/ytFacade.js: episode and studio-session cards show a static
optimized thumbnail (from public/img, generated by our sharp pipeline — NOT i.ytimg
direct) with a crimson play button overlay. Only on click do we insert the YouTube iframe
(or open the video), so no YouTube script loads until the user chooses to watch. Verify in
the Network tab that nothing from youtube.com / ytimg.com loads before a click.
```

**Acceptance:** Pirmame load'e — **0 YouTube request'ų**, jokio bottom bar; epizodų kortelės greitos, groja tik paspaudus.

---

### F7 — Gallery (be lightGallery) + submit puslapis

**Promptas (Claude Code):**
```
Replace lightGallery with a lightweight custom lightbox in src/modules/gallery.js
(~1-2KB): masonry-ish grid, click to open full image in an overlay with prev/next and
Esc/click-out to close, keyboard accessible, focus-trapped. Use the optimized
srcset images. Remove all lightGallery CDN links. Then apply the same tokens, font,
image pipeline and reveal style to submit/index.html so it matches v2.
```

**Acceptance:** Galerija veikia be external lib; submit puslapis atrodo vienodai; 0 CDN gallery request'ų.

---

### F8 — Build, matavimas, deploy

**Komandos:**
```bash
npm run images
npm run build
npm run preview        # patikrint prod build lokaliai

# Lighthouse (mobile) prieš deploy
npx lighthouse http://localhost:4173 --preset=desktop --view
npx lighthouse http://localhost:4173 --form-factor=mobile --view
```

**Promptas (Claude Code):**
```
Run a production build and audit it. Check bundle sizes, confirm anime.js is
tree-shaken, confirm no render-blocking external requests remain (fonts, YouTube,
gallery). Fix any Lighthouse mobile issues below 90: LCP, CLS (add width/height),
unused JS, image sizing. Report final mobile Performance/LCP/CLS/TBT numbers.
```

**Deploy (Cloudflare Pages):**
- Build command: `npm run build`
- Output dir: `dist`
- Node: 20
- CNAME jau `public/` — domenas persijungs. Palik seną versiją kaip backup branch, kol patvirtinsi 90+.

**Acceptance:** Mobile Performance **90+**, LCP < 2.5s, CLS < 0.1, viskas gyva ir gražu.

---

## 9. Rizikos / pastabos
- **Vinilo canvas + logo:** reikės D&S logo kaip PNG/SVG su permatomu fonu centrui (jau turi `Decks_Transparent.webp`).
- **animejs.com feel ≠ nemokamas:** griežtai laikykis „desktop-only heavy" taisyklės, kitaip mobile Lighthouse kris.
- **Vienas šriftas:** nesivelk į 5 svorius; 2 svoriai (400/700) subset'inti pakanka.
- **YT facade:** įsitikink Network tab'e, kad 0 YT request'ų iki paspaudimo — tai dažniausia vieta, kur „nutrūksta" 90+.

## 10. Ką paruošti prieš pradedant
1. D&S logo transparent (SVG geriausia) vinilo etiketei — turi `Decks_Transparent.webp`, bet SVG būtų aštresnis.
2. Pasirinkti display šriftą (arba palikti Lexend Deca, tik self-hosted, subset'intą).
3. (Sprendimai jau užfiksuoti viršuje — pilnas experience, crimson-matte, be grotuvo.)

**Pradžios eiliškumas:** F0 → F1 (image pipeline duoda didžiausią greičio šuolį iškart) → F2 → F3 → F4 (vinilas) → F5 (experience) → F6 → F7 → F8. Po kiekvienos fazės — commit + greitas patikrinimas, tada toliau.