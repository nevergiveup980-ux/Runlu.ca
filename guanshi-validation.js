(() => {
  const STORAGE_KEY = 'runlu_guanshi_validation_cases_v1';
  const LAST_KEY = 'runlu_guanshi_last_consultation';
  const freezeForm = document.querySelector('[data-freeze-form]');
  const reviewForm = document.querySelector('[data-review-form]');
  const caseList = document.querySelector('[data-case-list]');
  const emptyState = document.querySelector('[data-empty-cases]');
  const reviewCase = document.querySelector('#review-case');
  const metricsBox = document.querySelector('[data-metrics]');
  const exportBtn = document.querySelector('[data-export]');
  const importInput = document.querySelector('[data-import]');
  const typeSelect = document.querySelector('#case-type');
  const binaryOnly = [...document.querySelectorAll('[data-binary-only]')];
  const reviewBinary = [...document.querySelectorAll('[data-review-binary]')];

  const labels = {
    en:{frozen:'Frozen',reviews:'reviews',reviewDue:'Review',confidence:'Confidence',prediction:'Prediction',yes:'Yes',no:'No',decision:'Decision',integrity:'Integrity',ok:'OK',changed:'Changed',original:'Original judgment',source:'Source consultation',review:'Review',actual:'Actual outcome',brier:'Brier score',weight:'Weight',none:'No reviewed binary cases yet.',cases:'Frozen cases',final:'Final reviews',binary:'Reviewed binary forecasts',accuracy:'Directional accuracy',meanBrier:'Mean Brier score',saved:'Case frozen locally.',reviewSaved:'Review appended.',imported:'Cases imported.',badImport:'Could not import this file.',confirmImport:'Importing replaces the current local validation ledger. Continue?',confirmReset:'This clears the freeze form only; frozen cases stay saved.'},
    zh:{frozen:'已冻结',reviews:'次复盘',reviewDue:'复盘日',confidence:'置信度',prediction:'预测',yes:'会 / 发生',no:'不会 / 不发生',decision:'决策判断',integrity:'完整性',ok:'正常',changed:'已改变',original:'原始判断',source:'原始咨询',review:'复盘',actual:'实际结果',brier:'Brier 分数',weight:'权重',none:'还没有完成复盘的二元预测。',cases:'冻结案例',final:'最终复盘',binary:'已复盘二元预测',accuracy:'方向命中率',meanBrier:'平均 Brier 分数',saved:'案例已在本地冻结。',reviewSaved:'复盘已经追加。',imported:'案例已导入。',badImport:'无法导入这个文件。',confirmImport:'导入会替换当前浏览器里的验证账本。继续吗？',confirmReset:'这里只清空录入表单，不会删除已冻结案例。'},
    fr:{frozen:'Figé',reviews:'révisions',reviewDue:'Révision',confidence:'Confiance',prediction:'Prévision',yes:'Oui',no:'Non',decision:'Décision',integrity:'Intégrité',ok:'OK',changed:'Modifié',original:'Jugement original',source:'Consultation source',review:'Révision',actual:'Résultat réel',brier:'Score de Brier',weight:'Poids',none:'Aucune prévision binaire révisée.',cases:'Cas figés',final:'Révisions finales',binary:'Prévisions binaires révisées',accuracy:'Précision directionnelle',meanBrier:'Score de Brier moyen',saved:'Cas figé localement.',reviewSaved:'Révision ajoutée.',imported:'Cas importés.',badImport:'Impossible d’importer ce fichier.',confirmImport:'L’import remplacera le registre local actuel. Continuer ?',confirmReset:'Seul le formulaire sera effacé.'},
    es:{frozen:'Congelado',reviews:'revisiones',reviewDue:'Revisión',confidence:'Confianza',prediction:'Predicción',yes:'Sí',no:'No',decision:'Decisión',integrity:'Integridad',ok:'OK',changed:'Modificado',original:'Juicio original',source:'Consulta fuente',review:'Revisión',actual:'Resultado real',brier:'Puntuación Brier',weight:'Peso',none:'Aún no hay pronósticos binarios revisados.',cases:'Casos congelados',final:'Revisiones finales',binary:'Pronósticos binarios revisados',accuracy:'Precisión direccional',meanBrier:'Puntuación Brier media',saved:'Caso congelado localmente.',reviewSaved:'Revisión añadida.',imported:'Casos importados.',badImport:'No se pudo importar este archivo.',confirmImport:'La importación reemplazará el registro local actual. ¿Continuar?',confirmReset:'Solo se limpia el formulario.'}
  };

  const lang = () => document.querySelector('[data-runlu-language-select]')?.value || localStorage.getItem('runlu_site_language') || 'en';
  const t = () => labels[lang()] || labels.en;
  const clean = v => String(v ?? '').trim();
  const load = () => { try { const x = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } };
  const save = cases => localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  const esc = s => clean(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const dateText = iso => { if(!iso) return ''; const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(lang()==='zh'?'zh-CN':lang(), iso.length === 10 ? {dateStyle:'medium'} : {dateStyle:'medium',timeStyle:'short'}); };

  async function sha256(text){
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function canonicalOriginal(o){
    return JSON.stringify({id:o.id,created_at:o.created_at,route:o.route,type:o.type,question:o.question,claim:o.claim,predicted_outcome:o.predicted_outcome,confidence:o.confidence,review_date:o.review_date,stakes:o.stakes,recommendation:o.recommendation,reasons:o.reasons,counterargument:o.counterargument,falsifier:o.falsifier,source_consultation:o.source_consultation});
  }
  function caseId(){
    const d = new Date(), pad=n=>String(n).padStart(2,'0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const rand = Math.random().toString(36).slice(2,7).toUpperCase();
    return `GS-${stamp}-${rand}`;
  }
  function brierFor(c, review){
    if(c.type!=='binary' || !['yes','no'].includes(review.actual_outcome)) return null;
    const conf = Math.min(99, Math.max(50, Number(c.confidence)||50))/100;
    const pYes = c.predicted_outcome === 'yes' ? conf : 1-conf;
    const y = review.actual_outcome === 'yes' ? 1 : 0;
    return (pYes-y)**2;
  }

  function toggleType(){
    const binary = typeSelect?.value === 'binary';
    binaryOnly.forEach(el=>el.classList.toggle('hidden',!binary));
  }
  function toggleReviewType(){
    const c = load().find(x=>x.id===reviewCase?.value);
    reviewBinary.forEach(el=>el.classList.toggle('hidden',c?.type!=='binary'));
  }

  function prefillFromLast(){
    try{
      const raw = sessionStorage.getItem(LAST_KEY); if(!raw) return;
      const last = JSON.parse(raw); if(!last || typeof last!=='object') return;
      const q = document.querySelector('#case-question');
      const src = document.querySelector('#source-consultation');
      const route = document.querySelector('#case-route');
      if(q && !q.value) q.value = clean(last.question);
      if(src && !src.value) src.value = clean(last.full_text);
      if(route && ['general','traditional'].includes(last.mode)) route.value = last.mode;
    }catch{}
  }

  async function render(){
    const cases = load();
    if(emptyState) emptyState.hidden = cases.length>0;
    if(caseList){
      const blocks = await Promise.all(cases.slice().reverse().map(async c=>{
        const current = await sha256(canonicalOriginal(c));
        const ok = current === c.fingerprint;
        const finalReviews = (c.reviews||[]).filter(r=>r.status==='final').length;
        const prediction = c.type==='binary' ? `${t().prediction}: ${c.predicted_outcome==='yes'?t().yes:t().no}` : t().decision;
        const reviews = (c.reviews||[]).map(r=>{
          const b = brierFor(c,r);
          return `<div class="review-entry"><b>${esc(t().review)} · ${esc(dateText(r.created_at))}</b><div>${esc(t().actual)}: ${esc(r.actual_outcome||r.actual_action||'—')}</div>${r.actual_action?`<div>${esc(r.actual_action)}</div>`:''}${r.right?`<div>✓ ${esc(r.right)}</div>`:''}${r.wrong?`<div>✕ ${esc(r.wrong)}</div>`:''}${r.surprise?`<div>↯ ${esc(r.surprise)}</div>`:''}${b!==null?`<div>${esc(t().brier)}: ${b.toFixed(3)}</div>`:''}<div>${esc(t().weight)}: ${esc(r.weight_change)}</div></div>`;
        }).join('');
        return `<article class="case-item"><div class="case-top"><div><div class="case-id">${esc(c.id)}</div><h3>${esc(c.question)}</h3></div><span class="pill">${esc(t().frozen)}</span></div><div class="case-meta"><span class="pill">${esc(prediction)}</span><span class="pill">${esc(t().confidence)} ${Number(c.confidence)}%</span><span class="pill">${esc(t().reviewDue)} ${esc(dateText(c.review_date))}</span><span class="pill">${(c.reviews||[]).length} ${esc(t().reviews)}</span>${finalReviews?`<span class="pill">${finalReviews} ${esc(t().final)}</span>`:''}</div><p class="case-claim">${esc(c.claim)}</p><details class="case-details"><summary>${esc(t().original)}</summary>${c.recommendation?`<p><b>Action:</b> ${esc(c.recommendation)}</p>`:''}${c.reasons?`<p><b>Reasons:</b> ${esc(c.reasons)}</p>`:''}${c.counterargument?`<p><b>Counter:</b> ${esc(c.counterargument)}</p>`:''}${c.falsifier?`<p><b>Falsifier:</b> ${esc(c.falsifier)}</p>`:''}${c.source_consultation?`<details><summary>${esc(t().source)}</summary><pre>${esc(c.source_consultation)}</pre></details>`:''}<p class="fingerprint ${ok?'integrity-ok':'integrity-warn'}">${esc(t().integrity)}: ${ok?esc(t().ok):esc(t().changed)} · ${esc(c.fingerprint)}</p></details>${reviews}</article>`;
      }));
      caseList.innerHTML = blocks.join('');
    }
    if(reviewCase){
      const keep = reviewCase.value;
      reviewCase.innerHTML = cases.map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.question.slice(0,70))}</option>`).join('');
      if(cases.some(c=>c.id===keep)) reviewCase.value=keep;
      toggleReviewType();
    }
    renderMetrics(cases);
  }

  function renderMetrics(cases){
    if(!metricsBox) return;
    const finals = cases.flatMap(c=>(c.reviews||[]).filter(r=>r.status==='final').map(r=>({c,r})));
    const binary = finals.filter(({c,r})=>c.type==='binary'&&['yes','no'].includes(r.actual_outcome));
    const correct = binary.filter(({c,r})=>c.predicted_outcome===r.actual_outcome).length;
    const meanBrier = binary.length ? binary.reduce((a,{c,r})=>a+brierFor(c,r),0)/binary.length : null;
    metricsBox.innerHTML = [
      `<div class="metric"><b>${cases.length}</b><span>${esc(t().cases)}</span></div>`,
      `<div class="metric"><b>${finals.length}</b><span>${esc(t().final)}</span></div>`,
      `<div class="metric"><b>${binary.length}</b><span>${esc(t().binary)}</span></div>`,
      `<div class="metric"><b>${binary.length?`${Math.round(correct/binary.length*100)}%`:'—'}</b><span>${esc(t().accuracy)}</span></div>`,
      `<div class="metric"><b>${meanBrier===null?'—':meanBrier.toFixed(3)}</b><span>${esc(t().meanBrier)}</span></div>`
    ].join('');
  }

  freezeForm?.addEventListener('submit', async e=>{
    e.preventDefault(); if(!freezeForm.reportValidity()) return;
    const d = new FormData(freezeForm);
    const original = {
      id: caseId(), created_at:new Date().toISOString(), route:clean(d.get('route')), type:clean(d.get('type')),
      question:clean(d.get('question')), claim:clean(d.get('claim')), predicted_outcome:clean(d.get('type'))==='binary'?clean(d.get('predicted_outcome')):'',
      confidence:Number(d.get('confidence')), review_date:clean(d.get('review_date')), stakes:clean(d.get('stakes')),
      recommendation:clean(d.get('recommendation')), reasons:clean(d.get('reasons')), counterargument:clean(d.get('counterargument')), falsifier:clean(d.get('falsifier')), source_consultation:clean(d.get('source_consultation')),
      reviews:[]
    };
    original.fingerprint = await sha256(canonicalOriginal(original));
    const cases=load(); cases.push(original); save(cases); await render();
    alert(t().saved); freezeForm.reset(); toggleType(); prefillFromLast();
  });

  reviewForm?.addEventListener('submit', async e=>{
    e.preventDefault(); if(!reviewForm.reportValidity()) return;
    const d=new FormData(reviewForm), cases=load(), idx=cases.findIndex(c=>c.id===clean(d.get('case_id'))); if(idx<0) return;
    const review={created_at:new Date().toISOString(),status:clean(d.get('status')),actual_outcome:cases[idx].type==='binary'?clean(d.get('actual_outcome')):'',actual_action:clean(d.get('actual_action')),right:clean(d.get('right')),wrong:clean(d.get('wrong')),surprise:clean(d.get('surprise')),weight_change:clean(d.get('weight_change'))};
    cases[idx].reviews = [...(cases[idx].reviews||[]), review]; save(cases); await render(); alert(t().reviewSaved); reviewForm.reset(); toggleReviewType();
  });

  exportBtn?.addEventListener('click',()=>{
    const payload={format:'RUNLU-GUANSHI-VALIDATION-V1',exported_at:new Date().toISOString(),cases:load()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=`runlu-guanshi-validation-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });

  importInput?.addEventListener('change', async()=>{
    const file=importInput.files?.[0]; if(!file) return;
    try{
      const obj=JSON.parse(await file.text()); if(obj?.format!=='RUNLU-GUANSHI-VALIDATION-V1'||!Array.isArray(obj.cases)) throw new Error('bad');
      if(!confirm(t().confirmImport)) return;
      save(obj.cases); await render(); alert(t().imported);
    }catch{alert(t().badImport);} finally{importInput.value='';}
  });

  typeSelect?.addEventListener('change',toggleType);
  reviewCase?.addEventListener('change',toggleReviewType);
  document.querySelector('[data-runlu-language-select]')?.addEventListener('change',()=>setTimeout(render,0));
  toggleType(); prefillFromLast(); render();
})();
