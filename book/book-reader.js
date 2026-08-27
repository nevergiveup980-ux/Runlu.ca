(()=>{
  const article=document.getElementById('book-content');
  const template=document.getElementById('book-content-zh');
  if(!article)return;
  const key=document.body.dataset.bookKey;
  const source=document.body.dataset.bookSource||'template';
  const cache={};
  if(template)cache.zh=[...template.content.querySelectorAll('p')].map(p=>p.textContent);
  let request=0;
  const NAV={
    en:{next:'Next',her:'Her'},
    zh:{next:'下一章',her:'她'},
    fr:{next:'Suivant',her:'Elle'},
    es:{next:'Siguiente',her:'Ella'}
  };
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;
    if(NAV[direct])return direct;
    const html=(document.documentElement.lang||'').toLowerCase();
    if(html.startsWith('zh'))return 'zh';
    if(html.startsWith('fr'))return 'fr';
    if(html.startsWith('es'))return 'es';
    if(html.startsWith('en'))return 'en';
    const select=document.querySelector('[data-runlu-language-select]');
    if(select&&NAV[select.value])return select.value;
    try{
      const saved=localStorage.getItem('runlu_site_language');
      if(NAV[saved])return saved;
    }catch(error){}
    return 'en';
  }
  function syncNav(lang){
    if(key!=='07')return;
    const next=document.querySelector('.reader-nav .next');
    if(!next)return;
    const copy=NAV[lang]||NAV.en;
    next.href='chapter-08.html';
    const small=next.querySelector('small');
    const strong=next.querySelector('strong');
    if(small)small.textContent=copy.next;
    if(strong)strong.textContent=copy.her;
  }
  function render(lines){
    article.replaceChildren(...lines.map((text,i)=>{
      const p=document.createElement('p');
      p.textContent=text;
      if(i===0)p.className='first';
      return p;
    }));
  }
  async function get(lang){
    if(cache[lang])return cache[lang];
    if(source==='text'){
      const response=await fetch(`data/${key}-${lang}.txt`,{cache:'force-cache'});
      if(!response.ok)throw new Error(`text edition ${response.status}`);
      const text=await response.text();
      return cache[lang]=text.split(/\r?\n\s*\r?\n/).map(s=>s.trim()).filter(Boolean);
    }
    const response=await fetch(`data/${key}-${lang}.json`,{cache:'force-cache'});
    if(!response.ok)throw new Error(`translation ${response.status}`);
    return cache[lang]=await response.json();
  }
  async function sync(){
    const id=++request;
    const lang=currentLanguage();
    syncNav(lang);
    try{
      const lines=await get(lang);
      if(id===request)render(lines);
    }catch(error){
      console.warn('RUNLU Book translation fallback',error);
      try{
        const fallback=cache.zh||await get('zh');
        if(id===request)render(fallback);
      }catch(fallbackError){
        console.warn('RUNLU Book source fallback',fallbackError);
      }
    }
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();
