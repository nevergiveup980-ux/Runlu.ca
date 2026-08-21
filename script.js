const menuButton=document.getElementById('menuButton');
const mobileMenu=document.getElementById('mobileMenu');
const year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();

function applyInjectedLanguage(root){
  const lang=document.documentElement.dataset.runluLanguage||'en';
  root.querySelectorAll('[data-en]').forEach(el=>{
    const value=el.dataset[lang]||el.dataset.en;
    if(value)el.textContent=value;
  });
}
function addGoodsLinks(){
  document.querySelectorAll('.desktop-nav,.mobile-menu').forEach(nav=>{
    if(nav.querySelector('a[href="goods.html"]'))return;
    const link=document.createElement('a');
    link.href='goods.html';
    link.dataset.en='Goods';
    link.dataset.zh='润庐物件';
    link.dataset.fr='Objets';
    link.dataset.es='Objetos';
    link.textContent='Goods';
    const studio=[...nav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='#studio'||a.getAttribute('href')==='index.html#studio');
    if(studio)studio.insertAdjacentElement('afterend',link);else nav.appendChild(link);
    applyInjectedLanguage(nav);
  });
  const grid=document.querySelector('#current .current-grid');
  if(grid&&!grid.querySelector('a[href="goods.html"]')){
    const item=document.createElement('a');
    item.className='current-item';
    item.href='goods.html';
    item.innerHTML='<span>RUNLU GOODS</span><b data-en="First objects · small batch" data-zh="首批物件 · 小批量" data-fr="Premiers objets · petite série" data-es="Primeros objetos · serie pequeña">First objects · small batch</b>';
    grid.appendChild(item);
    applyInjectedLanguage(grid);
  }
}
addGoodsLinks();

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
