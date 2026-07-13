// F6 — Fetch + optimize local YouTube thumbnails so the page makes ZERO
// youtube.com / ytimg.com requests on load. Downloads each episode/session
// thumbnail once (maxresdefault, falling back to hqdefault), crops to 16:9 and
// emits AVIF+WebP at widths [480, 800] into public/img/ as yt-<id>-<w>.{avif,webp}.
// Removes stale yt-* files for IDs no longer in content.js.
//
// Run: npm run yt

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
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

async function cleanupStale(activeIds) {
  const active = new Set(activeIds.map((id) => `yt-${id}`));
  const files = await glob("yt-*", { cwd: OUT_DIR });
  let removed = 0;
  for (const file of files) {
    const id = file.match(/^yt-([^.-]+)/)?.[1];
    if (!id || active.has(`yt-${id}`)) continue;
    await fs.unlink(path.join(OUT_DIR, file));
    removed++;
  }
  if (removed) console.log(`removed ${removed} stale yt-* file(s)`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const ids = [...episodes, ...sessions].map((x) => x.ytId);
  await cleanupStale(ids);

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
    console.log(`yt-${id}  (${name})`);
  }

  console.log(`\n${ids.length} thumbnails → ${OUT_DIR}/yt-*  | total ${KB(total)} | largest ${KB(max)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
