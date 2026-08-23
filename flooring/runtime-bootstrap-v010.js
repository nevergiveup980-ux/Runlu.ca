/* RUNLU Deerfoot Flooring OS · Runtime Bootstrap Guard V0.1.0
   Recovers the base app when Safari restores a page from cache/BFCache without a normal load boot. */
(function(){
  'use strict';
  let retrying=false;
  function navReady(){const n=document.getElementById('nav');return !!(n&&n.querySelector('button'))}
  function tryBaseBoot(){
    if(navReady()) return;
    try{
      if(typeof window.load==='function'){window.load();if(navReady())return}
      if(typeof window.renderNav==='function'){window.renderNav();if(typeof window.renderAll==='function')window.renderAll();if(navReady())return}
    }catch(e){console.warn('Flooring OS base boot retry failed:',e)}
    if(retrying||typeof window.go==='function')return;
    retrying=true;
    const s=document.createElement('script');
    s.src='app.js?v=0313-runtime-2';
    s.dataset.runluBaseRecovery='1';
    s.onload=()=>{try{if(typeof window.load==='function')window.load()}catch(e){console.error('Flooring OS recovery boot failed:',e)}};
    s.onerror=()=>console.error('Flooring OS base app failed to reload.');
    document.body.appendChild(s);
  }
  function check(){setTimeout(tryBaseBoot,60);setTimeout(tryBaseBoot,320)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
  window.addEventListener('pageshow',check);
})();
