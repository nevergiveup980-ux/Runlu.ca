/* RUNLU Deerfoot Flooring OS · Runtime Bootstrap Guard V0.1.1
   Safe recovery only: never reloads app.js and never re-runs the full base load routine. */
(function(){
  'use strict';
  function navReady(){
    const n=document.getElementById('nav');
    return !!(n&&n.querySelector('button'));
  }
  function repairNav(){
    if(navReady())return;
    try{
      if(typeof window.renderNav==='function'){
        window.renderNav();
        if(typeof window.renderAll==='function')window.renderAll();
      }
    }catch(e){
      console.warn('Flooring OS navigation recovery skipped:',e);
    }
  }
  function check(){
    setTimeout(repairNav,80);
    setTimeout(repairNav,450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});
  else check();
  window.addEventListener('pageshow',check);
})();
