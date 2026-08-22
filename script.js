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
function addBluePoloGoodsItem(){
  const list=document.querySelector('.goods-list');
  if(!list||list.querySelector('img[src="assets/runlu-blue-polo-made-v1.webp"]'))return;
  const item=document.createElement('article');
  item.className='goods-item';
  item.innerHTML='<div class="goods-visual"><img src="assets/runlu-blue-polo-made-v1.webp" loading="lazy" alt="Real blue RUNLU Polo with embroidered crest and white piping" data-alt-en="Real blue RUNLU Polo with embroidered crest and white piping" data-alt-zh="真实制作的蓝色 RUNLU Polo 衫，带刺绣徽章和白色滚边" data-alt-fr="Polo RUNLU bleu réellement fabriqué, avec écusson brodé et passepoil blanc" data-alt-es="Polo RUNLU azul realmente fabricado, con emblema bordado y ribete blanco"></div><div class="goods-copy"><span class="goods-index" data-en="06 · MADE OBJECT" data-zh="06 · 已制作物件" data-fr="06 · OBJET RÉALISÉ" data-es="06 · OBJETO REALIZADO">06 · MADE OBJECT</span><h2>RUNLU Blue Polo</h2><p class="goods-tagline" data-en="A real RUNLU Polo from an earlier visual chapter." data-zh="一件来自 RUNLU 较早视觉阶段的真实 Polo 实物。" data-fr="Un véritable polo RUNLU issu d’un chapitre visuel antérieur." data-es="Un polo RUNLU real de una etapa visual anterior.">A real RUNLU Polo from an earlier visual chapter.</p><p class="goods-description" data-en="A blue polo that was actually made, with white piping at the collar and sleeves and an embroidered RUNLU crest on the chest. It belongs here as a finished physical object from an earlier RUNLU period — preserved honestly rather than redesigned to match the present." data-zh="一件已经真实制作完成的蓝色 Polo 衫，领口与袖口带白色滚边，胸前绣有 RUNLU 徽章。它作为 RUNLU 较早阶段的一件成品实物被保留下来——真实展示，而不是为了迎合今天的视觉语言重新设计。" data-fr="Un polo bleu réellement fabriqué, avec passepoil blanc au col et aux manches et un écusson RUNLU brodé sur la poitrine. Il est conservé ici comme objet fini d’une période antérieure de RUNLU — montré honnêtement plutôt que redessiné pour correspondre au langage actuel." data-es="Un polo azul realmente fabricado, con ribete blanco en cuello y mangas y un emblema RUNLU bordado en el pecho. Se conserva aquí como objeto terminado de una etapa anterior de RUNLU, mostrado con honestidad en lugar de rediseñarlo para adaptarlo al lenguaje actual.">A blue polo that was actually made, with white piping at the collar and sleeves and an embroidered RUNLU crest on the chest. It belongs here as a finished physical object from an earlier RUNLU period — preserved honestly rather than redesigned to match the present.</p><div class="goods-meta"><span data-en="Made" data-zh="已制作" data-fr="Réalisé" data-es="Realizado">Made</span><span data-en="Early RUNLU" data-zh="早期 RUNLU" data-fr="RUNLU des débuts" data-es="RUNLU temprano">Early RUNLU</span><span data-en="Not currently for sale" data-zh="目前不对外销售" data-fr="Pas en vente actuellement" data-es="No está a la venta actualmente">Not currently for sale</span></div><div class="goods-palette">Royal blue · White · Gold</div></div>';
  list.appendChild(item);
  applyInjectedLanguage(item);
  const img=item.querySelector('img[data-alt-en]');
  if(img){
    const lang=document.documentElement.dataset.runluLanguage||'en';
    const key='alt'+lang.charAt(0).toUpperCase()+lang.slice(1);
    img.alt=img.dataset[key]||img.dataset.altEn;
  }
}
addGoodsLinks();
addBluePoloGoodsItem();

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