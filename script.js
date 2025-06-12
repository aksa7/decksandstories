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
