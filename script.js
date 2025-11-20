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

let ytPlayer = null;
let ytBarReady = false;
let ytStarted = false;
let isPlaying = false;
let lastVolume = 45;

let userInteracted = false;
let lastIndex = parseInt(localStorage.getItem('ds_last_index') || '-1', 10);

/********* Įkeliame YouTube Iframe API *********/
(function () {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

/********* USER VEIKSMO „KICK“ *********/
function addKickListeners() {
  const kick = () => {
    userInteracted = true;
    tryStartPlayback();
  };

  window.addEventListener('click', kick, { passive: true });
  window.addEventListener('touchstart', kick, { passive: true });
  window.addEventListener('keydown', kick, { passive: true });
  window.addEventListener('wheel', kick, { passive: true });

  const onScroll = () => {
    if (window.scrollY > 0) kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

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

/********* IFRAME API READY *********/
function onYouTubeIframeAPIReady() {
  initYTBarPlayer(); // tik baro playeris
}

/********* START LOGIKA *********/
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
  try { ids = ytPlayer.getPlaylist() || []; } catch (_) {}

  const len = ids.length || 0;
  let idx = 0;

  if (len > 1) {
    idx = Math.floor(Math.random() * len);
    if (lastIndex >= 0 && lastIndex < len && idx === lastIndex) {
      idx = (idx + 1) % len;
    }
  }
  lastIndex = idx;
  localStorage.setItem('ds_last_index', String(idx));

  try {
    ytPlayer.unMute();
    ytPlayer.setVolume(lastVolume);
  } catch (_) {}

  if (len) ytPlayer.playVideoAt(idx);
  else ytPlayer.playVideo();

  isPlaying = true;
  updatePlayBtn();
  updateTrackInfo();
}

/********* MUZIKOS BARO PLAYERIS *********/
function initYTBarPlayer() {
  const barDiv = document.getElementById('yt-bar-player');
  if (barDiv) barDiv.style.display = 'block';

  ytPlayer = new YT.Player('yt-bar-player', {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: playlistId,
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: () => {
        ytBarReady = true;
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
      }
    }
  });
}

/********* VALDIKLIAI *********/
function togglePlayPause() {
  if (!ytPlayer) return;
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
}

function updatePlayBtn() {
  const icon = document.getElementById('playPauseIcon');
  if (!icon) return;
  icon.src = isPlaying ? 'icons/pause.svg' : 'icons/play.svg';
}

function prevTrack() {
  if (ytPlayer) ytPlayer.previousVideo();
}

function nextTrack() {
  if (ytPlayer) ytPlayer.nextVideo();
}

function setVolume(value) {
  if (!ytPlayer) return;
  try { ytPlayer.unMute(); } catch (_) {}
  ytPlayer.setVolume(value);
  lastVolume = value;
}

function closePlayer() {
  if (ytPlayer) {
    ytPlayer.stopVideo();
    ytPlayer.mute();
  }
  const c = document.getElementById('yt-bar-player-container');
  if (c) c.style.display = 'none';
}

function updateTrackInfo() {
  setTimeout(() => {
    if (!ytPlayer || !ytPlayer.getVideoData) return;
    const data = ytPlayer.getVideoData();
    const videoId = data.video_id;
    const title = data.title;

    const coverEl = document.getElementById('yt-cover');
    if (videoId && coverEl) {
      coverEl.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    const titleEl = document.getElementById('yt-track-title');
    if (titleEl) {
      titleEl.textContent = title || 'Loading...';
    }
  }, 300);
}

/********* LightGallery *********/
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
