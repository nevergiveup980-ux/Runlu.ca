(() => {
  'use strict';
  const kb=window.GUANSHI_KB,form=document.querySelector('[data-kb-form]'),list=document.querySelector('[data-kb-list]'),empty=document.querySelector('[data-kb-empty]'),count=document.querySelector('[data-kb-count]'),exportBtn=document.querySelector('[data-kb-export]'),importInput=document.querySelector('[data-kb-import]'),clearBtn=document.querySelector('[data-kb-clear]'),message=document.querySelector('[data-kb-message]');
  if(!kb||!form)return;
  const labels={
    en:{saved:'Saved locally.',deleted:'Deleted.',imported:'Imported local knowledge.',bad:'Could not import this file.',confirmDelete:'Delete this local knowledge note?',confirmClear:'Delete every local knowledge note stored in this browser?',cleared:'Local knowledge library cleared.',edit:'Edit',del:'Delete',share:'May be sent when matched',private:'Local only',notes:n=>`${n} local note${n===1?'':'s'}`},
    zh:{saved:'已保存到当前浏览器。',deleted:'已删除。',imported:'本地知识已经导入。',bad:'无法导入这个文件。',confirmDelete:'删除这条本地知识吗？',confirmClear:'删除当前浏览器中保存的全部本地知识吗？',cleared:'本地知识库已清空。',edit:'编辑',del:'删除',share:'匹配时允许发送',private:'仅本地保存',notes:n=>`本地知识 ${n} 条`},
    fr:{saved:'Enregistré localement.',deleted:'Supprimé.',imported:'Connaissances locales importées.',bad:'Impossible d’importer ce fichier.',confirmDelete:'Supprimer cette note locale ?',confirmClear:'Supprimer toutes les notes locales de ce navigateur ?',cleared:'Bibliothèque locale effacée.',edit:'Modifier',del:'Supprimer',share:'Peut être envoyé si pertinent',private:'Local uniquement',notes:n=>`${n} note${n===1?'':'s'} locale${n===1?'':'s'}`},
    es:{saved:'Guardado localmente.',deleted:'Eliminado.',imported:'Conocimiento local importado.',bad:'No se pudo importar el archivo.',confirmDelete:'¿Eliminar esta nota local?',confirmClear:'¿Eliminar todas las notas locales guardadas en este navegador?',cleared:'Biblioteca local vaciada.',edit:'Editar',del:'Eliminar',share:'Puede enviarse si coincide',private:'Solo local',notes:n=>`${n} nota${n===1?'':'s'} local${n===1?'':'es'}`}
  };
  const lang=()=>document.querySelector('[data-runlu-language-select]')?.value||localStorage.getItem('runlu_site_language')||'en',t=()=>labels[lang()]||labels.en,clean=v=>String(v??'').trim(),esc=s=>clean(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const msg=text=>{if(message){message.textContent=text;message.hidden=!text;}};
  const id=()=>`GS-LOCAL-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  function values(select){return [...select.selectedOptions].map(o=>o.value);}
  function render(){
    const items=kb.loadLocal(); if(count)count.textContent=t().notes(items.length); if(empty)empty.hidden=items.length>0;
    if(list)list.innerHTML=items.slice().reverse().map(x=>`<article class="kb-item" data-id="${esc(x.id)}"><div class="kb-top"><div><div class="kb-id">${esc(x.id)}</div><h3>${esc(x.title)}</h3></div><span class="kb-pill ${x.shareWithAnalysis?'share':'private'}">${esc(x.shareWithAnalysis?t().share:t().private)}</span></div><p>${esc(x.summary)}</p><div class="kb-meta"><span>${esc(x.kind)}</span><span>${esc(x.status)}</span><span>${esc((x.topics||[]).join(', '))}</span><span>${esc((x.methods||[]).join(', '))}</span>${x.tags?`<span>${esc(x.tags)}</span>`:''}</div><div class="kb-actions"><button type="button" data-edit="${esc(x.id)}">${esc(t().edit)}</button><button type="button" data-delete="${esc(x.id)}">${esc(t().del)}</button></div></article>`).join('');
  }
  function reset(){form.reset();form.elements.id.value='';form.elements.kind.value='reference';form.elements.topic.value='other';form.elements.method.value='general';form.elements.share_with_analysis.checked=false;msg('');}
  form.addEventListener('submit',e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form),existing=clean(d.get('id')),kind=clean(d.get('kind'))||'reference';
    kb.upsertLocal({id:existing||id(),title:clean(d.get('title')),summary:clean(d.get('summary')),tags:clean(d.get('tags')),topics:values(form.elements.topic),methods:values(form.elements.method),kind,status:kind==='traditional'?'Traditional':kind==='symbolic'?'Symbolic':'Exploratory',shareWithAnalysis:form.elements.share_with_analysis.checked,created_at:existing?(kb.loadLocal().find(x=>x.id===existing)?.created_at||new Date().toISOString()):new Date().toISOString(),updated_at:new Date().toISOString()});
    msg(t().saved);render();reset();msg(t().saved);
  });
  list?.addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
    if(edit){const x=kb.loadLocal().find(v=>v.id===edit.dataset.edit);if(!x)return;form.elements.id.value=x.id;form.elements.title.value=x.title;form.elements.summary.value=x.summary;form.elements.tags.value=x.tags||'';form.elements.kind.value=x.kind;[...form.elements.topic.options].forEach(o=>o.selected=(x.topics||[]).includes(o.value));[...form.elements.method.options].forEach(o=>o.selected=(x.methods||[]).includes(o.value));form.elements.share_with_analysis.checked=!!x.shareWithAnalysis;form.scrollIntoView({behavior:'smooth',block:'start'});msg('');}
    if(del&&confirm(t().confirmDelete)){kb.removeLocal(del.dataset.delete);msg(t().deleted);render();}
  });
  exportBtn?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:'runlu-guanshi-local-knowledge-v1',exported_at:new Date().toISOString(),items:kb.loadLocal()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`guanshi-local-knowledge-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);});
  importInput?.addEventListener('change',async()=>{const f=importInput.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text()),items=Array.isArray(data)?data:data.items;if(!Array.isArray(items))throw 0;kb.saveLocal(items);msg(t().imported);render();}catch{msg(t().bad);}finally{importInput.value='';}});
  clearBtn?.addEventListener('click',()=>{if(confirm(t().confirmClear)){kb.clearLocal();reset();msg(t().cleared);render();}});
  document.addEventListener('runlu:languagechange',render);document.querySelector('[data-runlu-language-select]')?.addEventListener('change',()=>setTimeout(render));
  render();
})();
