(()=>{
  const titles={en:'The Lost Meridian | RUNLU',zh:'失落经纬 | RUNLU',fr:'Le Méridien Perdu | RUNLU',es:'El Meridiano Perdido | RUNLU'};
  const alts={en:'The Lost Meridian flagship cover',zh:'《失落经纬》镇庐之作封面',fr:'Couverture phare de Le Méridien Perdu',es:'Portada emblemática de El Meridiano Perdido'};

  function lang(){
    const d=document.documentElement.dataset.runluLanguage;
    if(['en','zh','fr','es'].includes(d)) return d;
    const s=document.querySelector('[data-runlu-language-select]');
    return s&&['en','zh','fr','es'].includes(s.value)?s.value:'en';
  }

  function coverData(l){
    const chunks=window.RUNLU_LOST_COVER_CHUNKS?.[l];
    return Array.isArray(chunks)&&chunks.length>=2&&chunks.every(Boolean)
      ? 'data:image/avif;base64,'+chunks.join('')
      : null;
  }

  function sync(){
    const l=lang();
    const img=document.getElementById('localized-cover');
    const src=coverData(l);
    if(img&&src){
      img.src=src;
      img.alt=alts[l]||alts.en;
    }
    document.title=titles[l]||titles.en;
  }

  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();
