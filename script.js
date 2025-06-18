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
