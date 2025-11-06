/********* BAZĖ *********/
window.addEventListener('load', () => {
  document.body.classList.remove('is-preload');
});

document.querySelectorAll('.scrolly').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const section = document.querySelector(targetId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

function loadAndPlayVideo(videoId, container) {
  const img = container.querySelector('img');
  const overlay = container.querySelector('.play-overlay');
  const iframe = container.querySelector('.video-iframe');
  if (img) img.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.style.display = 'block';
  }
}

/********* KONFIG *********/
const playlistId = 'PLpO5SCIZiofW3wdYBluol3nICkDQRxrP3';
const BG_VIDEO_ID = 'i5LrO01EffM'; // foninis YouTube

let ytPlayer = null;
let ytReady = false;          // Iframe API pasiruošusi
let ytBarReady = false;       // baro playeris onReady
let ytStarted = false;        // ar jau startuota su garsu
let isPlaying = false;
let lastVolume = 45;          // vidutinis garsas

let userInteracted = false;   // ar buvo bent vienas veiksmas
let lastIndex = parseInt(localStorage.getItem('ds_last_index') || '-1', 10);

/********* Įkeliame YouTube Iframe API *********/
(function () {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

function onYouTubeIframeAPIReady() {
  ytReady = true;
  initBgPlayer();
  initYTBarPlayer(); // sukuriam IŠKART, bet be autoplay (lauks user veiksmo)
}

/********* USER VEIKSMO „KICK“ *********/
function addKickListeners() {
  const kick = () => {
    userInteracted = true;
    tryStartPlayback(); // bandome startint čia pat
  };

  // Plačiai: click/touch/keydown/wheel ir scroll>0
  window.addEventListener('click', kick, { passive: true });
  window.addEventListener('touchstart', kick, { passive: true });
  window.addEventListener('keydown', kick, { passive: true });
  window.addEventListener('wheel', kick, { passive: true });

  const onScroll = () => {
    if (window.scrollY > 0) kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // kad nuimtume vėliau
  addKickListeners._remove = () => {
    window.removeEventListener('click', kick);
    window.removeEventListener('touchstart', kick);
    window.removeEventListener('keydown', kick);
    window.removeEventListener('wheel', kick);
    window.removeEventListener('scroll', onScroll);
  };
}
function removeKickListeners() {
  addKickListeners._remove && addKickListeners._remove();
}
addKickListeners();

/********* START LOGIKA *********/
function tryStartPlayback() {
  // Paleisime tik jei: buvo user veiksmas + playeris paruoštas + dar nestartuota
  if (!userInteracted) return;
  if (!ytBarReady) return;         // dar ne onReady — paliekam listenerius
  if (ytStarted) return;           // jau paleista

  // ŠITOJE vietoje esam tiesiogiai user veiksmo kontekste (dažniausiai),
  // todėl play su garsu praeina be blokavimo.
  startRandomWithSound();
  ytStarted = true;
  removeKickListeners(); // vienkartinis startas
}

function startRandomWithSound() {
  if (!ytPlayer) return;

  let ids = [];
  try { ids = ytPlayer.getPlaylist() || []; } catch (_) {}

  let len = ids.length || 0;
  let idx = 0;
  if (len > 1) {
    idx = Math.floor(Math.random() * len);
    if (lastIndex >= 0 && lastIndex < len && idx === lastIndex) {
      idx = (idx + 1) % len; // venkim kartojimo
    }
  }
  lastIndex = idx;
  localStorage.setItem('ds_last_index', String(idx));

  try {
    ytPlayer.unMute();
    ytPlayer.setVolume(lastVolume);
  } catch (_) {}

  if (len) {
    ytPlayer.playVideoAt(idx); // paleidžiam BŪTENT pasirinktą
  } else {
    ytPlayer.playVideo();      // fallback
  }

  isPlaying = true;
  updatePlayBtn();
  updateTrackInfo();
}

/********* MUZIKOS BARO PLAYERIS (be autoplay, lauks gesto) *********/
function initYTBarPlayer() {
  const barDiv = document.getElementById('yt-bar-player');
  if (barDiv) barDiv.style.display = 'block'; // leisk API sukurti iframe

  ytPlayer = new YT.Player('yt-bar-player', {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: playlistId,
      autoplay: 0,          // neleisk pirmai dainai startuoti
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: () => {
        ytBarReady = true;
        // jei user jau spėjo „paliesti“ — startuojam čia pat
        tryStartPlayback();
      },
      onStateChange: (e) => {
        updateTrackInfo();
        if (e.data === YT.PlayerState.PLAYING) {
          isPlaying = true; updatePlayBtn();
        } else if (e.data === YT.PlayerState.PAUSED) {
          isPlaying = false; updatePlayBtn();
        }
      }
    }
  });
}

/********* FONINIS BG PLAYER (muted, autostart) *********/
let bgPlayer, bgTriedHighres = false;

function initBgPlayer() {
  if (bgPlayer || !window.YT || !YT.Player) return;
  bgPlayer = new YT.Player('yt-bg', {
    width: '1920',
    height: '1080',
    videoId: BG_VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      loop: 1,
      playlist: BG_VIDEO_ID,
      playsinline: 1,
      iv_load_policy: 3,
      fs: 0,
      disablekb: 1
    },
    events: {
      onReady: (e) => {
        try { e.target.mute(); } catch(_) {}
        e.target.playVideo();
        trySetBgQuality('highres');
        setTimeout(() => trySetBgQuality('hd1080'), 800);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          e.target.seekTo(0, true);
          e.target.playVideo();
        }
        if (e.data === YT.PlayerState.PLAYING && !bgTriedHighres) {
          bgTriedHighres = true;
          trySetBgQuality('highres');
          setTimeout(() => trySetBgQuality('hd1080'), 1000);
        }
      }
    }
  });
}
function trySetBgQuality(q) {
  try { bgPlayer && bgPlayer.setPlaybackQuality && bgPlayer.setPlaybackQuality(q); } catch (_) {}
}

