window.addEventListener('load', () => {
  document.body.classList.remove('is-preload');
});
document.querySelectorAll('.scrolly').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').substring(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
});
// (Assuming this is already part of your script.js)
window.addEventListener('load', () => document.body.classList.remove('is-preload'));

document.querySelectorAll('.scrolly').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').substring(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
});
function loadAndPlayVideo(videoId, clickedContainer) {
    const imgElement = clickedContainer.querySelector('img');
    const playOverlay = clickedContainer.querySelector('.play-overlay');
    const iframeElement = clickedContainer.querySelector('.video-iframe');

    // Paslėpti miniatiūrą ir grojimo perdangą
    if (imgElement) {
        imgElement.style.display = 'none';
    }
    if (playOverlay) {
        playOverlay.style.display = 'none';
    }

    // Nustatyti iframe šaltinį (src) ir padaryti jį matomu
    if (iframeElement) {
        iframeElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframeElement.style.display = 'block';
    }
}