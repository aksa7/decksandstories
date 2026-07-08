// ============================================================
// ytFacade.js — click-to-load YouTube. Episode/session cards render a local
// optimized thumbnail with a crimson play button; the YouTube iframe is only
// inserted when the user clicks. Result: ZERO youtube.com / ytimg.com requests
// on initial load. Uses youtube-nocookie for privacy.
// ============================================================

function playInline(card) {
  if (card.querySelector("iframe")) return;
  const id = card.dataset.yt;
  const thumb = card.querySelector(".card-thumb");
  if (!id || !thumb) return;

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  iframe.title = "YouTube video player";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";

  thumb.replaceChildren(iframe);
  thumb.classList.add("is-playing");
}

export function initYtFacade() {
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card[data-yt]");
    if (!card) return;
    // Let modified/middle clicks on the fallback link open YouTube in a new tab.
    const link = e.target.closest("a");
    if (link && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return;
    e.preventDefault();
    playInline(card);
  });
}
