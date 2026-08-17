const menuButton=document.getElementById('menuButton');
const mobileMenu=document.getElementById('mobileMenu');
const year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();

if(menuButton&&mobileMenu){
  menuButton.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
  });
  document.querySelectorAll('#mobileMenu a').forEach(link=>link.addEventListener('click',()=>{
    mobileMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
  }));
}

});
applyLanguage(currentLanguage);

document.documentElement.classList.add('js-enabled');
const hero=document.querySelector('.hero');
requestAnimationFrame(()=>{if(hero)hero.classList.add('is-ready')});

const revealTargets=[
  ...document.querySelectorAll('.section-kicker'),
  ...document.querySelectorAll('.section h2'),
  ...document.querySelectorAll('.long-copy'),
  ...document.querySelectorAll('.statement-copy'),
  ...document.querySelectorAll('.principle'),
  ...document.querySelectorAll('.section-heading'),
  ...document.querySelectorAll('.project-card'),
  ...document.querySelectorAll('.notes-panel > *'),
  ...document.querySelectorAll('.contact-section > *'),
  ...document.querySelectorAll('.site-footer > *')
];
revealTargets.forEach((el,index)=>{
  el.classList.add('reveal');
  if(index%2===0&&el.matches('.project-card,.principle'))el.classList.add('reveal-left');
  if(index%2===1&&el.matches('.project-card,.principle'))el.classList.add('reveal-right');
});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');obs.unobserve(entry.target)}
    });
  },{threshold:.1,rootMargin:'0px 0px -7% 0px'});
  revealTargets.forEach(el=>observer.observe(el));
}else{
  revealTargets.forEach(el=>el.classList.add('is-visible'));
}

const header=document.querySelector('.site-header');
const updateHeader=()=>{if(header)header.classList.toggle('is-scrolled',window.scrollY>18)};
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});
