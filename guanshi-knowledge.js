(() => {
  'use strict';

  const VERSION = '2.0-local-kb-v2';
  const USER_KEY = 'runlu_guanshi_local_knowledge_v1';
  const NODES = Object.freeze([
    {id:'GS-CORE-REALITY',source:'GUANSHI.md',sourceType:'RUNLU framework',status:'Supported',topics:['career','business','relationship','home','personal','other'],methods:['general'],keywords:['事实','现实','证据','基线','evidence','reality','fact','baseline','preuve','réalité','hecho','realidad'],summary:'Practical recommendations start from observed facts, constraints, options, timing, downside and reliable evidence. Traditional or symbolic material must not silently outrank stronger evidence.'},
    {id:'GS-CORE-DECISION',source:'GUANSHI.md',sourceType:'RUNLU framework',status:'Supported',topics:['career','business','relationship','home','personal','other'],methods:['general'],keywords:['选择','方案','决策','风险','可逆','成本','概率','decision','option','risk','reversible','base rate','décision','option','risque','decisión','opción','riesgo'],summary:'Frame the real decision, compare genuine alternatives, separate assumptions from known facts, consider base rates and uncertainty, and prefer robust or reversible action when evidence is limited.'},
    {id:'GS-EVIDENCE-TRACE',source:'GUANSHI.md',sourceType:'RUNLU framework',status:'Supported',topics:['career','business','relationship','home','personal','other'],methods:['general','bazi','ganzhi','liuyao','meihua','fengshui','mixed'],keywords:['来源','证据等级','为什么','反方','不确定','source','status','why','counter','uncertainty','preuve','incertitude','fuente','evidencia','incertidumbre'],summary:'Source type and evidence status are different. User-provided facts, computed mechanics, inference, traditional rules and symbolic readings must be labeled separately; important conclusions should also state how they could be wrong.'},
    {id:'GS-VALIDATION',source:'GUANSHI_CASE_TEMPLATE.md',sourceType:'RUNLU framework',status:'Exploratory',topics:['career','business','relationship','home','personal','other'],methods:['general','bazi','ganzhi','liuyao','meihua','fengshui','mixed'],keywords:['验证','复盘','冻结','预测','结果','命中','validation','review','freeze','forecast','outcome','calibration','révision','revisión'],summary:'A testable judgment should be frozen before the outcome, then reviewed by appending what actually happened rather than rewriting the original. Repeated prospective results determine whether a method earns, keeps or loses weight.'},
    {id:'GS-YIJING',source:'GUANSHI_YIJING.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','home','personal','other'],methods:['mixed'],keywords:['易经','变化','转折','卦','yijing','change','transition','hexagram','yi jing','changement','cambio'],summary:'Yijing is used as a traditional lens on change, transition and patterned relationships. In GUANSHI it can generate questions or hypotheses, but it is not treated as scientifically validated prediction.'},
    {id:'GS-YINYANG',source:'GUANSHI_YINYANG.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','home','personal','other'],methods:['mixed'],keywords:['阴阳','对立','互补','平衡','yin yang','opposite','complement','balance','yin-yang','équilibre','equilibrio'],summary:'Yin–Yang is used as a relational abstraction for opposing, complementary or alternating tendencies. It is a traditional explanatory lens, not empirical proof by itself.'},
    {id:'GS-WUXING',source:'GUANSHI_WUXING.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','home','personal','other'],methods:['bazi','mixed'],keywords:['五行','木','火','土','金','水','相生','相克','wuxing','five phases','wood','fire','earth','metal','water','cinq phases','cinco fases'],summary:'Five Phases are treated as a traditional system model for relationships and transformation. Deterministic labels may be calculated, while predictive or causal claims remain Traditional unless prospectively validated.'},
    {id:'GS-BAGUA',source:'GUANSHI_BAGUA.md',sourceType:'RUNLU framework',status:'Traditional',topics:['home','personal','other'],methods:['liuyao','meihua','fengshui','mixed'],keywords:['八卦','乾','坤','震','巽','坎','离','艮','兑','bagua','trigram','eight trigrams','trigramme','trigrama'],summary:'Bagua supplies traditional state and relationship categories used by Yijing, Six Lines, Meihua and some Feng Shui systems. The categories are symbolic coordinates rather than established causal mechanisms.'},
    {id:'GS-GANZHI',source:'GUANSHI_GANZHI.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','personal','other'],methods:['ganzhi','bazi','meihua','mixed'],keywords:['干支','天干','地支','时间','流年','ganzhi','stem','branch','timing','stems and branches','tronc','branche','tallo','rama'],summary:'Stems and Branches provide a deterministic traditional time-coding layer. Correct calendar conversion does not by itself establish predictive accuracy.'},
    {id:'GS-BAZI',source:'GUANSHI_BAZI.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','personal','other'],methods:['bazi'],keywords:['八字','四柱','日主','十神','出生','bazi','four pillars','day master','ten gods','birth','quatre piliers','cuatro pilares'],summary:'Bazi uses a computed Four Pillars structure as a traditional Person × Time lens. GUANSHI separates chart calculation from life interpretation and does not treat a correct chart as proof of a correct prediction.'},
    {id:'GS-LIUYAO',source:'GUANSHI_LIUYAO_MEIHUA.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','home','personal','other'],methods:['liuyao'],keywords:['六爻','起卦','动爻','主卦','变卦','liuyao','six lines','moving line','coin','six lignes','seis líneas'],summary:'Six Lines uses one fixed auditable digital three-coin cast in the public prototype. The seed, coin faces, line values and changing lines are mechanics; interpretation remains Traditional/Symbolic until prospective testing shows added value.'},
    {id:'GS-MEIHUA',source:'GUANSHI_LIUYAO_MEIHUA.md',sourceType:'RUNLU framework',status:'Traditional',topics:['career','business','relationship','home','personal','other'],methods:['meihua'],keywords:['梅花','梅花易数','时间起卦','卦','meihua','time cast','plum blossom','tirage temporel','tirada temporal'],summary:'Meihua uses a frozen submission-moment arithmetic rule for prospective testing. GUANSHI does not silently switch schools after seeing the result, and the calculation itself is not evidence of predictive validity.'},
    {id:'GS-FENGSHUI',source:'GUANSHI_FENGSHUI.md',sourceType:'RUNLU framework',status:'Traditional',topics:['home','business','other'],methods:['fengshui'],keywords:['风水','朝向','采光','通风','噪音','潮湿','动线','二十四山','feng shui','orientation','daylight','ventilation','noise','moisture','circulation','humidité','orientación','humedad'],summary:'Feng Shui consultation records measurable environment separately from traditional compass symbolism. Daylight, ventilation, noise, moisture, access and circulation receive explanatory priority when they already account for a practical recommendation.'},
    {id:'GS-UNCERTAINTY',source:'GUANSHI_CONSULTATION.md',sourceType:'RUNLU framework',status:'Supported',topics:['career','business','relationship','home','personal','other'],methods:['general','bazi','ganzhi','liuyao','meihua','fengshui','mixed'],keywords:['不确定','反例','反方','假设','推翻','uncertainty','counter-case','assumption','falsifier','incertitude','hypothèse','incertidumbre','hipótesis'],summary:'Every substantive result should identify the strongest counter-case, the weakest assumption, the new information most likely to change the recommendation, and an overall uncertainty level.'}
  ]);

  const STOP = new Set(['the','and','for','with','this','that','what','are','you','your','about','from','into','une','des','les','pour','avec','que','qui','los','las','para','con','una','qué','como','目前','现在','一个','什么','怎么','如何','是否','可以','需要','我的','我们']);
  const METHODS=['general','bazi','ganzhi','liuyao','meihua','fengshui','mixed'];
  const TOPICS=['career','business','relationship','home','personal','other'];
  const STATUSES=['Exploratory','Traditional','Symbolic','Rejected'];

  function normalize(v){ return String(v ?? '').toLowerCase().normalize('NFKC'); }
  function clean(v,max=2400){ return String(v ?? '').trim().slice(0,max); }
  function safeArray(v,allowed,fallback){ const a=Array.isArray(v)?v:[]; const out=[...new Set(a.map(normalize).filter(x=>allowed.includes(x)))]; return out.length?out:fallback; }
  function terms(text){
    const raw=normalize(text),latin=raw.match(/[a-zà-ÿ0-9]+/g)||[],han=raw.match(/[\u3400-\u9fff]{1,6}/g)||[];
    return [...new Set([...latin,...han].filter(x=>x.length>1&&!STOP.has(x)))];
  }
  function loadLocal(){
    try{ const raw=JSON.parse(localStorage.getItem(USER_KEY)||'[]'); return Array.isArray(raw)?raw.map(sanitizeLocal).filter(Boolean):[]; }catch{return [];}
  }
  function sanitizeLocal(x){
    if(!x||typeof x!=='object')return null;
    const id=clean(x.id,90)||`GS-LOCAL-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const title=clean(x.title,180),summary=clean(x.summary||x.body,1800); if(!title||!summary)return null;
    const kind=['fact','reference','traditional','symbolic'].includes(normalize(x.kind))?normalize(x.kind):'reference';
    const status=kind==='traditional'?'Traditional':kind==='symbolic'?'Symbolic':STATUSES.includes(x.status)?x.status:'Exploratory';
    return {id,title,summary,tags:clean(x.tags,500),topics:safeArray(x.topics,TOPICS,['other']),methods:safeArray(x.methods,METHODS,['general']),kind,status,shareWithAnalysis:x.shareWithAnalysis===true,created_at:clean(x.created_at,50)||new Date().toISOString(),updated_at:clean(x.updated_at,50)||new Date().toISOString()};
  }
  function saveLocal(items){ localStorage.setItem(USER_KEY,JSON.stringify((items||[]).map(sanitizeLocal).filter(Boolean))); }
  function upsertLocal(item){ const next=sanitizeLocal(item); if(!next)throw new Error('A title and note are required.'); const all=loadLocal(),i=all.findIndex(x=>x.id===next.id); if(i>=0)all[i]=next;else all.push(next);saveLocal(all);return next; }
  function removeLocal(id){ saveLocal(loadLocal().filter(x=>x.id!==id)); }
  function clearLocal(){ localStorage.removeItem(USER_KEY); }
  function localToNode(x){
    const sourceType=x.kind==='fact'?'User-provided fact':x.kind==='traditional'?'Local traditional note':x.kind==='symbolic'?'Local symbolic note':'Local reference note';
    return {id:x.id,source:`Local Library · ${x.title}`,sourceType,status:x.status,topics:x.topics,methods:x.methods,keywords:[x.title,x.tags,...terms(x.summary)],summary:x.summary,local:true,shareWithAnalysis:x.shareWithAnalysis===true};
  }
  function methodOf(mode,fields){ if(mode!=='traditional')return'general';const m=normalize(fields?.method||'mixed');return METHODS.includes(m)?m:'mixed'; }
  function topicOf(fields){ const t=normalize(fields?.topic||'other');return TOPICS.includes(t)?t:'other'; }
  function searchable(node){ return normalize([node.id,node.source,node.sourceType,node.status,node.summary,...(node.keywords||[]),...node.topics,...node.methods].join(' ')); }
  function scoreNode(node,ctx){
    let score=0;
    if(node.methods.includes(ctx.method))score+=ctx.method==='general'?3:18;
    if(node.methods.includes('general')&&ctx.method!=='general')score+=2;
    if(node.topics.includes(ctx.topic))score+=4;
    const hay=searchable(node);
    for(const term of ctx.terms){if(hay.includes(term))score+=term.length>=5?3:2;if((node.keywords||[]).some(k=>normalize(k)===term))score+=3;}
    if(['GS-CORE-REALITY','GS-EVIDENCE-TRACE','GS-UNCERTAINTY'].includes(node.id))score+=3;
    if(ctx.mode==='traditional'&&node.status==='Traditional')score+=1;
    if(node.local)score+=2;
    return score;
  }
  function search({mode='general',fields={},language='en',max=5,includePrivate=false}={}){
    const topic=topicOf(fields),method=methodOf(mode,fields),input=[fields.question,fields.facts,fields.options,fields.constraints,fields.decision,fields.environment,fields.site_goal,fields.layout_notes,fields.outside_environment,fields.method_label,fields.topic_label].filter(Boolean).join(' '),ctx={mode,topic,method,language,terms:terms(input)};
    const local=loadLocal().map(localToNode).filter(n=>includePrivate||n.shareWithAnalysis),pool=[...NODES,...local];
    return pool.map(node=>({node,score:scoreNode(node,ctx)})).sort((a,b)=>b.score-a.score||a.node.id.localeCompare(b.node.id)).filter(x=>x.score>0).slice(0,Math.max(1,Math.min(8,Number(max)||5))).map(({node,score})=>({id:node.id,source:node.source,sourceType:node.sourceType,status:node.status,summary:node.summary,score,local:!!node.local}));
  }

  window.GUANSHI_KB=Object.freeze({version:VERSION,nodeCount:NODES.length,storageKey:USER_KEY,search,loadLocal,saveLocal,upsertLocal,removeLocal,clearLocal});
})();
