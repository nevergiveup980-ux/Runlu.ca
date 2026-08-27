(()=>{
  const article=document.getElementById('book-content');
  const template=document.getElementById('book-content-zh');
  if(!article||!template)return;
  const key=document.body.dataset.bookKey;
  const cache={zh:[...template.content.querySelectorAll('p')].map(p=>p.textContent)};
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
      if(id===request)render(cache.zh);
    }
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
})();
