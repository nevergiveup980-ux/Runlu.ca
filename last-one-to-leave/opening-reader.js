(()=>{
  const root=document.getElementById('opening-content');
  if(!root)return;
  const supported=new Set(['en','zh','fr','es']);
  const cache={};
  let request=0;
  function currentLanguage(){
    const direct=document.documentElement.dataset.runluLanguage;
    if(supported.has(direct))return direct;
    const select=document.querySelector('[data-runlu-language-select]');
    if(select&&supported.has(select.value))return select.value;
    try{const saved=localStorage.getItem('runlu_site_language');if(supported.has(saved))return saved;}catch(error){}
    const html=(document.documentElement.lang||'').toLowerCase();
    if(html.startsWith('zh'))return 'zh';
    if(html.startsWith('fr'))return 'fr';
    if(html.startsWith('es'))return 'es';
    return 'en';
  }
  async function get(lang){
    if(cache[lang])return cache[lang];
    const response=await fetch(`data/opening-${lang}.txt`,{cache:'no-cache'});
    if(!response.ok)throw new Error(`opening edition ${response.status}`);
    return cache[lang]=await response.text();
  }
  function render(text){
    const blocks=text.split(/\r?\n\s*\r?\n/).map(v=>v.trim()).filter(Boolean);
    const frag=document.createDocumentFragment();
    for(const block of blocks){
      if(block.startsWith('## ')){
        const h=document.createElement('h2');h.textContent=block.slice(3);frag.appendChild(h);
      }else{
        const p=document.createElement('p');p.textContent=block;frag.appendChild(p);
      }
    }
    root.replaceChildren(frag);root.classList.remove('loading');
  }
  async function sync(){
    const id=++request;root.classList.add('loading');
    const lang=currentLanguage();
    try{const text=await get(lang);if(id===request)render(text);}catch(error){
      console.warn('RUNLU opening edition fallback',error);
      try{const text=await get('zh');if(id===request)render(text);}catch(fallback){console.warn(fallback);}
    }
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();
