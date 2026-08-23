/* RUNLU Deerfoot Flooring OS · Sales Handover in-memory settings sync V0.1.3
   sales-v010 keeps Sales Team settings in its module closure. After a handover marks a rep Former,
   reload once so the top Sales buttons and Active/Inactive panels immediately reflect persisted settings. */
(function(){
  'use strict';
  function install(){
    const btn=document.getElementById('handoverExecute');if(!btn||btn.dataset.syncHook==='1')return;btn.dataset.syncHook='1';
    btn.addEventListener('click',()=>setTimeout(()=>{
      const result=document.getElementById('handoverResult');
      if(result&&/is now Former\./.test(result.textContent||'')) location.reload();
    },180));
  }
  window.addEventListener('load',()=>{setTimeout(install,650);setTimeout(install,1200)});
})();