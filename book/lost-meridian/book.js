(()=>{
  const covers={
    en:'cover-flagship-en.svg?v=20260912-4',
    zh:'cover-flagship-zh.svg?v=20260912-4',
    fr:'cover-flagship-fr.svg?v=20260912-4',
    es:'cover-flagship-es.svg?v=20260912-4'
  };
  const titles={en:'The Lost Meridian | RUNLU',zh:'失落经纬 | RUNLU',fr:'Le Méridien Perdu | RUNLU',es:'El Meridiano Perdido | RUNLU'};
  const alts={en:'The Lost Meridian flagship cover',zh:'《失落经纬》镇庐之作封面',fr:'Couverture phare de Le Méridien Perdu',es:'Portada emblemática de El Meridiano Perdido'};
  function lang(){const d=document.documentElement.dataset.runluLanguage;return ['en','zh','fr','es'].includes(d)?d:'en'}
  function sync(){
    const l=lang(),img=document.getElementById('localized-cover');
    if(img){img.src=covers[l]||covers.en;img.alt=alts[l]||alts.en}
    document.title=titles[l]||titles.en;
    const og=document.querySelector('meta[property="og:image"]');
    if(og)og.content=`https://runlu.ca/book/lost-meridian/${(covers[l]||covers.en).split('?')[0]}`;
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();