/* RUNLU Growth Engine: privacy-conscious event adapter.
 * Emits custom browser events. If a compatible analytics dataLayer exists,
 * forwards the same non-personal event metadata there.
 * No cookies, localStorage, IP addresses, or raw query strings are collected.
 */
(()=>{
  'use strict';
  const allowedSources=new Set(['x','tiktok','instagram','facebook','newsletter','direct']);
  const params=new URLSearchParams(location.search);
  const source=(params.get('utm_source')||'direct').toLowerCase();
  const campaign=(params.get('utm_campaign')||'').toLowerCase();
  const safeSource=allowedSources.has(source)?source:'other';
  const safeCampaign=/^[a-z0-9_-]{1,64}$/.test(campaign)?campaign:'none';
  function emit(event,detail={}){
    const payload={event,book:'the_lost_meridian',source:safeSource,campaign:safeCampaign,...detail};
    window.dispatchEvent(new CustomEvent('runlu:growth',{detail:payload}));
    if(Array.isArray(window.dataLayer))window.dataLayer.push(payload);
  }
  emit('book_page_view');
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    if(!a)return;
    let url;
    try{url=new URL(a.getAttribute('href'),location.href);}catch{return;}
    if(url.origin!==location.origin){
      emit('book_external_link_click',{destination:'external'});
    }else if(url.pathname.endsWith('/book/lost-meridian/reader.html')||url.pathname.endsWith('/reader.html')){
      emit('book_preview_click',{chapter:/^\d{1,2}$/.test(url.searchParams.get('ch')||'')?Number(url.searchParams.get('ch')):null});
    }
  },{passive:true});
})();
