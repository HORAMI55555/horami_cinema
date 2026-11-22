(() => {
  const toggle = document.querySelector('#menu-trigger');
  const menu = document.querySelector('#cinema-menu');
  function show(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.onclick = () => show(toggle.getAttribute('aria-expanded') !== 'true');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      show(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) show(false);
  });
  function links() {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
    menu.querySelector('.feature-link').href = 'features.html?lang=' + lang;
    menu.querySelector('.menu-quiz').href = 'quiz.html?lang=' + lang;
  }
  links();
  new MutationObserver(links).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  matchMedia('(max-width: 840px)').addEventListener('change', () => show(false));
})();
