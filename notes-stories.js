(() => {
  const category = 'philosophy-in-everyday-life';
  const index = document.querySelector('#notes-index');
  const empty = document.getElementById(category);
  const filters = document.querySelectorAll('.section-nav a[href="#notes-index"], .section-nav a[href="#philosophy-in-everyday-life"]');
  if (!index || !empty) return;

  function revealActiveFilter() {
    const active = document.querySelector('.section-nav a[aria-current="true"]');
    if (!active) return;
    const nav = active.closest('.section-nav');
    const item = active.getBoundingClientRect();
    const bounds = nav.getBoundingClientRect();
    if (item.left < bounds.left) nav.scrollLeft += item.left - bounds.left - 16;
    else if (item.right > bounds.right) nav.scrollLeft += item.right - bounds.right + 16;
  }

  function applyFilter() {
    const selected = location.hash === `#${category}` ? category : 'all';
    let visible = 0;
    document.querySelectorAll('main .field-card').forEach(card => {
      card.hidden = selected !== 'all' && card.dataset.storiesCategory !== selected;
      if (!card.hidden && index.contains(card)) visible++;
    });
    document.querySelectorAll('main > section:not(.field-hero):not(#notes-index)').forEach(section => {
      section.hidden = selected !== 'all';
    });
    empty.hidden = selected === 'all' || visible > 0;
    filters.forEach(link => {
      if (link.hash === (selected === 'all' ? '#notes-index' : `#${category}`)) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    revealActiveFilter();
  }

  window.addEventListener('runlu:languagechange', revealActiveFilter);
  window.addEventListener('hashchange', () => {
    applyFilter();
    const target = location.hash === `#${category}` ? empty :
      location.hash === '#notes-index' ? index : null;
    if (target && !target.hidden) target.scrollIntoView({ block: 'start' });
  });
  applyFilter();
})();
