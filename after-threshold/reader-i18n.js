(()=>{
  const page=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  const pages=['prologue','chapter-01','chapter-02','chapter-03'];
  if(!pages.includes(page)) return;
  const article=document.querySelector('.reader-body');
  if(!article) return;
  const original=article.innerHTML;
  const languages=['en','zh','fr','es'];
  const BOOK={en:'After the Threshold',zh:'临界之后',fr:'Après le seuil',es:'Después del umbral'};
  const SUB={
    en:'After the Threshold · Published English edition',
    zh:'《临界之后》· RUNLU 网站中文译文',
    fr:'Après le seuil · Traduction française RUNLU',
    es:'Después del umbral · Traducción española de RUNLU'
  };
  const NOTE={
    en:'The text below is from the published English edition.',
    zh:'以下正文为 RUNLU 网站译文，依据已出版英文版翻译。',
    fr:'Le texte ci-dessous est la traduction RUNLU de l’édition anglaise publiée.',
    es:'El texto siguiente es la traducción de RUNLU de la edición inglesa publicada.'
  };
  const NAV={
    'prologue':{
      en:['After the Threshold','An Ordinary Friday'],zh:['临界之后','一个普通的星期五'],fr:['Après le seuil','Un vendredi ordinaire'],es:['Después del umbral','Un viernes cualquiera']
    },
    'chapter-01':{
      en:['Welcome to the AGI Era','The One Who Never Asks for a Raise'],zh:['欢迎来到AGI时代','那个从不要求加薪的人'],fr:["Bienvenue dans l’ère de l’AGI","Celui qui ne demande jamais d’augmentation"],es:['Bienvenidos a la era de la AGI','El que nunca pide un aumento']
    },
    'chapter-02':{
      en:['An Ordinary Friday','The Car Without a Driver'],zh:['一个普通的星期五','没有司机的汽车'],fr:['Un vendredi ordinaire','La voiture sans conducteur'],es:['Un viernes cualquiera','El coche sin conductor']
    },
    'chapter-03':{
      en:['The One Who Never Asks for a Raise','After the Threshold ↗'],zh:['那个从不要求加薪的人','临界之后 ↗'],fr:["Celui qui ne demande jamais d’augmentation",'Après le seuil ↗'],es:['El que nunca pide un aumento','Después del umbral ↗']
    }
  };
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;
    if(languages.includes(direct)) return direct;
    const select=document.querySelector('[data-runlu-language-select]');
    if(select&&languages.includes(select.value)) return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(languages.includes(saved))return saved;}catch(e){}
    return 'en';
  }
  function sync(){
    const lang=currentLanguage();
    const translated=window.RUNLU_AT_I18N?.[page]?.[lang];
    article.innerHTML=lang==='en'?original:(translated||original);
    article.setAttribute('lang',lang==='zh'?'zh-CN':lang);
    const sub=document.querySelector('.reader-sub'); if(sub) sub.textContent=SUB[lang];
    const note=document.querySelector('.original-note'); if(note) note.textContent=NOTE[lang];
    const strong=[...document.querySelectorAll('.reader-nav strong')];
    const nav=NAV[page]?.[lang]; if(nav){strong.forEach((el,i)=>{if(nav[i])el.textContent=nav[i]});}
    const h1=document.querySelector('.reader h1'); if(h1) document.title=`${h1.textContent} | ${BOOK[lang]} | RUNLU`;
  }
  window.addEventListener('runlu:languagechange',()=>queueMicrotask(sync));
  window.addEventListener('pageshow',sync);
  const data=document.createElement('script');
  data.src=`/after-threshold/i18n/${page}.js?v=20260907-1`;
  data.onload=sync;
  data.onerror=sync;
  document.head.appendChild(data);
  sync();
})();
