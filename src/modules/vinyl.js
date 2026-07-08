// ============================================================
// vinyl.js — 2D canvas vinyl record, the hero centerpiece.
// Concentric grooves, a red center label with the D&S logo, a slow
// rotating specular sheen. requestAnimationFrame-driven, DPR-aware,
// responsive. Lighter on mobile / prefers-reduced-motion. Pauses when
// off-screen. API: setSpeed(), pulse(), destroy(). No scroll hookup (F5).
// ============================================================

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;

export function createVinyl(canvas, { logoSrc } = {}) {
  const ctx = canvas.getContext("2d", { alpha: true });
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqSmall = matchMedia("(max-width: 700px)");

  let reduce = mqReduce.matches;
  let small = mqSmall.matches;

  let dpr = 1;
  let size = 0; // CSS px (square)
  let c = 0; // center
  let R = 0; // outer radius
  let labelR = 0;
  let grooveCount = small ? 26 : 60;

  let angle = 0;
  let baseSpeed = reduce ? 0 : small ? 0.11 : 0.2; // rad/s
  let speedMul = 1;

  let raf = null;
  let last = 0;
  let running = false;
  let visible = true;

  const pulses = []; // { start, dur, strength }

  // --- Logo (drawn into the label, rotates with the disc) ---
  let logo = null;
  let logoReady = false;
  if (logoSrc) {
    logo = new Image();
    logo.decoding = "async";
    logo.onload = () => {
      logoReady = true;
      if (!running) drawScene();
    };
    logo.src = logoSrc;
  }

  // Offscreen cache of the static disc + grooves (the expensive part) and
  // gradients built once per resize, so each frame only paints the cheap
  // rotating overlay — keeps the loop off the main thread (low TBT).
  const baseCanvas = document.createElement("canvas");
  const baseCtx = baseCanvas.getContext("2d");
  let labelGrad = null;
  let sheenGrad = null;

  // --- Sizing ---
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const css = Math.max(1, Math.min(rect.width, rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = css;
    canvas.width = baseCanvas.width = Math.round(css * dpr);
    canvas.height = baseCanvas.height = Math.round(css * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    c = css / 2;
    R = css / 2 - 2;
    labelR = R * 0.3;
    buildBase();
    buildGradients();
    if (!running) drawScene();
  }

  // Paint the static disc + grooves + rim + glossy reflection into the offscreen
  // canvas once (cached — free per frame). This is where most of the realism lives.
  function buildBase() {
    const g = baseCtx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, size, size);
    g.save();
    g.translate(c, c);

    // Deep near-black vinyl body.
    const disc = g.createRadialGradient(-R * 0.15, -R * 0.2, R * 0.05, 0, 0, R);
    disc.addColorStop(0, "#121016");
    disc.addColorStop(0.5, "#0a0709");
    disc.addColorStop(0.9, "#050405");
    disc.addColorStop(1, "#010101");
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fillStyle = disc;
    g.fill();

    const inner = R * 0.335;
    const outer = R * 0.985;

    // Fine, dense grooves — a silky vinyl texture rather than chunky rings.
    const gN = small ? 110 : 200;
    for (let i = 0; i < gN; i++) {
      const t = i / gN;
      const r = lerp(inner, outer, t);
      const sep = i % 34 === 0; // subtle track separation every so often
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.strokeStyle = sep
        ? "rgba(255,255,255,0.05)"
        : `rgba(210,208,214,${0.012 + (i % 2) * 0.014})`;
      g.lineWidth = sep ? 1.1 : 0.7;
      g.stroke();
    }

    // Everything reflective is clipped to the record.
    g.save();
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.clip();
    g.globalCompositeOperation = "screen";

    // Broad soft key light from the upper-left.
    const key = g.createRadialGradient(-R * 0.42, -R * 0.55, R * 0.02, -R * 0.3, -R * 0.36, R * 1.35);
    key.addColorStop(0, "rgba(255,252,248,0.16)");
    key.addColorStop(0.45, "rgba(255,255,255,0.04)");
    key.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = key;
    g.fillRect(-R, -R, R * 2, R * 2);

    // Soft cool bounce light from the lower-right.
    const bounce = g.createRadialGradient(R * 0.4, R * 0.5, R * 0.02, R * 0.35, R * 0.42, R * 1.1);
    bounce.addColorStop(0, "rgba(210,220,255,0.05)");
    bounce.addColorStop(1, "rgba(210,220,255,0)");
    g.fillStyle = bounce;
    g.fillRect(-R, -R, R * 2, R * 2);

    // Signature elongated studio-light streak across the disc.
    g.save();
    g.rotate(-0.5);
    const bar = g.createLinearGradient(0, -R * 0.62, 0, -R * 0.18);
    bar.addColorStop(0, "rgba(255,255,255,0)");
    bar.addColorStop(0.5, "rgba(255,255,255,0.07)");
    bar.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = bar;
    g.fillRect(-R, -R * 0.62, R * 2, R * 0.44);
    g.restore();

    g.restore(); // end clip

    // Beveled outer edge: bright arc on the lit side, faint full rim.
    g.beginPath();
    g.arc(0, 0, R - 0.7, 0, TAU);
    g.strokeStyle = "rgba(255,255,255,0.05)";
    g.lineWidth = 1;
    g.stroke();
    g.beginPath();
    g.arc(0, 0, R - 0.8, Math.PI * 1.02, Math.PI * 1.72);
    g.strokeStyle = "rgba(255,255,255,0.24)";
    g.lineWidth = 1.6;
    g.stroke();

    g.restore();
  }

  function buildGradients() {
    labelGrad = ctx.createRadialGradient(-labelR * 0.25, -labelR * 0.3, labelR * 0.08, 0, 0, labelR);
    labelGrad.addColorStop(0, "#d8323b");
    labelGrad.addColorStop(0.65, "#b3121b");
    labelGrad.addColorStop(1, "#6f0a10");
    if (typeof ctx.createConicGradient === "function") {
      // A single soft specular glint that gently sweeps as the record spins.
      sheenGrad = ctx.createConicGradient(0, 0, 0);
      sheenGrad.addColorStop(0.0, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.08, "rgba(255,255,255,0.25)");
      sheenGrad.addColorStop(0.18, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.55, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.62, "rgba(255,255,255,0.12)");
      sheenGrad.addColorStop(0.72, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
    }
  }

  // --- Drawing (per frame: blit cached base + cheap rotating overlay) ---
  function drawScene() {
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(baseCanvas, 0, 0, size, size);
    ctx.save();
    ctx.translate(c, c);

    ctx.save();
    ctx.rotate(angle);
    drawSheen();
    drawLabel();
    drawLogo();
    ctx.restore();

    // Spindle: a faint bearing ring around a small dark hole.
    const hole = Math.max(2, R * 0.016);
    ctx.beginPath();
    ctx.arc(0, 0, hole * 2.3, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, hole, 0, TAU);
    ctx.fillStyle = "#010101";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();

    drawPulses();
    ctx.restore();
  }

  function drawSheen() {
    if (!sheenGrad) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.07;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.arc(0, 0, labelR, 0, TAU, true); // hole
    ctx.fillStyle = sheenGrad;
    ctx.fill();
    ctx.restore();
  }

  function drawLabel() {
    ctx.beginPath();
    ctx.arc(0, 0, labelR, 0, TAU);
    ctx.fillStyle = labelGrad;
    ctx.fill();
    // Paper-label depth: dark edge + a lighter inner ring + a fine inner circle.
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, labelR * 0.9, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, labelR * 0.42, 0, TAU);
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawLogo() {
    if (!logoReady || !logo.naturalWidth) return;
    const box = labelR * 1.5; // contain within the label
    const ratio = logo.naturalWidth / logo.naturalHeight;
    let w = box;
    let h = box / ratio;
    if (h > box) {
      h = box;
      w = box * ratio;
    }
    ctx.drawImage(logo, -w / 2, -h / 2, w, h);
  }

  function drawPulses() {
    if (!pulses.length) return;
    const now = performance.now();
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      const t = (now - p.start) / p.dur;
      if (t >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const r = lerp(labelR, R * 0.99, t);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.strokeStyle = `rgba(212,38,48,${(1 - t) * 0.55 * p.strength})`;
      ctx.lineWidth = 2 * (1 - t) + 0.5;
      ctx.stroke();
    }
  }

  // --- Loop ---
  function frame(now) {
    if (!running) return;
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    angle = (angle + baseSpeed * speedMul * dt) % TAU;
    drawScene();
    // keep animating while spinning or while pulses are alive
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !visible) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  // --- Reactive listeners ---
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  const onMotionChange = () => {
    reduce = mqReduce.matches;
    baseSpeed = reduce ? 0 : small ? 0.11 : 0.2;
    if (reduce) {
      stop();
      drawScene();
    } else {
      start();
    }
  };
  const onSizeChange = () => {
    small = mqSmall.matches;
    grooveCount = small ? 26 : 60;
    baseSpeed = reduce ? 0 : small ? 0.11 : 0.2;
    resize();
  };
  mqReduce.addEventListener("change", onMotionChange);
  mqSmall.addEventListener("change", onSizeChange);

  resize();
  start();
  if (reduce) drawScene();

  // --- Public API ---
  return {
    setSpeed(mult) {
      speedMul = Math.max(0, mult);
    },
    pulse(strength = 1) {
      if (reduce) return;
      pulses.push({ start: performance.now(), dur: 1200, strength });
      if (!running && visible) start();
    },
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      mqReduce.removeEventListener("change", onMotionChange);
      mqSmall.removeEventListener("change", onSizeChange);
    },
  };
}
