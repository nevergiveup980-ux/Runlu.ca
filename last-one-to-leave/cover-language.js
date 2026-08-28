(()=>{
  const covers={
    en:'/last-one-to-leave/covers/cover-en.webp',
    zh:'/last-one-to-leave/covers/cover-zh.webp',
    fr:'/last-one-to-leave/covers/cover-fr.webp',
    es:'/last-one-to-leave/covers/cover-es.webp'
  };
  const alts={
    en:'The Last One to Leave cover',
    zh:'《最后一个下班的人》封面',
    fr:'Couverture de Le Dernier à partir',
    es:'Portada de El último en irse'
  };
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;
    if(covers[direct])return direct;
    const select=document.querySelector('[data-runlu-language-select]');
    if(select&&covers[select.value])return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(covers[saved])return saved;}catch(error){}
    const html=(document.documentElement.lang||'').toLowerCase();
    if(html.startsWith('zh'))return 'zh';
    if(html.startsWith('fr'))return 'fr';
    if(html.startsWith('es'))return 'es';
    return 'en';
  }
  function sync(){
    const lang=currentLanguage();
    document.querySelectorAll('[data-runlu-novel-cover]').forEach(img=>{
      if(img.getAttribute('src')!==covers[lang])img.setAttribute('src',covers[lang]);
      img.setAttribute('alt',alts[lang]);
    });
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();
