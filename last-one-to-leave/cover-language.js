(()=>{
  const BOOKS={
    wind:{selector:'a.field-card[href="book/"]',covers:{en:'/assets/books/wind-beyond-walls/cover-en-v2.webp',zh:'/assets/books/wind-beyond-walls/cover-zh-v2.webp',fr:'/assets/books/wind-beyond-walls/cover-fr-v2.webp',es:'/assets/books/wind-beyond-walls/cover-es-v2.webp'},alts:{en:'The Wind Beyond the Walls cover',zh:'《庐外有风》封面',fr:'Couverture de Le Vent au-delà des murs',es:'Portada de El viento más allá de los muros'}},
    last:{selector:'a.field-card[href="last-one-to-leave/"]',covers:{en:'/last-one-to-leave/covers/cover-en.webp',zh:'/last-one-to-leave/covers/cover-zh.webp',fr:'/last-one-to-leave/covers/cover-fr.webp',es:'/last-one-to-leave/covers/cover-es.webp'},alts:{en:'The Last One to Leave cover',zh:'《最后一个下班的人》封面',fr:'Couverture de Le Dernier à partir',es:'Portada de El último en irse'}}
  };
  const LANGS=['en','zh','fr','es'];
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;if(LANGS.includes(direct))return direct;
    const select=document.querySelector('[data-runlu-language-select]');if(select&&LANGS.includes(select.value))return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(LANGS.includes(saved))return saved;}catch(error){}
    const html=(document.documentElement.lang||'').toLowerCase();if(html.startsWith('zh'))return'zh';if(html.startsWith('fr'))return'fr';if(html.startsWith('es'))return'es';return'en';
  }
  function ensureCover(key,book){
    const card=document.querySelector(book.selector);if(!card)return null;
    let img=card.querySelector(`[data-runlu-book-cover="${key}"]`);if(img)return img;
    if(key==='last'){img=card.querySelector('[data-runlu-novel-cover]');if(img){img.dataset.runluBookCover=key;return img;}}
    img=document.createElement('img');img.dataset.runluBookCover=key;img.width=400;img.height=600;img.loading='lazy';img.decoding='async';img.style.cssText='display:block;width:min(100%,240px);height:auto;margin:0 auto 1.15rem;border-radius:3px;box-shadow:0 14px 30px rgba(35,28,18,.14)';card.insertBefore(img,card.firstChild);return img;
  }
  function syncNovelProgress(lang){
    document.querySelectorAll('[data-en]').forEach(el=>{
      if(el.dataset.en==='Chapters 1–3 are now readable in all four site languages.'){
        el.dataset.en='Chapters 1–4 are now readable in all four site languages.';
        el.dataset.zh='第1—4章已经可以用网站四种语言直接阅读。';
        el.dataset.fr='Les chapitres 1 à 4 sont désormais lisibles dans les quatre langues du site.';
        el.dataset.es='Los capítulos 1–4 ya pueden leerse en los cuatro idiomas del sitio.';
        el.textContent=el.dataset[lang]||el.dataset.en;
      }
      if(el.dataset.en==='READ 01–03'){
        el.dataset.en='READ 01–04';el.dataset.zh='阅读 01—04';el.dataset.fr='LIRE 01–04';el.dataset.es='LEER 01–04';el.textContent=el.dataset[lang]||el.dataset.en;
      }
    });
  }
  function sync(){
    const lang=currentLanguage();
    Object.entries(BOOKS).forEach(([key,book])=>{const img=ensureCover(key,book);if(!img)return;const src=book.covers[lang]||book.covers.en;if(img.getAttribute('src')!==src)img.setAttribute('src',src);img.setAttribute('alt',book.alts[lang]||book.alts.en);});
    syncNovelProgress(lang);
  }
  sync();window.addEventListener('runlu:languagechange',sync);window.addEventListener('pageshow',sync);
})();