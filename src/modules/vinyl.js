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

    // Deep, slightly cool vinyl body with a soft warm core.
    const disc = g.createRadialGradient(0, 0, R * 0.06, 0, 0, R);
    disc.addColorStop(0, "#17121a");
    disc.addColorStop(0.5, "#0b0809");
    disc.addColorStop(0.88, "#060405");
    disc.addColorStop(1, "#020202");
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fillStyle = disc;
    g.fill();

    const ring = (r, color, w) => {
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.strokeStyle = color;
      g.lineWidth = w;
      g.stroke();
    };

    // Grooves grouped into "track bands" separated by brighter lead-in rings
    // and small smooth gaps — like a real pressed record.
    const inner = R * 0.335;
    const outer = R * 0.985;
    const pitch = Math.max(1.5, (outer - inner) / (small ? 40 : 92));
    const bandEvery = small ? 6 : 9;
    let i = 0;
    for (let r = inner; r <= outer; i++) {
      if (i % bandEvery === 0) {
        ring(r, "rgba(255,255,255,0.11)", 1.3); // track separator (catches light)
        r += pitch * 1.9; // smooth gap between tracks
      } else {
        const a = 0.022 + (i % 2) * 0.02;
        ring(r, `rgba(226,224,230,${a})`, 1);
        r += pitch;
      }
    }

    // Outer rim + a bright bevel highlight on the top-left edge.
    ring(R, "rgba(255,255,255,0.07)", 1.4);
    g.beginPath();
    g.arc(0, 0, R - 0.6, Math.PI * 1.05, Math.PI * 1.7);
    g.strokeStyle = "rgba(255,255,255,0.22)";
    g.lineWidth = 1.6;
    g.stroke();

    // Static glossy reflection from a top-left light — fixed to the viewer, so it
    // belongs in the cached base (it does not rotate with the record).
    g.save();
    g.beginPath();
    g.arc(0, 0, outer, 0, TAU);
    g.clip();
    const gloss = g.createRadialGradient(-R * 0.4, -R * 0.52, R * 0.04, -R * 0.25, -R * 0.32, R * 1.25);
    gloss.addColorStop(0, "rgba(255,255,255,0.12)");
    gloss.addColorStop(0.4, "rgba(255,255,255,0.035)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    g.globalCompositeOperation = "screen";
    g.fillStyle = gloss;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();

    g.restore();
  }

  function buildGradients() {
    labelGrad = ctx.createRadialGradient(0, 0, labelR * 0.1, 0, 0, labelR);
    labelGrad.addColorStop(0, "#d42630");
    labelGrad.addColorStop(0.7, "#b3121b");
    labelGrad.addColorStop(1, "#7a0c12");
    if (typeof ctx.createConicGradient === "function") {
      // Two opposing specular glints that sweep as the record spins.
      sheenGrad = ctx.createConicGradient(0, 0, 0);
      sheenGrad.addColorStop(0.0, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.04, "rgba(255,255,255,0.65)");
      sheenGrad.addColorStop(0.09, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.5, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.54, "rgba(255,255,255,0.4)");
      sheenGrad.addColorStop(0.59, "rgba(255,255,255,0)");
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
