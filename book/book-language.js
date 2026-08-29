(()=>{
  const COVERS={
    en:'../assets/books/wind-beyond-walls/cover-en-v2.webp',
    zh:'../assets/books/wind-beyond-walls/cover-zh-v2.webp',
    fr:'../assets/books/wind-beyond-walls/cover-fr-v2.webp',
    es:'../assets/books/wind-beyond-walls/cover-es-v2.webp'
  };
  const ALT={en:'Cover of The Wind Beyond the Walls',zh:'《庐外有风》封面',fr:'Couverture de Le Vent au-delà des murs',es:'Portada de El viento más allá de los muros'};
  const CAPTION={en:'Cover · English',zh:'封面 · 中文',fr:'Couverture · Français',es:'Portada · Español'};
  const ACTION={en:'Begin reading',zh:'开始阅读',fr:'Commencer la lecture',es:'Empezar a leer'};
  const STATUS={en:'Prologue + Chapters 1–11 · EN / 中文 / FR / ES',zh:'序章 + 第一至第十一章 · 英 / 中 / 法 / 西四语',fr:'Prologue + chapitres 1 à 11 · EN / 中文 / FR / ES',es:'Prólogo + capítulos 1–11 · EN / 中文 / FR / ES'};
  const TITLE11={en:'Life Takes Shape',zh:'日子有了形状',fr:'Les jours prennent forme',es:'Los días adquieren forma'};

  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;if(COVERS[direct])return direct;
    const select=document.querySelector('[data-runlu-language-select]');if(select&&COVERS[select.value])return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(COVERS[saved])return saved;}catch(error){}
    const html=(document.documentElement.lang||'').toLowerCase();if(html.startsWith('zh'))return'zh';if(html.startsWith('fr'))return'fr';if(html.startsWith('es'))return'es';return'en';
  }

  function ensureCover(){
    const hero=document.querySelector('.book-hero');if(!hero)return null;
    let panel=hero.querySelector('.book-cover-panel');if(panel)return panel;
    panel=document.createElement('a');panel.className='book-cover-panel';panel.href='prologue.html';
    panel.innerHTML='<img class="book-cover-image" width="220" height="330" decoding="async" fetchpriority="high"><span class="book-cover-caption"></span>';
    const status=hero.querySelector('.book-status');hero.insertBefore(panel,status||null);
    if(!document.getElementById('book-cover-style')){
      const style=document.createElement('style');style.id='book-cover-style';style.textContent=`
        .book-cover-panel{display:block;max-width:240px;width:100%;text-decoration:none;justify-self:center;align-self:start}
        .book-cover-image{display:block;width:100%;height:auto;border:1px solid var(--line);box-shadow:0 18px 42px rgba(36,40,35,.12);background:var(--soft)}
        .book-cover-caption{display:block;margin-top:10px;text-align:center;color:var(--muted);font-size:11px;letter-spacing:.08em}
        @media(min-width:761px){.book-hero{grid-template-columns:minmax(0,1fr) minmax(190px,240px);gap:42px 58px;align-items:start}.book-hero>div:first-child{grid-column:1;grid-row:1 / span 2}.book-cover-panel{grid-column:2;grid-row:1}.book-status{grid-column:2;grid-row:2;margin-top:0}}
        @media(max-width:760px){.book-cover-panel{width:min(72vw,260px);margin:2px auto 6px}}
      `;document.head.appendChild(style);
    }
    return panel;
  }

  function ensureChapter11(){
    const list=document.querySelector('.chapter-list');if(!list||list.querySelector('a[href="chapter-11.html"]'))return;
    const a=document.createElement('a');a.className='chapter-item';a.href='chapter-11.html';
    a.innerHTML='<span class="chapter-no">11</span><span class="chapter-name" data-en="Life Takes Shape" data-es="Los días adquieren forma" data-fr="Les jours prennent forme" data-zh="日子有了形状">Life Takes Shape</span><span class="chapter-arrow">→</span>';
    list.appendChild(a);
  }

  function sync(){
    const lang=currentLanguage();
    document.querySelectorAll('[data-book-lang]').forEach(el=>{el.hidden=el.dataset.bookLang!==lang});
    ensureChapter11();
    const ch11=document.querySelector('a[href="chapter-11.html"] .chapter-name');if(ch11)ch11.textContent=TITLE11[lang];
    const status=document.querySelector('.book-status span');if(status)status.textContent=STATUS[lang];
    const panel=ensureCover();if(!panel)return;
    const image=panel.querySelector('.book-cover-image');const caption=panel.querySelector('.book-cover-caption');
    image.src=COVERS[lang];image.alt=ALT[lang];caption.textContent=CAPTION[lang];panel.setAttribute('aria-label',ACTION[lang]);
  }

  sync();window.addEventListener('runlu:languagechange',sync);window.addEventListener('pageshow',sync);
})();