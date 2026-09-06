(()=>{
  const BOOKS={
    wind:{selector:'a.field-card[href="book/"]',covers:{en:'/assets/books/wind-beyond-walls/cover-en-v2.webp',zh:'/assets/books/wind-beyond-walls/cover-zh-v2.webp',fr:'/assets/books/wind-beyond-walls/cover-fr-v2.webp',es:'/assets/books/wind-beyond-walls/cover-es-v2.webp'},alts:{en:'The Wind Beyond the Walls cover',zh:'《庐外有风》封面',fr:'Couverture de Le Vent au-delà des murs',es:'Portada de El viento más allá de los muros'}},
    last:{selector:'a.field-card[href="last-one-to-leave/"]',covers:{en:'/last-one-to-leave/covers/cover-en.webp',zh:'/last-one-to-leave/covers/cover-zh.webp',fr:'/last-one-to-leave/covers/cover-fr.webp',es:'/last-one-to-leave/covers/cover-es.webp'},alts:{en:'The Last One to Leave cover',zh:'《最后一个下班的人》封面',fr:'Couverture de Le Dernier à partir',es:'Portada de El último en irse'}},
    night:{selector:'a.field-card[href="night-has-warmth/"]',covers:{en:'/night-has-warmth/cover-v2.webp',zh:'/night-has-warmth/cover-v2.webp',fr:'/night-has-warmth/cover-v2.webp',es:'/night-has-warmth/cover-v2.webp'},alts:{en:'Warmth in the Night cover',zh:'《夜色有温度》封面',fr:'Couverture de La chaleur de la nuit',es:'Portada de Calor en la noche'}},
    evidence:{selector:'a.field-card[href="evidence/"]',covers:{en:'/evidence/cover.svg?v=20260906-3',zh:'/evidence/cover.svg?v=20260906-3',fr:'/evidence/cover.svg?v=20260906-3',es:'/evidence/cover.svg?v=20260906-3'},alts:{en:'All the Evidence Was There cover',zh:'《错序：所有证据都在》封面',fr:'Couverture de Toutes les preuves étaient là',es:'Portada de Todas las pruebas estaban allí'}}
  };
  const LANGS=['en','zh','fr','es'];
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;if(LANGS.includes(direct))return direct;
    const select=document.querySelector('[data-runlu-language-select]');if(select&&LANGS.includes(select.value))return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(LANGS.includes(saved))return saved;}catch(error){}
    const html=(document.documentElement.lang||'').toLowerCase();if(html.startsWith('zh'))return'zh';if(html.startsWith('fr'))return'fr';if(html.startsWith('es'))return'es';return'en';
  }
  function ensureNightCard(lang){
    let card=document.querySelector(BOOKS.night.selector);if(card)return card;
    const last=document.querySelector(BOOKS.last.selector);if(!last)return null;
    card=document.createElement('a');card.className='field-card';card.href='night-has-warmth/';
    card.innerHTML='<img data-runlu-book-cover="night" src="/night-has-warmth/cover-v2.webp" alt="Warmth in the Night cover" width="400" height="600" loading="lazy" decoding="async" style="display:block;width:min(100%,240px);height:auto;margin:0 auto 1.15rem;border-radius:3px;box-shadow:0 14px 30px rgba(35,28,18,.14)"><span class="field-no" data-en="RUNLU ORIGINAL · NOVEL 03" data-zh="润庐原创 · 长篇 03" data-fr="ORIGINAL RUNLU · ROMAN 03" data-es="ORIGINAL RUNLU · NOVELA 03">RUNLU ORIGINAL · NOVEL 03</span><div class="copy-en"><h3>Warmth in the Night</h3><p>A quiet contemporary novel about marriage, desire, memory, and the distances that grow inside ordinary life.</p></div><div class="copy-zh"><h3>《夜色有温度》</h3><p>一部写婚姻、欲望、记忆，也写普通生活中那些悄然拉开距离的当代长篇。</p></div><div class="copy-fr"><h3>La chaleur de la nuit</h3><p>Un roman contemporain tout en retenue sur le mariage, le désir, la mémoire et les distances qui s’installent dans une vie ordinaire.</p></div><div class="copy-es"><h3>Calor en la noche</h3><p>Una novela contemporánea y contenida sobre el matrimonio, el deseo, la memoria y las distancias que crecen dentro de una vida corriente.</p></div><span class="field-meta" data-en="Volume I · Chapters 1–3 · Four-language preview →" data-zh="第一卷 · 第1—3章 · 四语试读 →" data-fr="Tome I · Chapitres 1–3 · Aperçu en quatre langues →" data-es="Volumen I · Capítulos 1–3 · Avance en cuatro idiomas →">Volume I · Chapters 1–3 · Four-language preview →</span>';
    last.insertAdjacentElement('afterend',card);
    card.querySelectorAll('[data-en]').forEach(el=>{el.textContent=el.dataset[lang]||el.dataset.en;});
    return card;
  }
  function syncShelfHeading(lang){
    document.querySelectorAll('[data-en]').forEach(el=>{
      if(['Two books on the RUNLU shelf.','Three books on the RUNLU shelf.','Four books on the RUNLU shelf.'].includes(el.dataset.en)){
        el.dataset.en='Four books on the RUNLU shelf.';
        el.dataset.zh='润庐书架上的四部长篇。';
        el.dataset.fr='Quatre livres dans la bibliothèque RUNLU.';
        el.dataset.es='Cuatro libros en la biblioteca RUNLU.';
        el.textContent=el.dataset[lang]||el.dataset.en;
      }
    });
  }
  function ensureCover(key,book){
    const card=document.querySelector(book.selector);if(!card)return null;
    let img=card.querySelector(`[data-runlu-book-cover="${key}"]`);if(img)return img;
    if(key==='last'){img=card.querySelector('[data-runlu-novel-cover]');if(img){img.dataset.runluBookCover=key;return img;}}
    if(key==='evidence'){img=card.querySelector('img');if(img){img.dataset.runluBookCover=key;return img;}}
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
    ensureNightCard(lang);syncShelfHeading(lang);
    Object.entries(BOOKS).forEach(([key,book])=>{const img=ensureCover(key,book);if(!img)return;const src=book.covers[lang]||book.covers.en;if(img.getAttribute('src')!==src)img.setAttribute('src',src);img.setAttribute('alt',book.alts[lang]||book.alts.en);});
    syncNovelProgress(lang);
  }
  sync();window.addEventListener('runlu:languagechange',sync);window.addEventListener('pageshow',sync);
})();