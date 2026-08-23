/* RUNLU Deerfoot Flooring OS · Version Authority V0.3.13 */
(function(){
  'use strict';
  const VERSION='V0.3.13 Pricing + System Settings';
  const TITLE='RUNLU Deerfoot Flooring OS V0.3.13';
  function replaceObservedNode(selector,text){const old=document.querySelector(selector);if(!old)return null;const fresh=old.cloneNode(false);fresh.textContent=text;old.replaceWith(fresh);return fresh}
  function boot(){
    if(window.__runluFlooringVersionAuthority0313)return;window.__runluFlooringVersionAuthority0313=true;
    replaceObservedNode('header .pill',VERSION);replaceObservedNode('title',TITLE);
    const pill=document.querySelector('header .pill'),title=document.querySelector('title');
    const enforce=()=>{if(pill&&pill.textContent!==VERSION)pill.textContent=VERSION;if(title&&title.textContent!==TITLE)title.textContent=TITLE;document.title=TITLE};
    if(pill)new MutationObserver(enforce).observe(pill,{childList:true,subtree:true,characterData:true});
    if(title)new MutationObserver(enforce).observe(title,{childList:true,subtree:true,characterData:true});
    [0,300,700,1200,2000].forEach(ms=>setTimeout(enforce,ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();