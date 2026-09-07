from pathlib import Path
p=Path('guanshi-consult.js')
text=p.read_text(encoding='utf-8')
old="""    const knowledge=window.GUANSHI_KB?.search({mode,fields,language:l,max:5})||[];
    const local=window.GUANSHI_LOCAL_REASONER?.analyze({mode,fields,knowledge,language:l})||{text:'Local reasoning engine unavailable.',version:'none'};
"""
new="""    const localKnowledge=window.GUANSHI_KB?.search({mode,fields,language:l,max:6,includePrivate:true})||[];
    const cloudKnowledge=window.GUANSHI_KB?.search({mode,fields,language:l,max:5})||[];
    const local=window.GUANSHI_LOCAL_REASONER?.analyze({mode,fields,knowledge:localKnowledge,language:l})||{text:'Local reasoning engine unavailable.',version:'none'};
"""
if old not in text:
    raise SystemExit('knowledge split anchor missing')
text=text.replace(old,new,1)
text=text.replace("const knowledgeLine=knowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${knowledge.map(x=>x.id).join(' · ')}`:'';","const knowledgeLine=localKnowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${localKnowledge.map(x=>x.id).join(' · ')}`:'';",1)
text=text.replace("fields,knowledge_used:knowledge,local_baseline:local,traditional_structure:null","fields,knowledge_used:localKnowledge,knowledge_shared_cloud:[],local_baseline:local,traditional_structure:null",1)
old_cloud="""      const result=await callEngine(fields,l,knowledge),quota=Number.isFinite(Number(result?.limits?.remaining_today))?t.quota(Number(result.limits.remaining_today)):'',fixed=[chartText(result.chart,t),structureText(result.traditional_structure,t)].filter(Boolean),knowledgeLine=knowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${knowledge.map(x=>x.id).join(' · ')}`:'',cloudHeader=({zh:'【云端增强分析】',fr:'【ANALYSE CLOUD ENRICHIE】',es:'【ANÁLISIS AMPLIADO EN LA NUBE】',en:'【CLOUD-ENHANCED ANALYSIS】'}[l]||'【CLOUD-ENHANCED ANALYSIS】'),full=[...intro,localHeader,local.text,'',...fixed,cloudHeader,result.result,'',knowledgeLine,quota,`${t.note}: ${note}`].filter(Boolean).join('\\n');
      pre.textContent=full;sessionStorage.setItem(LAST_KEY,JSON.stringify({mode,engine:'hybrid-local-cloud',generated_at:new Date().toISOString(),language:l,question:fields.question||'',fields,knowledge_used:knowledge,local_baseline:local,traditional_structure:result.traditional_structure||null,chart:result.chart||null,full_text:full}));const a=validationLink();if(a)a.textContent=t.validate;
"""
new_cloud="""      const result=await callEngine(fields,l,cloudKnowledge),quota=Number.isFinite(Number(result?.limits?.remaining_today))?t.quota(Number(result.limits.remaining_today)):'',fixed=[chartText(result.chart,t),structureText(result.traditional_structure,t)].filter(Boolean),knowledgeLine=localKnowledge.length?`${({zh:'本地知识命中',fr:'Connaissances locales',es:'Conocimiento local',en:'Local knowledge match'}[l]||'Local knowledge match')}: ${localKnowledge.map(x=>x.id).join(' · ')}`:'',privateLocalCount=Math.max(0,localKnowledge.filter(x=>x.local).length-cloudKnowledge.filter(x=>x.local).length),privacyLine=privateLocalCount?({zh:`本地基线另使用 ${privateLocalCount} 条仅本地资料；这些资料没有发送给云端。`,fr:`La base locale a utilisé ${privateLocalCount} note(s) privée(s) non envoyée(s) au cloud.`,es:`La línea base local usó ${privateLocalCount} nota(s) privada(s) que no se enviaron a la nube.`,en:`The local baseline used ${privateLocalCount} private local note(s) that were not sent to the cloud.`}[l]):'',cloudHeader=({zh:'【云端增强分析】',fr:'【ANALYSE CLOUD ENRICHIE】',es:'【ANÁLISIS AMPLIADO EN LA NUBE】',en:'【CLOUD-ENHANCED ANALYSIS】'}[l]||'【CLOUD-ENHANCED ANALYSIS】'),full=[...intro,localHeader,local.text,'',privacyLine,...fixed,cloudHeader,result.result,'',knowledgeLine,quota,`${t.note}: ${note}`].filter(Boolean).join('\\n');
      pre.textContent=full;sessionStorage.setItem(LAST_KEY,JSON.stringify({mode,engine:'hybrid-local-cloud',generated_at:new Date().toISOString(),language:l,question:fields.question||'',fields,knowledge_used:localKnowledge,knowledge_shared_cloud:cloudKnowledge,local_baseline:local,traditional_structure:result.traditional_structure||null,chart:result.chart||null,full_text:full}));const a=validationLink();if(a)a.textContent=t.validate;
"""
if old_cloud not in text:
    raise SystemExit('cloud knowledge anchor missing')
text=text.replace(old_cloud,new_cloud,1)
text=text.replace("fields,knowledge_used:knowledge,local_baseline:local,cloud_error:","fields,knowledge_used:localKnowledge,knowledge_shared_cloud:cloudKnowledge,local_baseline:local,cloud_error:",1)
p.write_text(text,encoding='utf-8')
