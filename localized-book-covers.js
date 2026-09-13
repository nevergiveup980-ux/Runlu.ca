(()=>{
  const M={
    threshold:{
      en:'/after-threshold/att-cover-web-v3.webp?v=20260907-2',
      zh:'/after-threshold/cover-zh.webp?v=20260907-2',
      fr:'/after-threshold/cover-fr.webp?v=20260907-2',
      es:'/after-threshold/cover-es.webp?v=20260907-2'
    },
    evidence:{
      en:'/evidence/cover-apple.jpg?v=20260907-2',
      zh:'/evidence/cover-zh.webp?v=20260907-2',
      fr:'/evidence/cover-fr.webp?v=20260907-2',
      es:'/evidence/cover-es.webp?v=20260907-2'
    },
    lost:{
      en:'/book/lost-meridian/cover-flagship.jpg?v=20260912-flagship',
      zh:'/book/lost-meridian/cover-flagship.jpg?v=20260912-flagship',
      fr:'/book/lost-meridian/cover-flagship.jpg?v=20260912-flagship',
      es:'/book/lost-meridian/cover-flagship.jpg?v=20260912-flagship'
    },
    yaqu:{
      en:'/book/luzhong-yaqu/cover-en.svg?v=20260912-2',
      zh:'/book/luzhong-yaqu/cover-zh.svg?v=20260912-2',
      fr:'/book/luzhong-yaqu/cover-fr.svg?v=20260912-2',
      es:'/book/luzhong-yaqu/cover-es.svg?v=20260912-2'
    },
    tomorrow:{
      en:'/book/tomorrow-protocol/cover-en.svg?v=20260912-2',
      zh:'/book/tomorrow-protocol/cover-zh.svg?v=20260912-2',
      fr:'/book/tomorrow-protocol/cover-fr.svg?v=20260912-2',
      es:'/book/tomorrow-protocol/cover-es.svg?v=20260912-2'
    }
  };

  function L(){
    const d=document.documentElement.dataset.runluLanguage;
    if(['en','zh','fr','es'].includes(d))return d;
    const s=document.querySelector('[data-runlu-language-select]');
    return s&&['en','zh','fr','es'].includes(s.value)?s.value:'en';
  }

  function applyText(root,lang){
    if(!root)return;
    root.querySelectorAll('[data-en]').forEach(el=>{
      const v=el.dataset[lang]||el.dataset.en;
      if(v)el.textContent=v;
    });
  }

  function upgradeBookshelf(){
    const section=document.querySelector('section[aria-label="RUNLU Original Books"]');
    const grid=section?.querySelector('.field-grid');
    if(!section||!grid)return;

    const heading=section.querySelector('.field-index-head h2');
    if(heading){
      heading.dataset.en='The RUNLU shelf keeps growing.';
      heading.dataset.zh='润庐书架，还在生长。';
      heading.dataset.fr='La bibliothèque RUNLU continue de grandir.';
      heading.dataset.es='La biblioteca RUNLU sigue creciendo.';
    }

    if(!grid.querySelector('a[href="book/lost-meridian/"]')){
      grid.insertAdjacentHTML('afterbegin',`
<a class="field-card" href="book/lost-meridian/" data-runlu-new-book="lost">
  <img data-runlu-cover="lost" src="/book/lost-meridian/cover-flagship.jpg?v=20260912-flagship" alt="The Lost Meridian flagship cover" width="400" height="600" loading="lazy" decoding="async" style="display:block;width:min(100%,240px);height:auto;margin:0 auto 1.15rem;border-radius:3px;box-shadow:0 18px 38px rgba(4,15,24,.28)">
  <span class="field-no" data-en="RUNLU FLAGSHIP WORK" data-zh="RUNLU · 镇庐之作" data-fr="ŒUVRE PHARE RUNLU" data-es="OBRA EMBLEMÁTICA RUNLU">RUNLU FLAGSHIP WORK</span>
  <div class="copy-en"><h3>The Lost Meridian</h3><p>A long-form adventure mystery of lost coordinates, buried baselines and competing versions of geographic truth.</p></div>
  <div class="copy-zh"><h3>《失落经纬》</h3><p>一部长篇冒险悬疑：失落坐标、地下基线，以及彼此争夺的“地理真相”。</p></div>
  <div class="copy-fr"><h3>Le Méridien Perdu</h3><p>Une grande aventure mystérieuse faite de coordonnées perdues, de lignes de base enfouies et de vérités géographiques concurrentes.</p></div>
  <div class="copy-es"><h3>El Meridiano Perdido</h3><p>Una gran aventura de misterio sobre coordenadas perdidas, líneas base enterradas y verdades geográficas enfrentadas.</p></div>
  <span class="field-meta" data-en="Nearing completion · Four-language preview · Chapters 1–10 →" data-zh="即将完稿 · 四语试读 · 第1—10章 →" data-fr="Presque achevé · Aperçu en quatre langues · Chapitres 1–10 →" data-es="Cerca de completarse · Vista previa en cuatro idiomas · Capítulos 1–10 →">Nearing completion · Four-language preview · Chapters 1–10 →</span>
</a>
<a class="field-card" href="book/luzhong-yaqu/" data-runlu-new-book="yaqu">
  <img data-runlu-cover="yaqu" src="/book/luzhong-yaqu/cover-en.svg?v=20260912-2" alt="Within the Hut: Quiet Elegance cover" width="400" height="600" loading="lazy" decoding="async" style="display:block;width:min(100%,240px);height:auto;margin:0 auto 1.15rem;border-radius:3px;box-shadow:0 14px 30px rgba(35,28,18,.14)">
  <span class="field-no" data-en="RUNLU ORIGINAL · COMPLETED" data-zh="润庐原创 · 已完稿" data-fr="ORIGINAL RUNLU · ACHEVÉ" data-es="ORIGINAL RUNLU · TERMINADO">RUNLU ORIGINAL · COMPLETED</span>
  <div class="copy-en"><h3>Within the Hut: Quiet Elegance</h3><p>A human meets AI, an idea becomes a place, and ordinary days gradually grow into the digital world called RUNLU.</p></div>
  <div class="copy-zh"><h3>《庐中雅趣》</h3><p>人与 AI 相遇，一个念头慢慢长成一方所在；平凡日子里，RUNLU 一点一点成为真实。</p></div>
  <div class="copy-fr"><h3>Dans la demeure : élégance tranquille</h3><p>Un humain rencontre l’IA, une idée devient un lieu, et le quotidien fait peu à peu naître le monde numérique appelé RUNLU.</p></div>
  <div class="copy-es"><h3>En la morada: elegancia serena</h3><p>Una persona se encuentra con la IA, una idea se convierte en un lugar y los días comunes van dando forma al mundo digital llamado RUNLU.</p></div>
  <span class="field-meta" data-en="Completed · Four-language preview · Chapters 1–10 →" data-zh="已完稿 · 四语试读 · 第1—10章 →" data-fr="Achevé · Aperçu en quatre langues · Chapitres 1–10 →" data-es="Terminado · Vista previa en cuatro idiomas · Capítulos 1–10 →">Completed · Four-language preview · Chapters 1–10 →</span>
</a>
<a class="field-card" href="book/tomorrow-protocol/" data-runlu-new-book="tomorrow">
  <img data-runlu-cover="tomorrow" src="/book/tomorrow-protocol/cover-en.svg?v=20260912-2" alt="The Tomorrow Protocol series cover" width="400" height="600" loading="lazy" decoding="async" style="display:block;width:min(100%,240px);height:auto;margin:0 auto 1.15rem;border-radius:3px;box-shadow:0 14px 30px rgba(17,24,44,.2)">
  <span class="field-no" data-en="RUNLU ORIGINAL · 14-VOLUME SERIES" data-zh="润庐原创 · 14卷系列" data-fr="ORIGINAL RUNLU · SÉRIE EN 14 VOLUMES" data-es="ORIGINAL RUNLU · SERIE DE 14 VOLÚMENES">RUNLU ORIGINAL · 14-VOLUME SERIES</span>
  <div class="copy-en"><h3>The Tomorrow Protocol</h3><p>A completed fourteen-volume near-future series about prediction, choice, responsibility and what happens when tomorrow begins speaking first.</p></div>
  <div class="copy-zh"><h3>《明日协议》</h3><p>一套已经完成的14卷近未来系列：预测、选择、责任，以及当“明天”开始先开口之后，人该如何决定。</p></div>
  <div class="copy-fr"><h3>Le Protocole de demain</h3><p>Une série d’anticipation achevée en quatorze volumes sur la prédiction, le choix, la responsabilité et le jour où demain commence à parler le premier.</p></div>
  <div class="copy-es"><h3>El Protocolo del Mañana</h3><p>Una serie de futuro cercano completa en catorce volúmenes sobre predicción, elección, responsabilidad y qué ocurre cuando el mañana habla primero.</p></div>
  <span class="field-meta" data-en="Completed · 14 volumes · Four-language preview →" data-zh="已完成 · 14卷 · 四语试读 →" data-fr="Achevé · 14 volumes · Aperçu en quatre langues →" data-es="Terminado · 14 volúmenes · Vista previa en cuatro idiomas →">Completed · 14 volumes · Four-language preview →</span>
</a>`);
    }

    applyText(section,L());
  }

  function updateNightSeriesCard(lang){
    const card=document.querySelector('a.field-card[href="night-has-warmth/"]');
    if(!card)return;

    const copy={
      en:'A complete five-volume literary romance about intimacy, freedom, memory, care, and choosing to return without possession.',
      zh:'一部已经完结的五卷长篇：写亲密、自由、记忆、照护，也写不以占有为前提的一次次重新选择。',
      fr:'Une romance littéraire complète en cinq tomes sur l’intimité, la liberté, la mémoire, le soin et le choix de revenir sans possession.',
      es:'Una novela romántica literaria completa en cinco volúmenes sobre la intimidad, la libertad, la memoria, el cuidado y la elección de volver sin posesión.'
    };
    const meta={
      en:'Complete five-volume series · Four-language opening preview →',
      zh:'五卷完结 · 四语开篇试读 →',
      fr:'Série complète en cinq tomes · Aperçu d’ouverture en quatre langues →',
      es:'Serie completa de cinco volúmenes · Avance inicial en cuatro idiomas →'
    };

    Object.entries(copy).forEach(([key,text])=>{
      const p=card.querySelector(`.copy-${key} p`);
      if(p)p.textContent=text;
    });

    const m=card.querySelector('.field-meta');
    if(m){
      Object.entries(meta).forEach(([key,text])=>m.dataset[key]=text);
      m.textContent=meta[lang]||meta.en;
    }
  }

  function S(){
    upgradeBookshelf();
    const l=L();
    document.querySelectorAll('[data-runlu-cover]').forEach(i=>{
      const u=M[i.dataset.runluCover]?.[l];
      if(u)i.src=u;
    });
    updateNightSeriesCard(l);
    applyText(document.querySelector('section[aria-label="RUNLU Original Books"]'),l);
  }

  S();
  addEventListener('runlu:languagechange',S);
  addEventListener('pageshow',S);
})();