/* RUNLU Deerfoot Flooring OS · PO Item Lines UI Recovery V0.1.2
   Emergency stability hotfix.
   The previous PO Item Lines runtime is temporarily disabled because its repeated DOM polling / editor attachment could leave Safari and desktop navigation unresponsive.
   Existing PO data in localStorage is untouched. A safer item-line editor will be reintroduced after the base UI is confirmed stable.
*/
(function(){
  'use strict';
  if(window.__runluPOItemLinesRecoveryV012)return;
  window.__runluPOItemLinesRecoveryV012=true;
  const title='RUNLU Deerfoot Flooring OS V0.3.29 UI Recovery';
  document.title=title;
  function mark(){
    const pill=document.querySelector('header .pill');
    if(pill)pill.textContent='V0.3.29 UI Recovery';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
  window.addEventListener('pageshow',mark);
})();