/********* VALDIKLIAI *********/
function togglePlayPause() {
  if (!ytPlayer) return;
  const st = ytPlayer.getPlayerState();
  if (st === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo(); isPlaying = false;
  } else {
    try { ytPlayer.unMute(); ytPlayer.setVolume(lastVolume); } catch (_) {}
    ytPlayer.playVideo(); isPlaying = true;
  }
  updatePlayBtn();
}
function updatePlayBtn() {
  const icon = document.getElementById("playPauseIcon");
  if (!icon) return;
  icon.src = isPlaying ? "icons/pause.svg" : "icons/play.svg";
}
function prevTrack() { if (ytPlayer) ytPlayer.previousVideo(); }
function nextTrack() { if (ytPlayer) ytPlayer.nextVideo(); }
function setVolume(value) {
  if (!ytPlayer) return;
  try { ytPlayer.unMute(); } catch (_) {}
  ytPlayer.setVolume(value);
  lastVolume = value;
}
function closePlayer() {
  if (ytPlayer) { ytPlayer.stopVideo(); ytPlayer.mute(); }
  const c = document.getElementById("yt-bar-player-container");
  if (c) c.style.display = "none";
}
function updateTrackInfo() {
  setTimeout(() => {
    if (!ytPlayer || !ytPlayer.getVideoData) return;
    const data = ytPlayer.getVideoData();
    const videoId = data.video_id;
    const title = data.title;
    const coverEl = document.getElementById("yt-cover");
    if (videoId && coverEl) coverEl.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const titleEl = document.getElementById("yt-track-title");
    if (titleEl) titleEl.textContent = title || 'Loading...';
  }, 300);
}

/********* LightGallery (jei naudojama) *********/
if (typeof lightGallery === 'function') {
  const utopija = document.getElementById('utopija-gallery');
  if (utopija) {
    lightGallery(utopija, {
      plugins: [lgZoom, lgThumbnail],
      speed: 400,
      thumbnail: true,
      zoom: true,
      hideControls: false
    });
  }
}
