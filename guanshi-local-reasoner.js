(() => {
  'use strict';

  const VERSION = '2.1-local-reasoner-v1';
  const METHOD_NAMES = {
    bazi:{en:'Bazi / Four Pillars',zh:'八字 / 四柱',fr:'Bazi / Quatre Piliers',es:'Bazi / Cuatro Pilares'},
    ganzhi:{en:'Ganzhi / timing',zh:'干支 / 时运',fr:'Ganzhi / temporalité',es:'Ganzhi / temporalidad'},
    liuyao:{en:'Six Lines',zh:'六爻',fr:'Six lignes',es:'Seis líneas'},
    meihua:{en:'Meihua',zh:'梅花易数',fr:'Meihua',es:'Meihua'},
    fengshui:{en:'Feng Shui',zh:'风水',fr:'Feng Shui',es:'Feng Shui'},
    mixed:{en:'Mixed traditional view',zh:'综合传统观势',fr:'Vue traditionnelle mixte',es:'Vista tradicional mixta'},
    general:{en:'Reality-first decision view',zh:'现实优先决策观势',fr:'Décision fondée sur la réalité',es:'Decisión basada en la realidad'}
  };

  const T = {
    en:{title:'LOCAL BASELINE · runs in this browser',engine:'Engine',mode:'Mode',question:'Question',known:'What is known',missing:'What is still missing',posture:'Decision posture',next:'Next move',knowledge:'Local knowledge used',uncertainty:'Information uncertainty',low:'low',medium:'medium',high:'high',none:'None supplied yet.',noFacts:'No concrete facts were supplied. Treat any conclusion as provisional and gather observable facts first.',noOptions:'No alternatives were supplied. Define at least two real options, including “do nothing / wait” when appropriate.',noConstraints:'No explicit constraints were supplied. Record budget, time, reversibility and non-negotiables before committing.',highRisk:'High-stakes case: avoid an irreversible commitment on this baseline alone. Prefer a staged test, independent verification and an explicit exit criterion.',mediumRisk:'Medium-stakes case: compare options on evidence, downside, reversibility and timing before committing.',lowRisk:'Low-stakes / reversible case: a small controlled trial is usually more informative than prolonged speculation.',factsPresent:'Concrete facts were supplied; keep them separate from assumptions and interpretations.',optionsPresent:'Multiple alternatives are available; compare them on the same criteria rather than arguing for one in isolation.',constraintsPresent:'Explicit constraints are present; any recommendation that violates them should be downgraded unless the constraint itself is revisited.',traditionalBoundary:'Traditional material is kept in a separate ledger. It may frame questions or hypotheses, but it does not override stronger real-world evidence.',traditionalLocalLimit:'This local engine does not fabricate chart/cast calculations it cannot verify. When cloud calculation is unavailable, it provides only the reality baseline and matched local knowledge.',nextFacts:'Add the 2–3 facts that would most change the decision.',nextCompare:'Compare the live options using the same four columns: evidence, downside, reversibility and timing.',nextPilot:'Choose the smallest reversible action that can produce new evidence.',nextFreeze:'If this contains a testable prediction, freeze it in Validation before the outcome is known.',knowledgeNone:'No relevant local knowledge node was selected.',completeness:'Input completeness',source:'source',status:'status'},
    zh:{title:'本地观势基线 · 完全在当前浏览器运行',engine:'引擎',mode:'模式',question:'核心问题',known:'目前已经知道什么',missing:'还缺什么',posture:'决策姿态',next:'下一步',knowledge:'本地知识调用',uncertainty:'信息不确定度',low:'低',medium:'中',high:'高',none:'目前未提供。',noFacts:'目前没有提供足够具体的现实事实。任何结论都只能视为暂定，应先补充可观察、可核实的事实。',noOptions:'目前没有列出真正的备选方案。至少明确两个选择；必要时把“暂不行动 / 等待”也作为一个方案。',noConstraints:'目前没有明确限制条件。正式行动前应写清预算、时间、可逆性以及不可退让项。',highRisk:'这是高风险决策：不能仅凭本地基线做不可逆承诺。优先采用分阶段试行、独立核验和明确退出条件。',mediumRisk:'这是中等风险决策：先按证据、下行风险、可逆性和时间四个维度比较方案，再决定。',lowRisk:'这是低风险 / 易撤回决策：与其长时间猜测，不如做一个小规模、可控、可撤回的试验来获得新证据。',factsPresent:'已经提供了现实事实；应继续把事实与假设、解释分开记账。',optionsPresent:'存在多个备选方案；应使用同一套标准横向比较，而不是只为其中一个方案寻找理由。',constraintsPresent:'已经存在明确限制条件；任何违反这些限制的建议都应降权，除非先重新审视限制本身。',traditionalBoundary:'传统材料单独记账。它可以帮助提出问题或假设，但不能压过更强的现实证据。',traditionalLocalLimit:'本地引擎不会伪造自己无法核验的排盘或起卦计算。云端计算不可用时，只提供现实基线与匹配到的本地知识。',nextFacts:'补充最可能改变判断的 2–3 条现实事实。',nextCompare:'把现有方案放到同一张表里比较：证据、下行风险、可逆性、时间。',nextPilot:'选择一个最小、可撤回、能够产生新证据的行动。',nextFreeze:'如果这里包含可检验预测，在结果揭晓前送入验证台冻结。',knowledgeNone:'没有检索到需要参与本次基线的本地知识节点。',completeness:'输入完整度',source:'来源',status:'等级'},
    fr:{title:'BASE LOCALE · exécutée dans ce navigateur',engine:'Moteur',mode:'Mode',question:'Question',known:'Ce qui est connu',missing:'Ce qui manque encore',posture:'Posture de décision',next:'Prochaine étape',knowledge:'Connaissances locales utilisées',uncertainty:'Incertitude informationnelle',low:'faible',medium:'moyenne',high:'élevée',none:'Non fourni.',noFacts:'Aucun fait concret n’a été fourni. Toute conclusion reste provisoire ; recueillez d’abord des faits observables.',noOptions:'Aucune alternative réelle n’est indiquée. Définissez au moins deux options, y compris attendre lorsque cela est pertinent.',noConstraints:'Aucune contrainte explicite n’est indiquée. Notez budget, temps, réversibilité et impératifs avant de vous engager.',highRisk:'Décision à fort enjeu : évitez un engagement irréversible sur cette seule base. Préférez un test par étapes, une vérification indépendante et un critère de sortie.',mediumRisk:'Enjeu moyen : comparez les options selon les preuves, le risque, la réversibilité et le calendrier.',lowRisk:'Enjeu faible / réversible : un petit essai contrôlé apporte souvent plus qu’une longue spéculation.',factsPresent:'Des faits concrets sont fournis ; gardez-les séparés des hypothèses et interprétations.',optionsPresent:'Plusieurs alternatives existent ; comparez-les avec les mêmes critères.',constraintsPresent:'Des contraintes explicites existent ; toute recommandation qui les viole doit être déclassée sauf révision préalable.',traditionalBoundary:'La couche traditionnelle reste séparée. Elle peut suggérer des hypothèses, sans dépasser des preuves réelles plus solides.',traditionalLocalLimit:'Le moteur local n’invente pas de calcul de thème ou de tirage qu’il ne peut vérifier. Sans calcul cloud, il fournit uniquement la base réelle et les connaissances locales pertinentes.',nextFacts:'Ajoutez les 2–3 faits qui pourraient le plus changer la décision.',nextCompare:'Comparez les options selon quatre colonnes : preuves, risque, réversibilité et calendrier.',nextPilot:'Choisissez la plus petite action réversible capable de produire de nouvelles preuves.',nextFreeze:'Pour une prévision testable, figez-la dans Validation avant de connaître le résultat.',knowledgeNone:'Aucun nœud local pertinent n’a été sélectionné.',completeness:'Complétude des données',source:'source',status:'statut'},
    es:{title:'LÍNEA BASE LOCAL · se ejecuta en este navegador',engine:'Motor',mode:'Modo',question:'Pregunta',known:'Lo que se sabe',missing:'Lo que falta',posture:'Postura de decisión',next:'Siguiente paso',knowledge:'Conocimiento local usado',uncertainty:'Incertidumbre de información',low:'baja',medium:'media',high:'alta',none:'No proporcionado.',noFacts:'No se aportaron hechos concretos. Cualquier conclusión es provisional; reúne primero hechos observables.',noOptions:'No se indicaron alternativas reales. Define al menos dos opciones, incluida esperar cuando corresponda.',noConstraints:'No se indicaron restricciones explícitas. Registra presupuesto, tiempo, reversibilidad y condiciones no negociables antes de comprometerte.',highRisk:'Caso de alto riesgo: evita un compromiso irreversible basándote solo en esta línea base. Prefiere una prueba por etapas, verificación independiente y un criterio de salida.',mediumRisk:'Riesgo medio: compara las opciones por evidencia, riesgo, reversibilidad y tiempo antes de comprometerte.',lowRisk:'Riesgo bajo / reversible: una prueba pequeña y controlada suele informar más que especular durante mucho tiempo.',factsPresent:'Se aportaron hechos concretos; mantenlos separados de supuestos e interpretaciones.',optionsPresent:'Hay varias alternativas; compáralas con los mismos criterios.',constraintsPresent:'Hay restricciones explícitas; cualquier recomendación que las viole debe perder peso salvo que primero se reevalúe la restricción.',traditionalBoundary:'La capa tradicional se mantiene separada. Puede sugerir preguntas o hipótesis, pero no supera evidencia real más sólida.',traditionalLocalLimit:'El motor local no inventa cálculos de carta o tirada que no pueda verificar. Sin cálculo en la nube, solo ofrece la base de realidad y conocimiento local relevante.',nextFacts:'Añade los 2–3 hechos que más podrían cambiar la decisión.',nextCompare:'Compara las opciones con cuatro columnas: evidencia, riesgo, reversibilidad y tiempo.',nextPilot:'Elige la acción reversible más pequeña que pueda producir evidencia nueva.',nextFreeze:'Si hay una predicción comprobable, congélala en Validación antes de conocer el resultado.',knowledgeNone:'No se seleccionó ningún nodo local relevante.',completeness:'Completitud de datos',source:'fuente',status:'estado'}
  };

  const clean=(v,max=2200)=>String(v??'').trim().slice(0,max);
  const splitItems=v=>clean(v).split(/\n+|[;；]+/).map(x=>x.trim()).filter(Boolean).slice(0,8);
  const langOf=l=>['en','zh','fr','es'].includes(l)?l:'en';
  const nonEmpty=v=>clean(v).length>0;
  const bullet=(s)=>`• ${s}`;
  const section=(title,items)=>[title,...(items.length?items:[bullet('—')]),''];
  const labelMethod=(method,l)=>METHOD_NAMES[method]?.[l]||METHOD_NAMES.general[l];

  function completeness(fields,mode){
    const checks=mode==='traditional'
      ? [fields.question,fields.facts,fields.decision,fields.environment||fields.layout_notes||fields.site_goal,fields.method]
      : [fields.question,fields.facts,fields.options,fields.constraints,fields.horizon];
    return Math.round(checks.filter(nonEmpty).length/checks.length*100);
  }

  function analyze({mode='general',fields={},knowledge=[],language='en'}={}){
    const l=langOf(language),t=T[l],method=mode==='traditional'?clean(fields.method)||'mixed':'general',facts=splitItems(fields.facts),options=splitItems(fields.options),constraints=splitItems(fields.constraints),known=[],missing=[],posture=[],next=[];
    const stakes=clean(fields.stakes)||'medium',score=completeness(fields,mode);

    known.push(nonEmpty(fields.question)?bullet(`${t.question}: ${clean(fields.question,500)}`):bullet(`${t.question}: —`));
    if(facts.length){ known.push(...facts.slice(0,4).map(x=>bullet(x)),bullet(t.factsPresent)); } else missing.push(bullet(t.noFacts));
    if(mode==='general'){
      if(options.length){ known.push(bullet(t.optionsPresent),...options.slice(0,4).map(x=>bullet(x))); } else missing.push(bullet(t.noOptions));
      if(constraints.length){ known.push(bullet(t.constraintsPresent),...constraints.slice(0,3).map(x=>bullet(x))); } else missing.push(bullet(t.noConstraints));
    }else{
      if(nonEmpty(fields.decision)) known.push(bullet(`${t.posture}: ${clean(fields.decision,500)}`));
      else missing.push(bullet(t.noOptions));
      known.push(bullet(t.traditionalBoundary));
      missing.push(bullet(t.traditionalLocalLimit));
    }

    posture.push(bullet(stakes==='high'?t.highRisk:stakes==='low'?t.lowRisk:t.mediumRisk));
    if(score<55) next.push(bullet(t.nextFacts));
    if(mode==='general'&&options.length>1) next.push(bullet(t.nextCompare));
    next.push(bullet(t.nextPilot));
    next.push(bullet(t.nextFreeze));

    const uncertainty=score>=80?t.low:score>=55?t.medium:t.high;
    const k=(Array.isArray(knowledge)?knowledge:[]).slice(0,5);
    const knowledgeLines=k.length?k.map(x=>bullet(`${x.id} · ${t.status}: ${x.status||'—'} · ${t.source}: ${x.source||'—'}\n  ${clean(x.summary,420)}`)):[bullet(t.knowledgeNone)];
    const lines=[
      t.title,
      `${t.engine}: ${VERSION}`,
      `${t.mode}: ${labelMethod(method,l)}`,
      `${t.completeness}: ${score}% · ${t.uncertainty}: ${uncertainty}`,
      '',
      ...section(t.known,known),
      ...section(t.missing,missing),
      ...section(t.posture,posture),
      ...section(t.next,next),
      ...section(t.knowledge,knowledgeLines)
    ];
    return {version:VERSION,mode,method,language:l,completeness:score,uncertainty,knowledgeIds:k.map(x=>x.id),text:lines.join('\n').trim()};
  }

  window.GUANSHI_LOCAL_REASONER=Object.freeze({version:VERSION,analyze});
})();