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

  // Paint the static disc + grooves + rim into the offscreen canvas once.
  function buildBase() {
    baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseCtx.clearRect(0, 0, size, size);
    baseCtx.save();
    baseCtx.translate(c, c);

    const disc = baseCtx.createRadialGradient(0, 0, R * 0.08, 0, 0, R);
    disc.addColorStop(0, "#151013");
    disc.addColorStop(0.55, "#0a0708");
    disc.addColorStop(1, "#050303");
    baseCtx.beginPath();
    baseCtx.arc(0, 0, R, 0, TAU);
    baseCtx.fillStyle = disc;
    baseCtx.fill();

    for (let i = 0; i < grooveCount; i++) {
      const r = lerp(R * 0.34, R * 0.985, i / grooveCount);
      baseCtx.beginPath();
      baseCtx.arc(0, 0, r, 0, TAU);
      baseCtx.strokeStyle = i % 6 === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.028)";
      baseCtx.lineWidth = 1;
      baseCtx.stroke();
    }

    baseCtx.beginPath();
    baseCtx.arc(0, 0, R, 0, TAU);
    baseCtx.strokeStyle = "rgba(255,255,255,0.08)";
    baseCtx.lineWidth = 1.5;
    baseCtx.stroke();
    baseCtx.restore();
  }

  function buildGradients() {
    labelGrad = ctx.createRadialGradient(0, 0, labelR * 0.1, 0, 0, labelR);
    labelGrad.addColorStop(0, "#d42630");
    labelGrad.addColorStop(0.7, "#b3121b");
    labelGrad.addColorStop(1, "#7a0c12");
    if (typeof ctx.createConicGradient === "function") {
      sheenGrad = ctx.createConicGradient(0, 0, 0);
      sheenGrad.addColorStop(0.0, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.06, "rgba(255,255,255,0.5)");
      sheenGrad.addColorStop(0.14, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.5, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.56, "rgba(255,255,255,0.32)");
      sheenGrad.addColorStop(0.64, "rgba(255,255,255,0)");
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

    // Spindle hole
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, R * 0.016), 0, TAU);
    ctx.fillStyle = "#020202";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    drawPulses();
    ctx.restore();
  }

  function drawSheen() {
    if (!sheenGrad) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.12;
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
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 1.5;
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
