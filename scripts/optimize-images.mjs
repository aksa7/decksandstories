// F1 — Image pipeline.
// Reads every content image in assets/ and gallery/, and for each emits AVIF + WebP
// at widths [480, 800, 1200] (never upscaling past the source width) plus a full-size
// WebP fallback. Size-capped so no file exceeds ~250KB (hero/LCP images ~150KB) by
// stepping quality down until the cap is met. Output lands in public/img/ with a
// predictable scheme: <name>-<w>.avif, <name>-<w>.webp, <name>.webp (fallback).
//
// Run: npm run images

import sharp from 'sharp';
import { glob } from 'glob';
import path from 'node:path';
import fs from 'node:fs/promises';

const SRC_DIRS = ['assets', 'gallery'];
const OUT_DIR = 'public/img';
const WIDTHS = [480, 800, 1200];
const EXT = /\.(webp|png|jpe?g|avif)$/i;

// Non-content raster/icon assets that must NOT be turned into a responsive srcset.
const SKIP = /(^|\/)(favicon|apple-touch-icon|web-app-manifest)/i;
const SKIP_EXT = /\.(svg|ico|pdf)$/i;

// LCP / hero images get a tighter budget.
const HERO = new Set(['1920x1080DCKS_transparent', '1920x1080DCKS', 'herovisual']);
const CAP_HERO = 150 * 1024;
const CAP_DEFAULT = 250 * 1024;

const KB = (n) => (n / 1024).toFixed(1) + ' KB';

// Encode a resize pipeline into a target format, stepping quality down until it fits cap.
async function encode(base, format, outPath, cap) {
  const ladder = format === 'avif' ? [58, 50, 42, 34, 28, 22] : [80, 72, 64, 56, 48, 40];
  let buf;
  let usedQ = ladder[ladder.length - 1];
  for (const q of ladder) {
    buf = await base.clone()[format]({ quality: q }).toBuffer();
    usedQ = q;
    if (buf.length <= cap) break;
  }
  await fs.writeFile(outPath, buf);
  return { size: buf.length, q: usedQ, over: buf.length > cap };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Collect candidate files.
  const files = [];
  for (const dir of SRC_DIRS) {
    const found = await glob(`${dir}/**/*`, { nodir: true });
    files.push(...found);
  }

  // Dedupe by basename (an image may exist as both .jpg fallback and .webp — same picture).
  // Prefer the source with the largest pixel width, then the largest byte size.
  const groups = new Map();
  for (const file of files) {
    const rel = file.replaceAll('\\', '/');
    const name = path.basename(rel, path.extname(rel));
    if (!EXT.test(rel) || SKIP_EXT.test(rel) || SKIP.test(rel)) continue;
    let meta, stat;
    try {
      meta = await sharp(file).metadata();
      stat = await fs.stat(file);
    } catch {
      continue; // unreadable / not a real image
    }
    const cand = { file: rel, name, width: meta.width || 0, bytes: stat.size };
    const prev = groups.get(name);
    if (!prev || cand.width > prev.width || (cand.width === prev.width && cand.bytes > prev.bytes)) {
      groups.set(name, cand);
    }
  }

  const rows = [];
  let totalBefore = 0;
  let totalAfter = 0;
  let maxAfter = 0;
  const overCap = [];

  for (const { file, name, width, bytes } of [...groups.values()].sort((a, b) => b.bytes - a.bytes)) {
    totalBefore += bytes;
    const cap = HERO.has(name) ? CAP_HERO : CAP_DEFAULT;

    // Which widths to emit: never upscale. If the source is tiny, emit a single
    // variant at its native width.
    let targets = WIDTHS.filter((w) => w <= width);
    if (targets.length === 0) targets = [width];

    const variants = [];
    for (const w of targets) {
      const base = sharp(file).resize({ width: w, withoutEnlargement: true });
      const avif = await encode(base, 'avif', path.join(OUT_DIR, `${name}-${w}.avif`), cap);
      const webp = await encode(base, 'webp', path.join(OUT_DIR, `${name}-${w}.webp`), cap);
      variants.push({ w, avif, webp });
      totalAfter += avif.size + webp.size;
      maxAfter = Math.max(maxAfter, avif.size, webp.size);
      if (avif.over) overCap.push(`${name}-${w}.avif (${KB(avif.size)})`);
      if (webp.over) overCap.push(`${name}-${w}.webp (${KB(webp.size)})`);
    }

    // Full-size WebP fallback for plain <img src>.
    const largest = targets[targets.length - 1];
    const fb = await encode(
      sharp(file).resize({ width: largest, withoutEnlargement: true }),
      'webp',
      path.join(OUT_DIR, `${name}.webp`),
      cap,
    );
    totalAfter += fb.size;

    rows.push({ name, width, before: bytes, widths: targets, variants, fallback: fb.size, hero: HERO.has(name) });
  }

  // Report.
  console.log('\n=== F1 image pipeline — before/after ===\n');
  const flag = (n) => (n === 'kultura' ? '  ⚠️  (was 6MB LCP killer)' : '');
  for (const r of rows.sort((a, b) => b.before - a.before)) {
    const smallest = Math.min(...r.variants.flatMap((v) => [v.avif.size, v.webp.size]), r.fallback);
    const largest = Math.max(...r.variants.flatMap((v) => [v.avif.size, v.webp.size]), r.fallback);
    console.log(
      `${r.name.padEnd(34)} ${KB(r.before).padStart(10)}  →  [${r.widths.join('/')}]  ` +
        `${KB(smallest)}–${KB(largest)}${r.hero ? '  (hero≤150KB)' : ''}${flag(r.name)}`,
    );
  }
  console.log('\n----------------------------------------------------');
  console.log(`Sources processed : ${rows.length}`);
  console.log(`Total before      : ${KB(totalBefore)}`);
  console.log(`Total after (all variants): ${KB(totalAfter)}`);
  console.log(`Largest single output file: ${KB(maxAfter)}`);
  if (overCap.length) {
    console.log(`\n⚠️  Over cap (${overCap.length}): ${overCap.join(', ')}`);
  } else {
    console.log('✅ Every generated file is under its size cap (≤250KB, hero ≤150KB).');
  }
  console.log(`\nOutput: ${OUT_DIR}/  (use <name>-{480,800,1200}.{avif,webp} in srcset)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
