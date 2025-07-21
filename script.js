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
  }

  function initYTPlaylistPlayer() {
    if (!ytReady || ytStarted) return;

    ytPlayer = new YT.Player('yt-bar-player', {
      height: '0',
      width: '0',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 1,
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
    document.getElementById("playPauseBtn").textContent = isPlaying ? "⏸" : "▶";
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