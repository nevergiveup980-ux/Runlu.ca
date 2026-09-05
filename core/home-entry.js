(()=>{
  'use strict';
  function addCoreEntry(){
    const footer=document.querySelector('.site-footer');
    if(!footer||footer.querySelector('[data-runlu-core-entry]'))return;
    const copyright=footer.lastElementChild;
    if(!copyright)return;
    const sep=document.createTextNode(' · ');
    const link=document.createElement('a');
    link.href='core/core-test.html';
    link.textContent='Core';
    link.dataset.runluCoreEntry='';
    link.setAttribute('aria-label','Open RUNLU Core');
    link.title='RUNLU Core';
    link.style.cssText='opacity:.42;border-bottom:1px dotted currentColor;white-space:nowrap;font-size:.9em';
    link.addEventListener('focus',()=>{link.style.opacity='.8'});
    link.addEventListener('blur',()=>{link.style.opacity='.42'});
    link.addEventListener('mouseenter',()=>{link.style.opacity='.8'});
    link.addEventListener('mouseleave',()=>{link.style.opacity='.42'});
    copyright.append(sep,link);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCoreEntry,{once:true});
  else addCoreEntry();
})();
