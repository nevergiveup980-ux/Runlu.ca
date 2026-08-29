(()=>{
 const root=document.getElementById('chapter-content');if(!root)return;
 const supported=new Set(['en','zh','fr','es']);const cache={};let request=0;
 function lang(){const d=document.documentElement.dataset.runluLanguage;if(supported.has(d))return d;const s=document.querySelector('[data-runlu-language-select]');if(s&&supported.has(s.value))return s.value;try{const v=localStorage.getItem('runlu_site_language');if(supported.has(v))return v}catch(e){}const h=(document.documentElement.lang||'').toLowerCase();if(h.startsWith('zh'))return'zh';if(h.startsWith('fr'))return'fr';if(h.startsWith('es'))return'es';return'en'}
 async function get(l){if(cache[l])return cache[l];const r=await fetch(`data/ch04-${l}.txt`,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);return cache[l]=await r.text()}
 function render(t){const f=document.createDocumentFragment();t.split(/\r?\n\s*\r?\n/).map(v=>v.trim()).filter(Boolean).forEach(b=>{const el=document.createElement(b.startsWith('## ')?'h2':'p');el.textContent=b.startsWith('## ')?b.slice(3):b;f.appendChild(el)});root.replaceChildren(f);root.classList.remove('loading')}
 async function sync(){const id=++request;root.classList.add('loading');try{const t=await get(lang());if(id===request)render(t)}catch(e){try{const t=await get('zh');if(id===request)render(t)}catch(_){}}}
 sync();window.addEventListener('runlu:languagechange',sync);window.addEventListener('pageshow',sync);
})();