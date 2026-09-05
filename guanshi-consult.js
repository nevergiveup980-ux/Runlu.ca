(() => {
  const form = document.querySelector('[data-guanshi-consult-form]');
  if (!form) return;

  const output = document.querySelector('[data-consult-output]');
  const pre = document.querySelector('[data-consult-summary]');
  const copyBtn = document.querySelector('[data-copy-summary]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const outputTitle = output?.querySelector('h3');
  const privacyNote = document.querySelector('.privacy-note');
  const mode = document.body.dataset.consultMode || 'general';
  const pageOpenedAt = Date.now();

  const AI = Object.freeze({
    endpoint: 'https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-guanshi-ai',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImVrcm5rbmxhd2VrZW9zenprYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTkxNTMsImV4cCI6MjEwMDE3NTE1M30.MypEa1JShRDE2GqDpNooR1ZmWhkTCDWy22TIjCoNM9w'
  });

  const i18n = {
    en: {
      titleGeneral:'RUNLU GUANSHI · Consultation', titleTraditional:'RUNLU GUANSHI · Traditional Consultation',
      generated:'Generated', route:'Route', routeGeneral:'Start GUANSHI · question first', routeTraditional:'Traditional View · traditional request first',
      input:'INPUT BRIEF', result:'GUANSHI RESULT', chart:'CALENDAR / FOUR PILLARS LAYER',
      year:'Year pillar', month:'Month pillar', day:'Day pillar', hour:'Hour pillar', dayMaster:'Day Master',
      chartNote:'Calendar calculation uses the civil date and time entered. No true-solar-time or historical timezone correction is applied; boundary conventions may differ by school.',
      note:'Boundary note', noteGeneral:'Reality and reliable evidence remain the primary basis for practical recommendations. Traditional lenses are optional.',
      noteTraditional:'Traditional interpretation is recorded separately from factual claims. For practical decisions, reality and reliable evidence remain primary.',
      thinking:'GUANSHI is analyzing the question…', copied:'Copied', copy:'Copy full consultation',
      submitGeneral:'Generate GUANSHI result', submitTraditional:'Generate Traditional View result',
      outputGeneral:'Your GUANSHI consultation result', outputTraditional:'Your Traditional View consultation result',
      quota:n=>`Free analyses remaining today: ${n}`,
      limits:{identity_daily_limit:'You have used today’s two free GUANSHI analyses.',network_daily_limit:'This network has reached today’s free-use limit.',daily_budget_reached:'GUANSHI has reached today’s protected AI budget.',global_hourly_limit:'GUANSHI is temporarily at its hourly capacity.',too_fast:'Please wait a little before generating another result.',duplicate_request:'The same request was just submitted. Please wait before running it again.',too_fast_client:'Please allow the page to finish loading before submitting.'},
      privacy:'Privacy V1.4: consultation fields are sent to RUNLU’s server-side AI route for this analysis. The usage ledger stores only hashed browser/network identifiers, route and estimated-cost metadata — not the consultation text itself.'
    },
    zh: {
      titleGeneral:'RUNLU GUANSHI · 观势咨询', titleTraditional:'RUNLU GUANSHI · 传统观势咨询',
      generated:'生成时间', route:'咨询入口', routeGeneral:'开始观势 · 先问事', routeTraditional:'传统观势 · 先定传统需求',
      input:'输入摘要', result:'观势结果', chart:'历法 / 四柱计算层',
      year:'年柱', month:'月柱', day:'日柱', hour:'时柱', dayMaster:'日主',
      chartNote:'四柱按输入的民用出生日期与时间计算；当前未做真太阳时或历史时区修正，边界时刻不同流派也可能存在差异。',
      note:'边界说明', noteGeneral:'现实与可靠证据始终是实际建议的首要依据；传统观察层为可选项。',
      noteTraditional:'传统解释与事实判断分账记录；涉及现实决策时，以现实条件与可靠证据为主。',
      thinking:'观势正在分析这个问题……', copied:'已复制', copy:'复制完整咨询',
      submitGeneral:'生成观势结果', submitTraditional:'生成传统观势结果',
      outputGeneral:'你的观势咨询结果', outputTraditional:'你的传统观势咨询结果',
      quota:n=>`今日免费观势还可使用：${n} 次`,
      limits:{identity_daily_limit:'今天的 2 次免费观势已经用完，明天再来吧。',network_daily_limit:'当前网络今天的免费观势额度已经达到上限。',daily_budget_reached:'观势今天的受保护 AI 总预算已经达到上限，明天自动恢复。',global_hourly_limit:'当前一小时内咨询较多，请稍后再试。',too_fast:'两次生成间隔太短，请稍等一会儿再试。',duplicate_request:'刚刚已经提交过相同问题，请稍后再运行。',too_fast_client:'请等页面加载完成后再提交。'},
      privacy:'V1.4 隐私说明：生成结果时，咨询资料会发送到 RUNLU 的服务器端 AI 通道处理。用量账本只保存经过哈希处理的浏览器/网络标识、入口类型和估算成本，不保存咨询正文。'
    },
    fr: {
      titleGeneral:'RUNLU GUANSHI · Consultation', titleTraditional:'RUNLU GUANSHI · Consultation traditionnelle',
      generated:'Généré', route:'Parcours', routeGeneral:'Commencer GUANSHI · question d’abord', routeTraditional:'Vue traditionnelle · demande traditionnelle d’abord',
      input:'RÉSUMÉ DES DONNÉES', result:'RÉSULTAT GUANSHI', chart:'COUCHE CALENDAIRE / QUATRE PILIERS',
      year:'Pilier de l’année', month:'Pilier du mois', day:'Pilier du jour', hour:'Pilier de l’heure', dayMaster:'Maître du jour',
      chartNote:'Le calcul utilise la date et l’heure civiles saisies, sans correction du temps solaire vrai ni du fuseau historique ; les conventions peuvent varier selon les écoles.',
      note:'Limite', noteGeneral:'La réalité et les preuves fiables restent la base principale des recommandations pratiques.', noteTraditional:'L’interprétation traditionnelle est séparée des faits ; pour les décisions pratiques, réalité et preuves fiables restent prioritaires.',
      thinking:'GUANSHI analyse la question…', copied:'Copié', copy:'Copier la consultation complète',
      submitGeneral:'Générer le résultat GUANSHI', submitTraditional:'Générer le résultat traditionnel',
      outputGeneral:'Votre résultat GUANSHI', outputTraditional:'Votre résultat traditionnel',
      quota:n=>`Analyses gratuites restantes aujourd’hui : ${n}`,
      limits:{identity_daily_limit:'Vos deux analyses gratuites du jour ont été utilisées.',network_daily_limit:'Ce réseau a atteint sa limite gratuite du jour.',daily_budget_reached:'Le budget IA protégé de GUANSHI est atteint pour aujourd’hui.',global_hourly_limit:'GUANSHI est temporairement à sa capacité horaire.',too_fast:'Veuillez patienter avant de générer un autre résultat.',duplicate_request:'La même demande vient d’être envoyée. Veuillez patienter.',too_fast_client:'Veuillez attendre la fin du chargement avant d’envoyer.'},
      privacy:'Confidentialité V1.4 : les données de consultation sont traitées par la voie IA serveur de RUNLU. Le registre d’usage conserve seulement des identifiants navigateur/réseau hachés, le parcours et une estimation de coût, pas le texte de la consultation.'
    },
    es: {
      titleGeneral:'RUNLU GUANSHI · Consulta', titleTraditional:'RUNLU GUANSHI · Consulta tradicional',
      generated:'Generado', route:'Ruta', routeGeneral:'Empezar GUANSHI · primero la pregunta', routeTraditional:'Vista tradicional · primero la solicitud tradicional',
      input:'RESUMEN DE ENTRADA', result:'RESULTADO GUANSHI', chart:'CAPA CALENDÁRICA / CUATRO PILARES',
      year:'Pilar del año', month:'Pilar del mes', day:'Pilar del día', hour:'Pilar de la hora', dayMaster:'Maestro del día',
      chartNote:'El cálculo usa la fecha y hora civil introducidas, sin corrección de tiempo solar verdadero ni zona horaria histórica; las convenciones pueden variar según la escuela.',
      note:'Límite', noteGeneral:'La realidad y la evidencia fiable siguen siendo la base principal de las recomendaciones prácticas.', noteTraditional:'La interpretación tradicional se separa de los hechos; para decisiones prácticas, realidad y evidencia fiable siguen siendo prioritarias.',
      thinking:'GUANSHI está analizando la pregunta…', copied:'Copiado', copy:'Copiar consulta completa',
      submitGeneral:'Generar resultado GUANSHI', submitTraditional:'Generar resultado tradicional',
      outputGeneral:'Tu resultado GUANSHI', outputTraditional:'Tu resultado tradicional',
      quota:n=>`Análisis gratuitos restantes hoy: ${n}`,
      limits:{identity_daily_limit:'Ya utilizaste los dos análisis gratuitos de hoy.',network_daily_limit:'Esta red alcanzó el límite gratuito de hoy.',daily_budget_reached:'GUANSHI alcanzó hoy su presupuesto de IA protegido.',global_hourly_limit:'GUANSHI está temporalmente en su capacidad horaria.',too_fast:'Espera un poco antes de generar otro resultado.',duplicate_request:'La misma solicitud acaba de enviarse. Espera antes de repetirla.',too_fast_client:'Espera a que termine de cargar la página antes de enviar.'},
      privacy:'Privacidad V1.4: los datos de consulta se procesan por la ruta de IA del servidor de RUNLU. El registro de uso solo guarda identificadores de navegador/red con hash, la ruta y el coste estimado, no el texto de la consulta.'
    }
  };

  const clean=v=>(v||'').toString().trim();
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const lang=()=>document.querySelector('[data-runlu-language-select]')?.value || localStorage.getItem('runlu_site_language') || 'en';
  const labelFor=el=>el?.tagName==='SELECT' ? clean(el.options[el.selectedIndex]?.textContent) : clean(el?.value);
  const row=(name,value)=>value?`${name}: ${value}`:'';

  function deviceId(){
    const key='runlu_guanshi_device_id';
    let id=localStorage.getItem(key)||'';
    if(!/^[A-Za-z0-9_-]{16,100}$/.test(id)){
      id=(crypto.randomUUID?.() || `g${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g,'_');
      localStorage.setItem(key,id);
    }
    return id;
  }

  const trap=document.createElement('input');
  trap.type='text'; trap.name='website'; trap.autocomplete='off'; trap.tabIndex=-1; trap.setAttribute('aria-hidden','true');
  trap.style.cssText='position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;';
  form.appendChild(trap);

  function buildGeneral(data){
    const lines=[],f=name=>form.elements[name];
    lines.push(row(f('topicLabel')?.dataset.currentLabel||'Topic',labelFor(f('topic'))));
    lines.push(row(f('question')?.dataset.summaryLabel||'Question',clean(data.get('question'))));
    lines.push(row(f('horizonLabel')?.dataset.currentLabel||'Time horizon',labelFor(f('horizon'))));
    lines.push(row(f('options')?.dataset.summaryLabel||'Options / alternatives',clean(data.get('options'))));
    lines.push(row(f('facts')?.dataset.summaryLabel||'Known facts',clean(data.get('facts'))));
    lines.push(row(f('constraints')?.dataset.summaryLabel||'Constraints',clean(data.get('constraints'))));
    lines.push(row(f('stakesLabel')?.dataset.currentLabel||'Stakes',labelFor(f('stakes'))));
    lines.push(row(f('traditionalLabel')?.dataset.currentLabel||'Traditional lens',labelFor(f('traditional'))));
    return lines.filter(Boolean);
  }

  function buildTraditional(data){
    const lines=[],f=name=>form.elements[name];
    lines.push(row(f('methodLabel')?.dataset.currentLabel||'Traditional method',labelFor(f('method'))));
    lines.push(row(f('topicLabel')?.dataset.currentLabel||'Topic',labelFor(f('topic'))));
    lines.push(row(f('question')?.dataset.summaryLabel||'Question',clean(data.get('question'))));
    ['birth_date','birth_time','birth_place','event_horizon','environment','facts','decision'].forEach(name=>{
      const el=f(name); lines.push(row(el?.dataset.summaryLabel||name.replaceAll('_',' '),clean(data.get(name))));
    });
    return lines.filter(Boolean);
  }

  function payloadFields(data){
    const fields={};
    for(const [name,value] of data.entries()){
      if(name==='boundary'||name==='website'||name.endsWith('Label')) continue;
      fields[name]=clean(value).slice(0,3500);
      const el=form.elements[name];
      if(el?.tagName==='SELECT') fields[`${name}_label`]=labelFor(el).slice(0,500);
    }
    return fields;
  }

  function localDate(){
    const d=new Date(),pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function chartText(chart,t){
    if(!chart||chart.error||!chart.four_pillars) return '';
    const p=chart.four_pillars;
    return [`【${t.chart}】`,`${t.year}: ${p.year}`,`${t.month}: ${p.month}`,`${t.day}: ${p.day}`,`${t.hour}: ${p.hour}`,`${t.dayMaster}: ${chart.day_master||''}`,t.chartNote,''].join('\n');
  }

  function authToken(){
    const live=window.RUNLU_AUTH?.accessToken;
    return typeof live==='string'&&live.length>40?live:AI.anonKey;
  }

  async function callEngine(fields,l){
    const response=await fetch(AI.endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${authToken()}`,'apikey':AI.anonKey},
      body:JSON.stringify({mode,language:l,fields,client_local_date:localDate(),device_id:deviceId(),client_elapsed_ms:Date.now()-pageOpenedAt,website:clean(trap.value)})
    });
    let data={}; try{data=await response.json();}catch{}
    if(!response.ok){const err=new Error(data.error||`GUANSHI AI HTTP ${response.status}`);err.code=data.error_code||'';err.detail=data;throw err;}
    if(!data.result) throw new Error('No consultation result was returned.');
    return data;
  }

  function applyV14Labels(){
    const l=lang(),t=i18n[l]||i18n.en;
    document.querySelectorAll('[data-summary-label-en]').forEach(el=>el.dataset.summaryLabel=el.dataset[`summaryLabel${cap(l)}`]||el.dataset.summaryLabelEn);
    document.querySelectorAll('[data-current-label-en]').forEach(el=>el.dataset.currentLabel=el.dataset[`currentLabel${cap(l)}`]||el.dataset.currentLabelEn);
    if(copyBtn) copyBtn.textContent=t.copy;
    if(submitBtn) submitBtn.textContent=mode==='traditional'?t.submitTraditional:t.submitGeneral;
    if(outputTitle) outputTitle.textContent=mode==='traditional'?t.outputTraditional:t.outputGeneral;
    if(privacyNote){privacyNote.dataset.en=i18n.en.privacy;privacyNote.dataset.zh=i18n.zh.privacy;privacyNote.dataset.fr=i18n.fr.privacy;privacyNote.dataset.es=i18n.es.privacy;privacyNote.textContent=t.privacy;}
    document.querySelectorAll('.consult-kicker').forEach(el=>{if(el.textContent.includes('RUNLU GUANSHI'))el.textContent='RUNLU GUANSHI · V1.4';});
    const fv=document.querySelector('.gs-footer > div'); if(fv?.textContent.includes('RUNLU GUANSHI'))fv.textContent='RUNLU GUANSHI · V1.4';
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(!form.reportValidity()) return;
    applyV14Labels();
    const data=new FormData(form),l=lang(),t=i18n[l]||i18n.en;
    const body=mode==='traditional'?buildTraditional(data):buildGeneral(data);
    const title=mode==='traditional'?t.titleTraditional:t.titleGeneral;
    const route=mode==='traditional'?t.routeTraditional:t.routeGeneral;
    const note=mode==='traditional'?t.noteTraditional:t.noteGeneral;
    const timestamp=new Date().toLocaleString(l==='zh'?'zh-CN':l);
    const intro=[title,'',`${t.generated}: ${timestamp}`,`${t.route}: ${route}`,'',`【${t.input}】`,...body,''];

    output.classList.add('is-visible'); pre.textContent=[...intro,t.thinking].join('\n');
    output.scrollIntoView({behavior:'smooth',block:'nearest'});
    if(submitBtn) submitBtn.disabled=true;
    try{
      const result=await callEngine(payloadFields(data),l);
      const quota=Number.isFinite(Number(result?.limits?.remaining_today))?t.quota(Number(result.limits.remaining_today)):'';
      pre.textContent=[...intro,chartText(result.chart,t),`【${t.result}】`,result.result,'',quota,`${t.note}: ${note}`].filter(Boolean).join('\n');
    }catch(error){
      const code=error?.code||'';
      const friendly=t.limits?.[code]||error?.message||'Request failed.';
      pre.textContent=[...intro,`⚠ ${friendly}`,'',`${t.note}: ${note}`].join('\n');
    }finally{if(submitBtn)submitBtn.disabled=false;}
  });

  copyBtn?.addEventListener('click',async()=>{
    const text=pre.textContent,l=lang(),t=i18n[l]||i18n.en;
    try{await navigator.clipboard.writeText(text);}catch{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
    const old=copyBtn.textContent;copyBtn.textContent=t.copied;setTimeout(()=>copyBtn.textContent=old,1400);
  });

  form.addEventListener('reset',()=>{setTimeout(()=>{output?.classList.remove('is-visible');if(pre)pre.textContent='';trap.value='';},0);});
  document.querySelector('[data-runlu-language-select]')?.addEventListener('change',()=>setTimeout(applyV14Labels,0));
  applyV14Labels();
})();
