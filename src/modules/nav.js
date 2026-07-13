// ============================================================
// nav.js — mobile hamburger menu (max-width: 700px).
// Desktop keeps the inline hero nav. Toggle is fixed top-right;
// open state locks scroll, Escape / backdrop / link click close.
// ============================================================

const MQ = "(max-width: 700px)";

export function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-nav");
  if (!toggle || !menu) return;

  const mq = matchMedia(MQ);
  let open = false;

  const setOpen = (next) => {
    open = next;
    document.documentElement.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  const close = () => {
    if (open) setOpen(false);
  };

  toggle.addEventListener("click", () => setOpen(!open));

  menu.querySelectorAll("[data-nav-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  mq.addEventListener("change", (e) => {
    if (!e.matches) close();
  });
}
