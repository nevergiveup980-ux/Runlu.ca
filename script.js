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
function correctMadeGoodsStatuses(){
  const list=document.querySelector('.goods-list');
  if(!list)return;
  const findItem=title=>[...list.querySelectorAll('.goods-item')].find(item=>item.querySelector('h2')?.textContent.trim()===title);
  const setText=(el,values)=>{
    if(!el)return;
    Object.entries(values).forEach(([lang,value])=>{el.dataset[lang]=value});
  };
  const setAlt=(img,values)=>{
    if(!img)return;
    Object.entries(values).forEach(([lang,value])=>{img.dataset['alt'+lang.charAt(0).toUpperCase()+lang.slice(1)]=value});
    const lang=document.documentElement.dataset.runluLanguage||'en';
    const key='alt'+lang.charAt(0).toUpperCase()+lang.slice(1);
    img.alt=img.dataset[key]||img.dataset.altEn;
  };

  const crown=findItem('RUNLU Crown Cap');
  if(crown){
    setText(crown.querySelector('.goods-index'),{en:'03 · MADE OBJECT',zh:'03 · 已制作物件',fr:'03 · OBJET RÉALISÉ',es:'03 · OBJETO REALIZADO'});
    setText(crown.querySelector('.goods-tagline'),{en:'A finished RUNLU cap from a bolder, jewel-toned visual direction.',zh:'一顶真正制作完成的 RUNLU 帽子，来自更大胆、更偏珠宝色彩的视觉方向。',fr:'Une casquette RUNLU réellement fabriquée, issue d’une direction visuelle plus audacieuse aux tons précieux.',es:'Una gorra RUNLU realmente fabricada, nacida de una dirección visual más audaz y de tonos joya.'});
    setText(crown.querySelector('.goods-description'),{en:'A deep navy cap that was actually made, built around a gold crown, a blue jewel, and the RUNLU wordmark. It records an alternate RUNLU visual direction as a real physical object, not merely a design study.',zh:'一顶已经真实制作完成的深海军蓝帽子，以金色皇冠、蓝色宝石和 RUNLU 字样为核心。它记录了 RUNLU 的另一条视觉方向——不是停留在设计图上的研究，而是一件真正存在的实物。',fr:'Une casquette bleu marine réellement fabriquée, construite autour d’une couronne dorée, d’une pierre bleue et du mot-symbole RUNLU. Elle conserve une direction visuelle alternative de RUNLU sous la forme d’un véritable objet, et non d’une simple étude de design.',es:'Una gorra azul marino realmente fabricada, construida alrededor de una corona dorada, una gema azul y el logotipo RUNLU. Conserva una dirección visual alternativa de RUNLU como un objeto físico real, no solo como un estudio de diseño.'});
    const meta=crown.querySelector('.goods-meta');
    if(meta)meta.innerHTML='<span data-en="Made" data-zh="已制作" data-fr="Réalisé" data-es="Realizado">Made</span><span data-en="Alternate direction" data-zh="另一视觉方向" data-fr="Direction alternative" data-es="Dirección alternativa">Alternate direction</span><span data-en="Not currently for sale" data-zh="目前不对外销售" data-fr="Pas en vente actuellement" data-es="No está a la venta actualmente">Not currently for sale</span>';
    setAlt(crown.querySelector('img'),{en:'Real deep navy RUNLU Crown Cap with gold crown and blue jewel',zh:'真实制作的深海军蓝 RUNLU 皇冠帽，配金色皇冠和蓝色宝石',fr:'Casquette Crown RUNLU bleu marine réellement fabriquée, avec couronne dorée et pierre bleue',es:'Gorra Crown RUNLU azul marino realmente fabricada, con corona dorada y gema azul'});
    applyInjectedLanguage(crown);
  }

  const belt=findItem('RUNLU Crest Belt');
  if(belt){
    setText(belt.querySelector('.goods-index'),{en:'04 · MADE OBJECT',zh:'04 · 已制作物件',fr:'04 · OBJET RÉALISÉ',es:'04 · OBJETO REALIZADO'});
    setText(belt.querySelector('.goods-tagline'),{en:'A real RUNLU accessory carrying the identity into everyday use.',zh:'一件真正做出来的 RUNLU 配件，把品牌语言带进日常使用。',fr:'Un véritable accessoire RUNLU qui porte son identité dans l’usage quotidien.',es:'Un accesorio RUNLU real que lleva su identidad al uso cotidiano.'});
    setText(belt.querySelector('.goods-description'),{en:'A black belt that was actually made, centered on an ornate crest buckle with dragon-and-lion heraldic elements and the RUNLU name. It is a finished physical accessory, preserved as part of the RUNLU Goods story.',zh:'一条已经真实制作完成的黑色皮带，核心是一枚带有龙、狮纹章元素与 RUNLU 字样的装饰性腰带扣。它是一件真正完成的实体配件，作为 RUNLU Goods 故事的一部分被保留下来。',fr:'Une ceinture noire réellement fabriquée, centrée sur une boucle héraldique ornée avec des éléments de dragon et de lion ainsi que le nom RUNLU. C’est un accessoire physique fini, conservé comme partie de l’histoire de RUNLU Goods.',es:'Un cinturón negro realmente fabricado, centrado en una hebilla heráldica ornamentada con elementos de dragón y león y el nombre RUNLU. Es un accesorio físico terminado, conservado como parte de la historia de RUNLU Goods.'});
    const meta=belt.querySelector('.goods-meta');
    if(meta)meta.innerHTML='<span data-en="Made" data-zh="已制作" data-fr="Réalisé" data-es="Realizado">Made</span><span data-en="Accessory" data-zh="配件" data-fr="Accessoire" data-es="Accesorio">Accessory</span><span data-en="Not currently for sale" data-zh="目前不对外销售" data-fr="Pas en vente actuellement" data-es="No está a la venta actualmente">Not currently for sale</span>';
    setAlt(belt.querySelector('img'),{en:'Real black RUNLU Crest Belt with ornate heraldic buckle',zh:'真实制作的黑色 RUNLU 徽章皮带，配装饰性纹章腰带扣',fr:'Ceinture RUNLU noire réellement fabriquée avec boucle héraldique ornée',es:'Cinturón RUNLU negro realmente fabricado con hebilla heráldica ornamentada'});
    applyInjectedLanguage(belt);
  }

  const dragon=findItem('RUNLU Dragon & Phoenix Cap');
  if(dragon){
    setText(dragon.querySelector('.goods-index'),{en:'05 · ARCHIVE PIECE',zh:'05 · 实物档案',fr:'05 · PIÈCE D’ARCHIVE',es:'05 · PIEZA DE ARCHIVO'});
    setText(dragon.querySelector('.goods-tagline'),{en:'A real early RUNLU object, kept in the story rather than redesigned away.',zh:'一件真实制作过的早期 RUNLU 物件——保留在故事里，而不是把它重新设计掉。',fr:'Un véritable objet RUNLU des débuts, conservé dans l’histoire plutôt que redessiné.',es:'Un objeto RUNLU real de los primeros años, conservado en la historia en lugar de rediseñarlo.'});
    setText(dragon.querySelector('.goods-description'),{en:'A black cap that was actually made during an earlier RUNLU visual period, embroidered in gold with a dragon-and-phoenix composition, a green center, and the line “RISE FROM WITHIN.” Its style differs from today’s quieter Goods language, which is exactly why this real object belongs in the archive.',zh:'一顶在 RUNLU 较早视觉阶段真正制作完成的黑色帽子，以金色刺绣呈现龙凤构图、绿色中心，并带有 “RISE FROM WITHIN” 字样。它和今天更安静的 Goods 语言并不相同，而这恰恰是这件真实实物值得被保留进档案的原因。',fr:'Une casquette noire réellement fabriquée durant une période visuelle plus ancienne de RUNLU, brodée d’or avec une composition dragon-phénix, un centre vert et la phrase « RISE FROM WITHIN ». Son style diffère du langage plus calme d’aujourd’hui — précisément pourquoi cet objet réel mérite sa place dans l’archive.',es:'Una gorra negra realmente fabricada durante una etapa visual anterior de RUNLU, bordada en dorado con una composición de dragón y fénix, centro verde y la frase “RISE FROM WITHIN”. Su estilo difiere del lenguaje más sereno de hoy, y precisamente por eso este objeto real pertenece al archivo.'});
    const meta=dragon.querySelector('.goods-meta');
    if(meta)meta.innerHTML='<span data-en="Made" data-zh="已制作" data-fr="Réalisé" data-es="Realizado">Made</span><span data-en="Archive piece" data-zh="档案作品" data-fr="Pièce d’archive" data-es="Pieza de archivo">Archive piece</span><span data-en="Early RUNLU" data-zh="早期 RUNLU" data-fr="RUNLU des débuts" data-es="RUNLU temprano">Early RUNLU</span>';
    setAlt(dragon.querySelector('img'),{en:'Real early black RUNLU Dragon & Phoenix Cap with gold embroidery and green center',zh:'真实制作的早期黑色 RUNLU 龙凤帽，金色刺绣与绿色中心',fr:'Véritable ancienne casquette RUNLU noire dragon-phénix, broderie dorée et centre vert',es:'Gorra RUNLU negra real de los primeros años, de dragón y fénix, con bordado dorado y centro verde'});
    applyInjectedLanguage(dragon);
  }
}
addGoodsLinks();
correctMadeGoodsStatuses();
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

function addRunluCoreHomeEntry(){
  const path=window.location.pathname.replace(/\/+$/,'')||'/';
  if(path!=='/'&&!path.endsWith('/index.html'))return;
  const footer=document.querySelector('.site-footer');
  const target=footer?.lastElementChild;
  if(!target||target.querySelector('[data-runlu-core-entry]'))return;
  const sep=document.createTextNode(' · ');
  const link=document.createElement('a');
  link.href='core/core-test.html';
  link.textContent='Core';
  link.dataset.runluCoreEntry='';
  link.setAttribute('aria-label','Open RUNLU Core');
  link.title='RUNLU Core';
  link.style.cssText='opacity:.42;border-bottom:1px dotted currentColor;white-space:nowrap;font-size:.9em;transition:opacity .18s ease';
  const dim=()=>{link.style.opacity='.42'};
  const show=()=>{link.style.opacity='.82'};
  link.addEventListener('focus',show);
  link.addEventListener('blur',dim);
  link.addEventListener('mouseenter',show);
  link.addEventListener('mouseleave',dim);
  target.append(sep,link);
}
addRunluCoreHomeEntry();
