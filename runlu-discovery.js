/* RUNLU Discovery: editorially curated links, no cookies or telemetry. */
(()=>{'use strict';
const cards=[
 {href:'book/',title:['Books & stories','书籍与故事','Livres et récits','Libros e historias'],description:['Explore stories that stay with you.','探索值得慢慢品读的故事。','Découvrez des histoires à savourer.','Descubre historias para disfrutar.']},
 {href:'frontiers.html',title:['Frontiers','前沿','Frontières','Fronteras'],description:['Ideas and questions about a changing world.','探索变化世界中的思想与问题。','Idées et questions sur un monde en mutation.','Ideas y preguntas sobre un mundo cambiante.']},
 {href:'digital.html',title:['Digital creations','数字作品','Créations numériques','Creaciones digitales'],description:['Discover useful tools and playful experiments.','发现实用工具与有趣的数字实验。','Découvrez des outils et expériences créatives.','Descubre herramientas y experimentos creativos.']}
];
const locales={en:0,zh:1,fr:2,es:3};
function render(){const grid=document.getElementById('runluDiscoveryGrid');if(!grid)return;const lang=window.RUNLULanguage?.get?.()||document.documentElement.lang?.slice(0,2)||'en';const i=locales[lang]??0;grid.replaceChildren(...cards.map(card=>{const a=document.createElement('a');a.className='runlu-discovery-card';a.href=card.href;const h=document.createElement('strong');h.textContent=card.title[i];const p=document.createElement('span');p.textContent=card.description[i];const arrow=document.createElement('em');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');a.append(h,p,arrow);return a;}));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
document.addEventListener('change',e=>{if(e.target?.matches?.('[data-runlu-language-select]'))queueMicrotask(render);});
// Programmatic language changes may not fire a select change event.
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-runlu-language','lang']});
})();
