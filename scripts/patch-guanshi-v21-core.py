from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')

p = 'guanshi-consult.js'
text = read(p)
anchor = "  const mode=document.body.dataset.consultMode||'general',pageOpenedAt=Date.now(),LAST_KEY='runlu_guanshi_last_consultation';\n"
if "const localOnlyBtn=form.querySelector('[data-local-only]')" not in text:
    if anchor not in text:
        raise SystemExit('consult mode anchor missing')
    text = text.replace(anchor, anchor + "  const localOnlyBtn=form.querySelector('[data-local-only]'); let localOnlyRequested=false;\n", 1)

text = text.replace("textContent='RUNLU GUANSHI · V2.0'", "textContent='RUNLU GUANSHI · V2.1'")
text = text.replace("privacy:'Privacy: consultation fields are processed server-side for this analysis. Fixed chart/cast/site mechanics are returned with the result. A frozen validation case remains local-first unless you export it.'", "privacy:'Privacy: the local baseline runs only in this browser. Consultation fields are sent server-side only when cloud enhancement is used. A frozen validation case remains local-first unless you export it.'")
text = text.replace("privacy:'隐私说明：咨询资料会发送到服务器端用于本次分析；固定排盘、起卦和场地计算会随结果一并返回。冻结后的验证案例正文仍默认只保存在当前浏览器，除非你自己导出。'", "privacy:'隐私说明：本地观势基线只在当前浏览器运行；只有使用云端增强时，咨询资料才会发送到服务器端。冻结后的验证案例正文仍默认只保存在当前浏览器，除非你自己导出。'")
text = text.replace("privacy:'Confidentialité : les données sont traitées côté serveur ; les calculs fixes sont renvoyés avec le résultat. Un cas figé reste local au navigateur sauf export.'", "privacy:'Confidentialité : la base locale s’exécute uniquement dans ce navigateur. Les données ne sont envoyées au serveur que pour l’analyse cloud. Un cas figé reste local sauf export.'")
text = text.replace("privacy:'Privacidad: los datos se procesan en el servidor; los cálculos fijos vuelven con el resultado. Un caso congelado permanece local salvo exportación.'", "privacy:'Privacidad: la línea base local se ejecuta solo en este navegador. Los datos se envían al servidor únicamente cuando se usa el análisis en la nube. Un caso congelado permanece local salvo exportación.'")

start = text.index("  form.addEventListener('submit',async e=>{")
end = text.index("  copyBtn?.addEventListener", start)
handler = """  localOnlyBtn?.addEventListener('click',()=>{localOnlyRequested=true;form.requestSubmit();});

  form.addEventListener('submit',async e=>{
    e.preventDefault(); syncMethodPanels(); if(!form.reportValidity()){localOnlyRequested=false;return;} applyV16Labels();
    const data=new FormData(form),l=lang(),t=i18n[l]||i18n.en,fields=payloadFields(data),body=mode==='traditional'?buildTraditional(data):buildGeneral(data),title=mode==='traditional'?t.titleTraditional:t.titleGeneral,route=mode==='traditional'?t.routeTraditional:t.routeGeneral,note=mode==='traditional'?t.noteTraditional:t.noteGeneral,timestamp=new Date().toLocaleString(l==='zh'?'zh-CN':l),intro=[title,'',`${t.generated}: ${timestamp}`,`${t.route}: ${route}`,'',`【${t.input}】`,...body,''];
    const knowledge=window.GUANSHI_KB?.search({mode,fields,language:l,max:5})||[];
    const local=window.GUANSHI_LOCAL_REASONER?.analyze({mode,fields,knowledge,language:l})||{text:'Local reasoning engine unavailable.',version:'none'};
    const localHeader=({zh:'【本地观势基线】',fr:'【BASE LOCALE】',es:'【LÍNEA BASE LOCAL】',en:'【LOCAL BASELINE】'}[l]||'【LOCAL BASELINE】');
    const cloudThinking=({zh:'本地基线已完成；正在尝试云端增强分析……',fr:'Base locale terminée ; tentative d’analyse cloud enrichie…',es:'Línea base local terminada; intentando análisis ampliado en la nube…',en:'Local baseline complete; attempting cloud-enhanced analysis…'}[l]||'Local baseline complete; attempting cloud-enhanced analysis…');
    const localOnlyLabel=({zh:'本次只运行本地引擎；咨询内容没有发送到云端。',fr:'Moteur local uniquement ; les données de consultation n’ont pas été envoyées au cloud.',es:'Solo motor local; los datos de la consulta no se enviaron a la nube.',en:'Local engine only; consultation fields were not sent to the cloud.'}[l]);
    output.classList.add('is-visible');pre.textContent=[...intro,localHeader,local.text,'',localOnlyRequested||navigator.onLine===false?localOnlyLabel:cloudThinking].join('\\n');output.scrollIntoView({behavior:'smooth',block:'nearest'});output?.querySelector('[data-validation-link]')?.remove();if(submitBtn)submitBtn.disabled=true;if(localOnlyBtn)localOnlyBtn.disabled=true;
    const useLocalOnly=localOnlyRequested||navigator.onLine===false; localOnlyRequested=false;
    try{
      if(useLocalOnly){
        const knowledgeLine=knowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${knowledge.map(x=>x.id).join(' · ')}`:'';
        const full=[...intro,localHeader,local.text,'',knowledgeLine,localOnlyLabel,`${t.note}: ${note}`].filter(Boolean).join('\\n');
        pre.textContent=full;sessionStorage.setItem(LAST_KEY,JSON.stringify({mode,engine:'local-only',generated_at:new Date().toISOString(),language:l,question:fields.question||'',fields,knowledge_used:knowledge,local_baseline:local,traditional_structure:null,chart:null,full_text:full}));const a=validationLink();if(a)a.textContent=t.validate;return;
      }
      const result=await callEngine(fields,l,knowledge),quota=Number.isFinite(Number(result?.limits?.remaining_today))?t.quota(Number(result.limits.remaining_today)):'',fixed=[chartText(result.chart,t),structureText(result.traditional_structure,t)].filter(Boolean),knowledgeLine=knowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${knowledge.map(x=>x.id).join(' · ')}`:'',cloudHeader=({zh:'【云端增强分析】',fr:'【ANALYSE CLOUD ENRICHIE】',es:'【ANÁLISIS AMPLIADO EN LA NUBE】',en:'【CLOUD-ENHANCED ANALYSIS】'}[l]||'【CLOUD-ENHANCED ANALYSIS】'),full=[...intro,localHeader,local.text,'',...fixed,cloudHeader,result.result,'',knowledgeLine,quota,`${t.note}: ${note}`].filter(Boolean).join('\\n');
      pre.textContent=full;sessionStorage.setItem(LAST_KEY,JSON.stringify({mode,engine:'hybrid-local-cloud',generated_at:new Date().toISOString(),language:l,question:fields.question||'',fields,knowledge_used:knowledge,local_baseline:local,traditional_structure:result.traditional_structure||null,chart:result.chart||null,full_text:full}));const a=validationLink();if(a)a.textContent=t.validate;
    }catch(error){
      const code=error?.code||'';
      const friendly=t.limits?.[code]||(error?.name==='AbortError'?({zh:'云端响应超时；已保留本地观势基线。',fr:'Délai cloud dépassé ; la base locale est conservée.',es:'Tiempo de espera de la nube agotado; se conserva la línea base local.',en:'Cloud response timed out; the local baseline is preserved.'}[l]):(error?.message||'Cloud request failed.'));
      const fallback=({zh:'云端增强暂不可用；以下本地基线仍可独立使用。',fr:'Analyse cloud indisponible ; la base locale reste utilisable.',es:'El análisis en la nube no está disponible; la línea base local sigue siendo utilizable.',en:'Cloud enhancement is unavailable; the local baseline remains usable.'}[l]);
      const full=[...intro,localHeader,local.text,'',`⚠ ${friendly}`,fallback,`${t.note}: ${note}`].join('\\n');
      pre.textContent=full;sessionStorage.setItem(LAST_KEY,JSON.stringify({mode,engine:'local-fallback',generated_at:new Date().toISOString(),language:l,question:fields.question||'',fields,knowledge_used:knowledge,local_baseline:local,cloud_error:code||error?.message||'cloud_failed',full_text:full}));const a=validationLink();if(a)a.textContent=t.validate;
    }
    finally{if(submitBtn)submitBtn.disabled=false;if(localOnlyBtn)localOnlyBtn.disabled=false;}
  });
"""
text = text[:start] + handler + text[end:]
write(p, text)

