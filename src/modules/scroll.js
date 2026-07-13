// ============================================================
// scroll.js — DESKTOP tier: scroll-scrubbed section reveals.
// ============================================================

import { initCounters, initTypewriters } from "./reveals.js";

export async function initScrollExperience() {
  const { animate, stagger, onScroll, utils } = await import("animejs");

  initCounters();
  initTypewriters();

  document.querySelectorAll(".section").forEach((section) => {
    const items = section.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    utils.set(items, { opacity: 0, translateY: 48, scale: 0.965 });
    animate(items, {
      opacity: [0, 1],
      translateY: [48, 0],
      scale: [0.965, 1],
      duration: 640,
      delay: stagger(95),
      ease: "outCubic",
      autoplay: onScroll({
        target: section,
        enter: { target: "top", container: "bottom" },
        leave: { target: "top", container: "center" },
        sync: true,
      }),
    });
  });
}
