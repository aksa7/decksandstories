// Pašalinam is-preload klasę kai puslapis užsikrauna
window.addEventListener('load', () => {
  document.body.classList.remove('is-preload');
});

// Sklandus scroll'inimas visiems .scrolly linkams
document.querySelectorAll('.scrolly').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const section = document.querySelector(targetId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

// Paleidžia YouTube video kai paspaudžiamas video kortelės viršus
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
const playlistId = 'PLpO5SCIZiofW3wdYBluol3nICkDQRxrP3'; // tavo grojaraščio ID
  let ytPlayer, ytReady = false, ytStarted = false, isPlaying = false, lastVolume = 40;

  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);

  function onYouTubeIframeAPIReady() {
  ytReady = true;
  initBgPlayer();
}

  function initYTPlaylistPlayer() {
    if (!ytReady || ytStarted) return;

    const randomIndex = Math.floor(Math.random() * 50); // max = grojaraščio dainų skaičius
    ytPlayer = new YT.Player('yt-bar-player', {
      height: '0',
      width: '0',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 1,
        index: randomIndex,
        controls: 0,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: (event) => {
          ytStarted = true;
          event.target.setVolume(lastVolume);
          event.target.playVideo();
          isPlaying = true;
          updatePlayBtn();
          updateTrackInfo();
        },
        onStateChange: updateTrackInfo
      }
    });
  }
// === BG YouTube Player ===
const BG_VIDEO_ID = 'i5LrO01EffM'; // tavo foninis YouTube video ID
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
      playlist: BG_VIDEO_ID,   // būtina loop'ui
      playsinline: 1,
      iv_load_policy: 3,
      fs: 0,
      disablekb: 1
    },
    events: {
      onReady: (e) => {
        e.target.mute();
        e.target.playVideo();
        // prašom maksimalios kokybės (YouTube vis tiek gali adaptuoti)
        trySetBgQuality('highres');          // 4K jei yra
        setTimeout(() => trySetBgQuality('hd1080'), 800); // 1080p
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
  try {
    if (bgPlayer && bgPlayer.setPlaybackQuality) {
      bgPlayer.setPlaybackQuality(q);
    }
  } catch (_) {}
}

// „Resume“ grįžus į tab’ą (kai naršyklė pristabdo)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && bgPlayer && bgPlayer.playVideo) {
    bgPlayer.playVideo();
  }
});

// Jei autoplay užblokuotas – startinam po pirmo click/touch
const __kickBgOnce = () => {
  if (bgPlayer && bgPlayer.playVideo) bgPlayer.playVideo();
  window.removeEventListener('click', __kickBgOnce);
  window.removeEventListener('touchstart', __kickBgOnce);
};
window.addEventListener('click', __kickBgOnce, { once: true });
window.addEventListener('touchstart', __kickBgOnce, { once: true });

  function triggerYTPlayer() {
    initYTPlaylistPlayer();
    window.removeEventListener('scroll', scrollTrigger);
    window.removeEventListener('click', triggerYTPlayer);
  }

  function scrollTrigger() {
    if (window.scrollY > 200) triggerYTPlayer();
  }

  window.addEventListener('click', triggerYTPlayer);
  window.addEventListener('scroll', scrollTrigger);

  function togglePlayPause() {
    if (!ytPlayer) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      isPlaying = false;
    } else {
      ytPlayer.playVideo();
      isPlaying = true;
    }
    updatePlayBtn();
  }

function updatePlayBtn() {
  const icon = document.getElementById("playPauseIcon");
  if (!icon) return;
  icon.src = isPlaying ? "icons/pause.svg" : "icons/play.svg";
}


  function prevTrack() {
    if (ytPlayer) ytPlayer.previousVideo();
  }

  function nextTrack() {
    if (ytPlayer) ytPlayer.nextVideo();
  }

  function setVolume(value) {
    if (ytPlayer) {
      ytPlayer.setVolume(value);
      lastVolume = value;
    }
  }

  function closePlayer() {
    if (ytPlayer) {
      ytPlayer.stopVideo();
      ytPlayer.mute();
    }
    document.getElementById("yt-bar-player-container").style.display = "none";
  }

  function updateTrackInfo() {
    setTimeout(() => {
      if (!ytPlayer || !ytPlayer.getVideoData) return;
      const data = ytPlayer.getVideoData();
      const videoId = data.video_id;
      const title = data.title;

      if (videoId) {
        document.getElementById("yt-cover").src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }

      document.getElementById("yt-track-title").textContent = title || 'Loading...';

    }, 300);
  }
  // Inicijuojam Utopija galeriją
lightGallery(document.getElementById('utopija-gallery'), {
  plugins: [lgZoom, lgThumbnail],
  speed: 400,
  thumbnail: true,
  zoom: true,
  hideControls: false
});

// Jei įkelsi IPANEMA nuotraukas vėliau, tiesiog inicijuok ją irgi:
// lightGallery(document.getElementById('ipanema-gallery'), { plugins: [lgZoom, lgThumbnail], speed: 400 });