local_btn = '<button class="consult-btn secondary" type="button" data-local-only data-en="Local baseline only" data-zh="只跑本地基线" data-fr="Base locale uniquement" data-es="Solo línea base local">Local baseline only</button>'
for p in ['guanshi-consult.html', 'guanshi-traditional-consult.html']:
    text = read(p).replace('RUNLU GUANSHI · V2.0', 'RUNLU GUANSHI · V2.1')
    if 'data-local-only' not in text:
        marker = '<button class="consult-btn secondary" type="reset"'
        i = text.find(marker)
        if i < 0:
            raise SystemExit(f'{p}: reset button marker missing')
        text = text[:i] + local_btn + text[i:]
    old = '<script src="guanshi-knowledge.js?v=20260907-2"></script>\n  <script src="guanshi-consult.js?v=20260907-1"></script>'
    new = '<script src="guanshi-knowledge.js?v=20260907-2"></script>\n  <script src="guanshi-local-reasoner.js?v=20260907-1"></script>\n  <script src="guanshi-consult.js?v=20260907-2"></script>'
    if 'guanshi-local-reasoner.js' not in text:
        if old not in text:
            raise SystemExit(f'{p}: script anchor missing')
        text = text.replace(old, new, 1)
    text = text.replace('Privacy: consultation fields are processed server-side for this analysis.', 'Privacy: Local baseline stays in this browser. Cloud enhancement sends consultation fields server-side only when used.')
    text = text.replace('隐私说明：咨询资料会发送到服务器端用于本次分析；', '隐私说明：本地基线只在当前浏览器运行；只有使用云端增强时，咨询资料才会发送到服务器端；')
    text = text.replace('Confidentialité : les données sont traitées côté serveur pour l’analyse ;', 'Confidentialité : la base locale reste dans ce navigateur ; les données sont envoyées au serveur uniquement pour l’analyse cloud ;')
    text = text.replace('Privacidad: los datos se procesan en el servidor;', 'Privacidad: la línea base local permanece en este navegador; los datos se envían al servidor solo para el análisis en la nube;')
    write(p, text)

for p in ['guanshi.html', 'guanshi-library.html']:
    text = read(p).replace('RUNLU GUANSHI · V1.7', 'RUNLU GUANSHI · V2.1').replace('RUNLU GUANSHI · V2.0', 'RUNLU GUANSHI · V2.1')
    write(p, text)
