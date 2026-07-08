// F6 — Fetch + optimize local YouTube thumbnails so the page makes ZERO
// youtube.com / ytimg.com requests on load. Downloads each episode/session
// thumbnail once (maxresdefault, falling back to hqdefault), crops to 16:9 and
// emits AVIF+WebP at widths [480, 800] plus a WebP fallback into public/img/
// as yt-<id>-<w>.{avif,webp} and yt-<id>.webp.
//
// Run: npm run yt

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { episodes, sessions } from "../src/data/content.js";

const OUT_DIR = "public/img";
const WIDTHS = [480, 800];
const KB = (n) => (n / 1024).toFixed(1) + " KB";

async function fetchThumb(id) {
  for (const name of ["maxresdefault", "hqdefault"]) {
    const url = `https://i.ytimg.com/vi/${id}/${name}.jpg`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      // hqdefault is always 480x360; maxres can occasionally be a 120px stub
      if (buf.length > 3000) return { buf, name };
    }
  }
  throw new Error(`no thumbnail for ${id}`);
}

async function encode(base, format, outPath) {
  const q = format === "avif" ? 52 : 74;
  const buf = await base.clone()[format]({ quality: q }).toBuffer();
  await fs.writeFile(outPath, buf);
  return buf.length;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const ids = [...episodes, ...sessions].map((x) => x.ytId);
  let total = 0;
  let max = 0;

  for (const id of ids) {
    const { buf, name } = await fetchThumb(id);
    for (const w of WIDTHS) {
      const base = sharp(buf).resize({ width: w, height: Math.round((w * 9) / 16), fit: "cover", position: "attention" });
      const a = await encode(base, "avif", path.join(OUT_DIR, `yt-${id}-${w}.avif`));
      const wp = await encode(base, "webp", path.join(OUT_DIR, `yt-${id}-${w}.webp`));
      total += a + wp;
      max = Math.max(max, a, wp);
    }
    const fb = await encode(
      sharp(buf).resize({ width: 800, height: 450, fit: "cover", position: "attention" }),
      "webp",
      path.join(OUT_DIR, `yt-${id}.webp`),
    );
    total += fb;
    console.log(`yt-${id}  (${name})  fallback ${KB(fb)}`);
  }

  console.log(`\n${ids.length} thumbnails → ${OUT_DIR}/yt-*  | total ${KB(total)} | largest ${KB(max)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
