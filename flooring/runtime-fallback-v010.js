/* RUNLU Deerfoot Flooring OS · Runtime Fallback Shell V0.1.0
   Keeps navigation and basic page switching alive even if the main core script is delayed.
   The real app.js replaces/extends these globals when it arrives. */
(function(){
  'use strict';
  const FALLBACK_NAV=[
    ['command','Command'],['showroom','Showroom'],['estimate','Estimate'],['jobs','Jobs'],
    ['purchasing','PO'],['warehouse','Warehouse'],['invoice','Invoice'],['install','Install'],
    ['serviceclaims','Service / Claims'],['accounting','Accounting']
  ];

  function basicGo(id){
    const target=document.getElementById(id);
    if(!target)return false;
    document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
    document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));
    window.scrollTo({top:0,behavior:'smooth'});
    return true;
  }

  if(typeof window.go!=='function') window.go=basicGo;

  const nav=document.getElementById('nav');
  if(nav&&!nav.querySelector('button')){
    FALLBACK_NAV.filter(([id])=>document.getElementById(id)).forEach(([id,label])=>{
      const b=document.createElement('button');
      b.type='button';b.dataset.page=id;b.textContent=label;
      b.addEventListener('click',()=>window.go(id));
      if(id==='command')b.classList.add('active');
      nav.appendChild(b);
    });
  }

  window.__runluFallbackShellReady=true;
})();