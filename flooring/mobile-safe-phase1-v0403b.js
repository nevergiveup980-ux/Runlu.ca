/* RUNLU Deerfoot Flooring OS · V0.4.03b Mobile Safe Phase 1
   Lazy reintroduction for iPhone/iPad Safe Core.
   Nothing loads at startup beyond this tiny router.
   Phase 1 modules load only when their related page is first opened.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE1_V0403B__)return;
root.__RUNLU_MOBILE_SAFE_PHASE1_V0403B__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03b';
const registry={
  pricing:{src:'pricing-cost-control-v078.js?v=0403b',marker:'data-runlu-mobile-pricing-v078',global:'RUNLUPricingCostControlV078',state:'idle'},
  management:{src:'management-review-v080.js?v=0403b',marker:'data-runlu-mobile-management-v080',global:'RUNLUManagementReviewV080',state:'idle'},
  history:{src:'po-history-v085.js?v=0403b',marker:'data-runlu-mobile-history-v085',global:'RUNLUPOArchiveV085',state:'idle'}
};
const aliases={
  pricing:['pricing','price','price book','product & cost','cost control'],
  management:['accounting','management','a/r','commission'],
  history:['purchasing','po / supplier','supplier orders','po history','archive']
};
const report={version:VERSION,loaded:[],failed:[],lastAction:''};

function scriptExists(marker){return !!document.querySelector('script['+marker+']')}
function updateBadge(){
  const p=document.querySelector('header .pill');
  if(p&&!/Safe Plus/i.test(p.textContent||''))p.textContent='V0.4.03b Safe Plus';
  const demo=document.getElementById('command')?.querySelector?.('.demo');
  if(demo&&!/Safe Phase 1/i.test(demo.textContent||''))demo.textContent='V0.4.03b · iPhone Safe Phase 1 · optional modules load only when opened.';
}
function load(name){
  const m=registry[name];if(!m)return Promise.reject(new Error('Unknown Safe module '+name));
  if(m.state==='loaded'||root[m.global]){m.state='loaded';if(!report.loaded.includes(name))report.loaded.push(name);return Promise.resolve(true)}
  if(m.state==='loading'&&m.promise)return m.promise;
  if(scriptExists(m.marker)){m.state='loading';return new Promise(resolve=>setTimeout(()=>{m.state=root[m.global]?'loaded':'failed';resolve(m.state==='loaded')},300))}
  m.state='loading';report.lastAction='loading '+name;
  m.promise=new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=m.src;s.async=true;s.setAttribute(m.marker,'1');
    s.onload=()=>{m.state='loaded';if(!report.loaded.includes(name))report.loaded.push(name);report.lastAction='loaded '+name;updateBadge();resolve(true)};
    s.onerror=()=>{m.state='failed';if(!report.failed.includes(name))report.failed.push(name);report.lastAction='failed '+name;try{s.remove()}catch(_){}reject(new Error('Safe module failed: '+name))};
    document.body.appendChild(s)
  });
  return m.promise
}
function textOf(el){return [el?.textContent,el?.getAttribute?.('data-page'),el?.getAttribute?.('onclick'),el?.id,el?.getAttribute?.('aria-label')].filter(Boolean).join(' ').toLowerCase()}
function matches(name,text){return aliases[name].some(x=>text.includes(x))}
function routeClick(ev){
  const el=ev.target?.closest?.('button,a,[data-page],[onclick]');
  if(!el)return;
  const text=textOf(el);
  let name='';
  if(matches('pricing',text))name='pricing';
  else if(matches('management',text))name='management';
  else if(matches('history',text))name='history';
  if(!name)return;
  setTimeout(()=>load(name).catch(e=>console.warn('[RUNLU Mobile Safe Phase 1]',e?.message||e)),80)
}
function prewarmFromActivePage(){
  const active=document.querySelector('.page.active');
  if(!active)return;
  const id=(active.id||'').toLowerCase();
  if(id==='pricing')load('pricing').catch(()=>{});
  else if(id==='accounting')load('management').catch(()=>{});
  else if(id==='purchasing')load('history').catch(()=>{});
}
function status(){return {version:VERSION,registry:Object.fromEntries(Object.entries(registry).map(([k,v])=>[k,v.state])),loaded:[...report.loaded],failed:[...report.failed],lastAction:report.lastAction}}
document.addEventListener('click',routeClick,true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')prewarmFromActivePage()});
updateBadge();
setTimeout(prewarmFromActivePage,500);
root.RUNLUMobileSafePhase1V0403B={VERSION,load,status,registry};
})(typeof window!=='undefined'?window:globalThis);
