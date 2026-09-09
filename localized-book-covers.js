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
    }
  };

  function L(){
    const d=document.documentElement.dataset.runluLanguage;
    if(['en','zh','fr','es'].includes(d))return d;
    const s=document.querySelector('[data-runlu-language-select]');
    return s&&['en','zh','fr','es'].includes(s.value)?s.value:'en';
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
    const l=L();
    document.querySelectorAll('[data-runlu-cover]').forEach(i=>{
      const u=M[i.dataset.runluCover]?.[l];
      if(u)i.src=u;
    });
    updateNightSeriesCard(l);
  }

  S();
  addEventListener('runlu:languagechange',S);
  addEventListener('pageshow',S);
})();