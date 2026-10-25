/* RUNLU Growth Engine — lightweight, non-persistent event adapter.
 * Does not transmit, store or identify visitors. An analytics collector must
 * be separately reviewed/configured before events can be counted.
 */
(()=>{
  'use strict';
  const sources=new Set(['x','tiktok','instagram','facebook','newsletter']);
  const params=new URLSearchParams(location.search);
  const rawSource=(params.get('utm_source')||'').trim().toLowerCase();
  const rawCampaign=(params.get('utm_campaign')||'').trim().toLowerCase();
  const source=!rawSource?'unattributed':sources.has(rawSource)?rawSource:'other';
  const campaign=/^[a-z0-9_-]{1,64}$/.test(rawCampaign)?rawCampaign:'none';

  function emit(event,detail={}){
    const payload={event,book:'the_lost_meridian',source,campaign,...detail};
    window.dispatchEvent(new CustomEvent('runlu:growth',{detail:payload}));
    if(Array.isArray(window.dataLayer))window.dataLayer.push(payload);
  }

  emit('book_page_view');
  document.addEventListener('click',event=>{
    const target=event.target;
    const element=target instanceof Element?target:target?.parentElement;
    const link=element?.closest('a[href]');
    if(!link)return;
    let url;
    try{url=new URL(link.getAttribute('href'),location.href);}catch{return;}
    if(!['http:','https:'].includes(url.protocol))return;
    if(url.origin!==location.origin){
      emit('book_external_link_click');
    }else if(url.pathname==='/book/lost-meridian/reader.html'){
      const rawChapter=url.searchParams.get('ch')||'';
      const chapter=/^\\d{1,2}$/.test(rawChapter)?Number(rawChapter):null;
      emit('book_preview_click',{chapter:chapter!==null&&chapter>=1&&chapter<=10?chapter:null});
    }
  },{passive:true});
})();
