// ============================================================
// scroll.js — DESKTOP tier: the full scroll-scrubbed "vinyl playthrough".
// Lazy-imports anime.js v4. The vinyl is the anchor (rotation speed reacts
// to scroll velocity; red ripples pulse out of the grooves on section
// changes; a tonearm lowers onto the record past the hero). Each section is
// a "track": heading + cards enter with translateY/opacity + stagger,
// scroll-scrubbed so transitions feel like one continuous piece.
// Guarded in main.js behind (min-width:1024px) AND (reduced-motion: no-preference).
// ============================================================

import { tagReveals, initCounters } from "./reveals.js";

export async function initScrollExperience(vinyl) {
  const { animate, stagger, onScroll, utils } = await import("animejs");

  tagReveals();
  initCounters();

  // --- 1) Scroll-scrubbed section reveals ("tracks") ---
  document.querySelectorAll(".section").forEach((section) => {
    const items = section.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    utils.set(items, { opacity: 0, translateY: 46 });
    animate(items, {
      opacity: [0, 1],
      translateY: [46, 0],
      duration: 620,
      delay: stagger(90),
      ease: "outCubic",
      autoplay: onScroll({
        target: section,
        enter: { target: "top", container: "bottom" },
        leave: { target: "top", container: "center" },
        sync: true, // scrub progress to scroll position
      }),
    });
  });

  // --- 2) Vinyl anchor: speed reacts to scroll velocity, decays back ---
  let boost = 0;
  let lastY = window.scrollY;
  let ticking = false;
  const onScrollVelocity = () => {
    const y = window.scrollY;
    boost = Math.min(6, boost + Math.abs(y - lastY) * 0.03);
    lastY = y;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(decay);
    }
  };
  function decay() {
    boost *= 0.9;
    vinyl?.setSpeed(1 + boost);
    if (boost > 0.02) {
      requestAnimationFrame(decay);
    } else {
      vinyl?.setSpeed(1);
      ticking = false;
    }
  }
  window.addEventListener("scroll", onScrollVelocity, { passive: true });

  // --- 3) Red ripple pulse when each section arrives ---
  const pulseIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) vinyl?.pulse(0.9);
      });
    },
    { threshold: 0.25 },
  );
  document.querySelectorAll(".section").forEach((s) => pulseIO.observe(s));

  // --- 4) Tonearm lowers onto the record past the hero ---
  const arm = document.querySelector(".tonearm");
  const hero = document.querySelector(".hero");
  if (arm && hero) {
    animate(arm, {
      rotate: [-32, 4],
      ease: "inOutSine",
      autoplay: onScroll({
        target: hero,
        enter: { target: "top", container: "top" },
        leave: { target: "bottom", container: "top" },
        sync: true,
      }),
    });
  }

  return {
    destroy() {
      window.removeEventListener("scroll", onScrollVelocity);
      pulseIO.disconnect();
    },
  };
}
