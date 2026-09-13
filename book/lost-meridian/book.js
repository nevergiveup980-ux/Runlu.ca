(()=>{
  const titles={en:'The Lost Meridian | RUNLU',zh:'失落经纬 | RUNLU',fr:'Le Méridien Perdu | RUNLU',es:'El Meridiano Perdido | RUNLU'};
  const alts={en:'The Lost Meridian flagship cover',zh:'《失落经纬》镇庐之作封面',fr:'Couverture phare de Le Méridien Perdu',es:'Portada emblemática de El Meridiano Perdido'};
  const langs=['en','zh','fr','es'];
  let loadPromise=null;

  function lang(){
    const d=document.documentElement.dataset.runluLanguage;
    if(langs.includes(d)) return d;
    const s=document.querySelector('[data-runlu-language-select]');
    return s&&langs.includes(s.value)?s.value:'en';
  }
  function coverData(l){
    const chunks=window.RUNLU_LOST_COVER_CHUNKS?.[l];
    return Array.isArray(chunks)&&chunks.length>=2&&chunks.every(Boolean)
      ? 'data:image/avif;base64,'+chunks.join('')
      : null;
  }
  function loadOne(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }
  function ensureCovers(){
    if(langs.every(l=>coverData(l)))return Promise.resolve();
    if(loadPromise)return loadPromise;
    const v='20260912-final1';
    loadPromise=Promise.all(langs.flatMap(l=>[1,2].map(n=>loadOne(`cover-chunks-${l}-${n}.js?v=${v}`)))).then(()=>undefined);
    return loadPromise;
  }
  function sync(){
    const l=lang();
    const img=document.getElementById('localized-cover');
    const src=coverData(l);
    if(img&&src){img.src=src;img.alt=alts[l]||alts.en;}
    document.title=titles[l]||titles.en;
  }
  function boot(){
    sync();
    ensureCovers().then(sync).catch(err=>console.warn('Lost Meridian covers could not load',err));
  }
  boot();
  window.addEventListener('runlu:languagechange',()=>{sync();ensureCovers().then(sync).catch(()=>{});});
  window.addEventListener('pageshow',boot);
})();
