const menuButton=document.getElementById('menuButton');const mobileMenu=document.getElementById('mobileMenu');const languageToggle=document.getElementById('languageToggle');document.getElementById('year').textContent=new Date().getFullYear();menuButton.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});document.querySelectorAll('#mobileMenu a').forEach(link=>link.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));let currentLanguage='en';function applyLanguage(lang){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-en][data-zh]').forEach(el=>{el.textContent=el.dataset[lang]});languageToggle.textContent=lang==='en'?'中文':'EN'}languageToggle.addEventListener('click',()=>{currentLanguage=currentLanguage==='en'?'zh':'en';applyLanguage(currentLanguage)});applyLanguage(currentLanguage);


/* ===== RUNLU V1.1 motion system ===== */
document.documentElement.classList.add('js-enabled');

const hero = document.querySelector('.hero');
requestAnimationFrame(() => {
  if (hero) hero.classList.add('is-ready');
});

/* Mark sections and cards for reveal without changing the HTML manually */
const revealTargets = [
  ...document.querySelectorAll('.section-kicker'),
  ...document.querySelectorAll('.section h2'),
  ...document.querySelectorAll('.long-copy'),
  ...document.querySelectorAll('.content-card'),
  ...document.querySelectorAll('.section-heading'),
  ...document.querySelectorAll('.project-card'),
  ...document.querySelectorAll('.contact-section > *'),
  ...document.querySelectorAll('.site-footer > *')
];

revealTargets.forEach((el, index) => {
  el.classList.add('reveal');
  if (el.matches('.content-card:nth-child(1), .project-card:nth-child(1)')) {
    el.classList.add('reveal-left');
  }
  if (el.matches('.content-card:nth-child(2), .project-card:nth-child(2)')) {
    el.classList.add('reveal-right');
  }
  if (el.matches('.content-card, .project-card')) {
    el.classList.add('stagger');
  }
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px'
});

revealTargets.forEach(el => revealObserver.observe(el));

/* Header refinement after the first bit of scrolling */
const header = document.querySelector('.site-header');
const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 18);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
