(()=>{
  const article=document.getElementById('book-content');
  const template=document.getElementById('book-content-zh');
  if(!article)return;
  const key=document.body.dataset.bookKey;
  const source=document.body.dataset.bookSource||'template';
  const cache={};
  if(template)cache.zh=[...template.content.querySelectorAll('p')].map(p=>p.textContent);
  let request=0;
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
    const lang=document.documentElement.dataset.runluLanguage||'en';
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
})();
