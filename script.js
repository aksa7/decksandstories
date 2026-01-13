/**************************************
 * Decks & Stories — script.js
 * - Smooth scroll
 * - Clickable cards (whole card opens YouTube)
 * - Hide cards with PUT_ID_HERE
 * - YouTube BAR player (playlist) with autoplay kick
 * - LightGallery init
 **************************************/

/********* PAGE FADE-IN *********/
window.addEventListener("load", () => {
  document.body.classList.remove("is-preload");
});

/********* SMOOTH SCROLL *********/
document.querySelectorAll(".scrolly").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const section = document.querySelector(targetId);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/********* CLICKABLE MEDIA CARDS (CRO) *********
 * - Whole card opens data-url in new tab
 * - If a click happens on <a> button inside, let it behave normally
 * - Auto-hide cards if URL includes PUT_ID_HERE or missing
 */
(function initClickableCards() {
  const cards = document.querySelectorAll(".media-card");

  cards.forEach((card) => {
    const url = (card.getAttribute("data-url") || "").trim();

    // Hide placeholders / broken cards
    if (!url || url.includes("PUT_ID_HERE")) {
      card.style.display = "none";
      return;
    }

    card.addEventListener("click", (e) => {
      // If user clicked inside a real link/button, do nothing (let link open)
      const clickedLink = e.target.closest("a");
      if (clickedLink) return;

      window.open(url, "_blank", "noopener");
    });
  });
})();

/********* YOUTUBE BAR PLAYER (Playlist) *********/
const playlistId = "PLpO5SCIZiofW3wdYBluol3nICkDQRxrP3";

let ytPlayer = null;
let ytBarReady = false;
let ytStarted = false;
let isPlaying = false;

let lastVolume = parseInt(localStorage.getItem("ds_last_volume") || "45", 10);
if (Number.isNaN(lastVolume)) lastVolume = 45;

let userInteracted = false;
let lastIndex = parseInt(localStorage.getItem("ds_last_index") || "-1", 10);

/********* LOAD YOUTUBE IFRAME API *********/
(function loadYTApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.async = true;
  document.head.appendChild(tag);
})();

/********* USER ACTION “KICK” (Autoplay policy) *********/
function addKickListeners() {
  const kick = () => {
    userInteracted = true;
    tryStartPlayback();
  };

  window.addEventListener("click", kick, { passive: true });
  window.addEventListener("touchstart", kick, { passive: true });
  window.addEventListener("keydown", kick, { passive: true });
  window.addEventListener("wheel", kick, { passive: true });

  const onScroll = () => {
    if (window.scrollY > 0) kick();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  addKickListeners._remove = () => {
    window.removeEventListener("click", kick);
    window.removeEventListener("touchstart", kick);
    window.removeEventListener("keydown", kick);
    window.removeEventListener("wheel", kick);
    window.removeEventListener("scroll", onScroll);
  };
}

function removeKickListeners() {
  if (addKickListeners._remove) addKickListeners._remove();
}

addKickListeners();

/********* YT API READY CALLBACK *********/
window.onYouTubeIframeAPIReady = function () {
  initYTBarPlayer();
};

/********* START LOGIC *********/
function tryStartPlayback() {
  if (!userInteracted) return;
  if (!ytBarReady) return;
  if (ytStarted) return;

  startRandomWithSound();
  ytStarted = true;
  removeKickListeners();
}

function startRandomWithSound() {
  if (!ytPlayer) return;

  let ids = [];
  try {
    ids = ytPlayer.getPlaylist() || [];
  } catch (_) {}

  const len = ids.length || 0;
  let idx = 0;

  if (len > 1) {
    idx = Math.floor(Math.random() * len);
    if (lastIndex >= 0 && lastIndex < len && idx === lastIndex) {
      idx = (idx + 1) % len;
    }
  }

  lastIndex = idx;
  localStorage.setItem("ds_last_index", String(idx));

  try {
    ytPlayer.unMute();
    ytPlayer.setVolume(lastVolume);
  } catch (_) {}

  try {
    if (len) ytPlayer.playVideoAt(idx);
    else ytPlayer.playVideo();
  } catch (_) {}

  isPlaying = true;
  updatePlayBtn();
  updateTrackInfo();
}

/********* INIT MUSIC BAR PLAYER *********/
function initYTBarPlayer() {
  const container = document.getElementById("yt-bar-player-container");
  const barDiv = document.getElementById("yt-bar-player");

  // If HTML doesn't have the bar — exit safely
  if (!container || !barDiv) return;

  // If YT blocked/unavailable — don't break page
  if (!window.YT || !YT.Player) return;

  barDiv.style.display = "block";

  ytPlayer = new YT.Player("yt-bar-player", {
    height: "0",
    width: "0",
    playerVars: {
      listType: "playlist",
      list: playlistId,
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
    events: {
      onReady: () => {
        ytBarReady = true;

        // sync slider volume UI
        const slider = document.getElementById("volumeSlider");
        if (slider) slider.value = String(lastVolume);

        tryStartPlayback();
      },
      onStateChange: (e) => {
        updateTrackInfo();

        if (e.data === YT.PlayerState.PLAYING) {
          isPlaying = true;
          updatePlayBtn();
        } else if (e.data === YT.PlayerState.PAUSED) {
          isPlaying = false;
          updatePlayBtn();
        }
      },
    },
  });
}

/********* CONTROLS (exposed for inline onclick in HTML) *********/
window.togglePlayPause = function () {
  if (!ytPlayer || !window.YT) return;

  const st = ytPlayer.getPlayerState();

  if (st === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
    isPlaying = false;
  } else {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(lastVolume);
    } catch (_) {}
    ytPlayer.playVideo();
    isPlaying = true;
  }

  updatePlayBtn();
};

function updatePlayBtn() {
  const icon = document.getElementById("playPauseIcon");
  if (!icon) return;
  icon.src = isPlaying ? "icons/pause.svg" : "icons/play.svg";
}

window.prevTrack = function () {
  if (ytPlayer) ytPlayer.previousVideo();
};

window.nextTrack = function () {
  if (ytPlayer) ytPlayer.nextVideo();
};

window.setVolume = function (value) {
  if (!ytPlayer) return;

  const v = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
  lastVolume = v;
  localStorage.setItem("ds_last_volume", String(lastVolume));

  try {
    ytPlayer.unMute();
  } catch (_) {}

  try {
    ytPlayer.setVolume(lastVolume);
  } catch (_) {}
};

window.closePlayer = function () {
  try {
    if (ytPlayer) {
      ytPlayer.stopVideo();
      ytPlayer.mute();
    }
  } catch (_) {}

  const c = document.getElementById("yt-bar-player-container");
  if (c) c.style.display = "none";
};

function updateTrackInfo() {
  // slight delay so YT data updates reliably
  setTimeout(() => {
    if (!ytPlayer || !ytPlayer.getVideoData) return;

    const data = ytPlayer.getVideoData();
    const videoId = data.video_id;
    const title = data.title;

    const coverEl = document.getElementById("yt-cover");
    if (videoId && coverEl) {
      coverEl.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    const titleEl = document.getElementById("yt-track-title");
    if (titleEl) {
      titleEl.textContent = title || "Loading...";
    }
  }, 280);
}

/********* LIGHTGALLERY INIT *********/
(function initGallery() {
  if (typeof lightGallery !== "function") return;

  const utopija = document.getElementById("utopija-gallery");
  if (!utopija) return;

  lightGallery(utopija, {
    plugins: [lgZoom, lgThumbnail],
    speed: 400,
    thumbnail: true,
    zoom: true,
    hideControls: false,
  });
})();
