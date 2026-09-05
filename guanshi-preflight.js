(() => {
  const form = document.querySelector('[data-guanshi-consult-form]');
  if (!form) return;

  const mode = document.body.dataset.consultMode || 'general';
  const actions = form.querySelector('.consult-actions');
  let panel = null;

  const UI = {
    en: {
      title: 'A few details would materially improve this judgment',
      intro: 'GUANSHI found 2–3 missing points that could change the answer. Add what you know; “not sure” is a valid answer.',
      noCost: 'This clarification step does not call AI and does not use one of today’s free analyses.',
      continue: 'Add details & continue',
      skip: 'Analyze with current information',
      required: 'Please answer this, or write “not sure”.',
      block: 'INTELLIGENT FOLLOW-UP ANSWERS'
    },
    zh: {
      title: '再补几个关键点，判断会明显更靠谱',
      intro: '观势发现还有 2–3 个资料点可能真正改变结论。知道多少写多少；确实不知道，直接写“不知道”也可以。',
      noCost: '这一轮追问不会调用 AI，也不会占用今天的免费观势次数。',
      continue: '补充后继续分析',
      skip: '按现有资料直接分析',
      required: '请补充这一项；确实不知道可以填写“不知道”。',
      block: '智能追问补充'
    },
    fr: {
      title: 'Quelques précisions pourraient changer sensiblement le jugement',
      intro: 'GUANSHI a détecté 2–3 informations manquantes susceptibles de modifier la conclusion. Répondez avec ce que vous savez ; « je ne sais pas » est acceptable.',
      noCost: 'Cette étape de clarification n’appelle pas l’IA et ne consomme pas une analyse gratuite.',
      continue: 'Ajouter les précisions et continuer',
      skip: 'Analyser avec les informations actuelles',
      required: 'Répondez, ou indiquez « je ne sais pas ».',
      block: 'RÉPONSES AUX QUESTIONS DE CLARIFICATION'
    },
    es: {
      title: 'Unos pocos datos podrían mejorar mucho este juicio',
      intro: 'GUANSHI detectó 2–3 datos faltantes que podrían cambiar la conclusión. Añade lo que sepas; “no lo sé” es una respuesta válida.',
      noCost: 'Esta aclaración no llama a la IA ni consume uno de los análisis gratuitos de hoy.',
      continue: 'Añadir datos y continuar',
      skip: 'Analizar con la información actual',
      required: 'Responde o escribe “no lo sé”.',
      block: 'RESPUESTAS DE ACLARACIÓN'
    }
  };

  const Q = (key, en, zh, fr, es) => ({ key, en, zh, fr, es });
  const clean = v => (v || '').toString().trim();
  const currentLang = () => document.querySelector('[data-runlu-language-select]')?.value || localStorage.getItem('runlu_site_language') || 'en';
  const field = name => form.elements[name];
  const val = name => clean(field(name)?.value);
  const short = (name, n = 12) => val(name).length < n;
  const hasTimeLanguage = text => /(今年|明年|未来|年底|年内|几个月|本月|下月|this year|next year|within the year|months?|by year.?end|cette année|l’année prochaine|mois|este año|próximo año|meses?)/i.test(text || '');
  const hasDirectionLanguage = text => /(朝向|方位|坐向|门向|大门|床头|方向|罗盘|facing|orientation|direction|compass|door|bed|orientation|direction|boussole|puerta|cama|brújula)/i.test(text || '');

  function generalQuestions() {
    const topic = val('topic') || 'other';
    const question = val('question');
    const horizon = val('horizon');
    const needsHorizon = horizon === 'open' || (horizon === 'now' && hasTimeLanguage(question));
    const list = [];

    if (topic === 'career') {
      if (short('facts', 18)) list.push(Q('career_now',
        'What is your current role, approximate compensation level, and the main reason you are considering a change?',
        '你现在是什么岗位、收入大致处于什么水平？这次考虑换工作的主要原因是什么？',
        'Quel est votre poste actuel, votre niveau approximatif de rémunération et la raison principale d’un changement ?',
        '¿Cuál es tu puesto actual, tu nivel aproximado de ingresos y la razón principal por la que consideras cambiar?'));
      if (short('options', 12)) list.push(Q('career_alt',
        'Do you already have a concrete alternative or offer? If yes, how do pay, stability, commute and growth differ from your current job?',
        '你手里已经有具体的替代岗位或 offer 吗？如果有，薪资、稳定性、通勤和发展空间与现在相比差多少？',
        'Avez-vous déjà une alternative ou une offre concrète ? Si oui, comment diffèrent salaire, stabilité, trajet et évolution ?',
        '¿Ya tienes una alternativa u oferta concreta? Si es así, ¿cómo cambian sueldo, estabilidad, trayecto y crecimiento?'));
      if (needsHorizon) list.push(Q('career_time',
        'By when do you need to decide — leave now, start searching, or make a move sometime within the year?',
        '你真正要决定的时间点是什么——现在就走、现在开始找，还是今年某个阶段再换？',
        'À quelle échéance devez-vous décider : partir maintenant, commencer à chercher ou changer plus tard dans l’année ?',
        '¿Cuándo necesitas decidir: salir ahora, empezar a buscar o cambiar en algún momento del año?'));
      if (short('constraints', 12)) list.push(Q('career_constraint',
        'What is the hardest constraint or non-negotiable: income, stability, location/commute, family time, benefits, or growth?',
        '你最不能牺牲的一项是什么：收入、稳定性、地点/通勤、家庭时间、福利，还是发展空间？',
        'Quelle contrainte est non négociable : revenu, stabilité, lieu/trajet, temps familial, avantages ou évolution ?',
        '¿Qué condición no puedes sacrificar: ingresos, estabilidad, ubicación/traslado, tiempo familiar, beneficios o crecimiento?'));
    } else if (topic === 'business') {
      if (short('facts', 18)) list.push(Q('business_now',
        'What is the current state of the business/project: revenue or traction, team/resources, and the biggest current bottleneck?',
        '这个生意/项目现在处于什么状态：收入或进展、现有资源/团队，以及最大的卡点是什么？',
        'Quel est l’état actuel du projet : revenus ou traction, ressources/équipe et principal blocage ?',
        '¿Cuál es el estado actual del negocio/proyecto: ingresos o tracción, recursos/equipo y principal cuello de botella?'));
      if (short('options', 12)) list.push(Q('business_options',
        'What concrete alternatives are you comparing, including the option of doing nothing for now?',
        '你现在真正比较的是哪几个方案？也请把“暂时不动”算作一个方案。',
        'Quelles alternatives concrètes comparez-vous, y compris ne rien changer pour l’instant ?',
        '¿Qué alternativas concretas comparas, incluida la opción de no cambiar nada por ahora?'));
      if (short('constraints', 12)) list.push(Q('business_limits',
        'What are the hard limits on money, time, staffing, downside or cash flow?',
        '资金、时间、人手、现金流或最大可承受损失，有哪些硬限制？',
        'Quelles sont les limites fermes de budget, temps, personnel, trésorerie ou perte acceptable ?',
        '¿Cuáles son los límites duros de dinero, tiempo, personal, flujo de caja o pérdida aceptable?'));
      if (needsHorizon) list.push(Q('business_time',
        'What decision deadline or review window should this judgment use?',
        '这次判断应该以什么决策截止时间或复盘周期为准？',
        'Quelle échéance de décision ou fenêtre de révision faut-il utiliser ?',
        '¿Qué fecha límite o periodo de revisión debe usar este juicio?'));
    } else if (topic === 'relationship') {
      if (short('facts', 18)) list.push(Q('relationship_now',
        'What is the current relationship/cooperation status, and what changed recently enough to trigger this question?',
        '目前这段关系/合作处于什么状态？最近发生了什么变化，才让你现在提出这个问题？',
        'Quel est l’état actuel de la relation/cooperation et quel changement récent a déclenché cette question ?',
        '¿Cuál es el estado actual de la relación/cooperación y qué cambió recientemente para provocar esta pregunta?'));
      if (short('options', 12)) list.push(Q('relationship_goal',
        'What outcome are you actually choosing among: repair, pause, continue as-is, set a boundary, or leave?',
        '你真正要在什么结果之间选择：修复、暂停、维持现状、设边界，还是退出？',
        'Entre quels résultats choisissez-vous réellement : réparer, faire une pause, continuer, poser une limite ou partir ?',
        '¿Entre qué resultados eliges realmente: reparar, pausar, seguir igual, poner límites o salir?'));
      if (needsHorizon) list.push(Q('relationship_time',
        'What time window would make the answer useful — days, weeks, months, or a specific date?',
        '多长的时间范围才对你有用——几天、几周、几个月，还是某个具体日期？',
        'Quelle fenêtre de temps rendrait la réponse utile : jours, semaines, mois ou date précise ?',
        '¿Qué horizonte haría útil la respuesta: días, semanas, meses o una fecha concreta?'));
      if (short('constraints', 12)) list.push(Q('relationship_boundary',
        'What boundary or condition would make the recommendation change?',
        '哪一条底线或条件一旦出现，会让你的决定发生改变？',
        'Quelle limite ou condition ferait changer la recommandation ?',
        '¿Qué límite o condición haría cambiar la recomendación?'));
    } else if (topic === 'home') {
      if (short('facts', 18)) list.push(Q('home_now',
        'What are the current site/home conditions that matter most — location, layout, light, noise, access, maintenance or another issue?',
        '目前住房/场地最重要的现实条件是什么——位置、布局、采光、噪音、出入、维护，还是别的问题？',
        'Quelles conditions du lieu comptent le plus : emplacement, plan, lumière, bruit, accès, entretien ou autre ?',
        '¿Qué condiciones del lugar importan más: ubicación, distribución, luz, ruido, acceso, mantenimiento u otra?'));
      if (short('options', 12)) list.push(Q('home_options',
        'What concrete choices are you comparing: stay, renovate, move, buy, sell, or choose between specific places?',
        '你真正比较的是哪些选择：继续住、装修、搬家、买、卖，还是几个具体地点之间选择？',
        'Quelles options comparez-vous : rester, rénover, déménager, acheter, vendre ou choisir entre plusieurs lieux ?',
        '¿Qué opciones comparas: quedarte, reformar, mudarte, comprar, vender o elegir entre lugares concretos?'));
      if (short('constraints', 12)) list.push(Q('home_limits',
        'What are the budget, timing and non-negotiable constraints?',
        '预算、时间以及不能妥协的条件分别是什么？',
        'Quelles sont les contraintes de budget, calendrier et les éléments non négociables ?',
        '¿Cuáles son las restricciones de presupuesto, tiempo y condiciones no negociables?'));
    } else {
      if (short('facts', 18)) list.push(Q('generic_facts',
        'What facts are already known for certain, and what changed recently?',
        '目前哪些事实已经确定？最近又发生了什么变化？',
        'Quels faits sont déjà certains et qu’est-ce qui a changé récemment ?',
        '¿Qué hechos ya son seguros y qué cambió recientemente?'));
      if (short('options', 12)) list.push(Q('generic_options',
        'What concrete alternatives are you actually choosing between?',
        '你现在真正是在几个什么具体选项之间做选择？',
        'Entre quelles alternatives concrètes choisissez-vous réellement ?',
        '¿Entre qué alternativas concretas estás eligiendo realmente?'));
      if (needsHorizon) list.push(Q('generic_time',
        'What time horizon or decision deadline should the answer use?',
        '这次判断应该以多长的时间范围或哪个截止时间为准？',
        'Quel horizon ou quelle échéance faut-il utiliser ?',
        '¿Qué horizonte o fecha límite debe usar la respuesta?'));
      if (short('constraints', 12)) list.push(Q('generic_limits',
        'What constraint, downside or non-negotiable matters most?',
        '最重要的限制、风险或不可妥协项是什么？',
        'Quelle contrainte, quel risque ou quel élément non négociable compte le plus ?',
        '¿Qué restricción, riesgo o condición no negociable importa más?'));
    }
    return list.slice(0, 3);
  }

  function traditionalQuestions() {
    const method = val('method') || 'mixed';
    const question = val('question');
    const list = [];

    if (method === 'bazi') {
      if (!val('birth_time')) list.push(Q('bazi_time',
        'If you know it, what is the birth time or at least the approximate two-hour period? If unknown, say so.',
        '如果知道，请补充出生时间，至少给出大致的两个小时时段；确实不知道就写“不知道”。',
        'Si vous la connaissez, indiquez l’heure de naissance ou au moins la tranche de deux heures ; sinon dites-le.',
        'Si la sabes, indica la hora de nacimiento o al menos el tramo aproximado de dos horas; si no, dilo.'));
      if (short('facts', 18)) list.push(Q('bazi_context',
        'What current real-world situation is most relevant to this Bazi question?',
        '和这次八字问题最相关的现实处境是什么？请说当前状态，而不是只写出生资料。',
        'Quelle situation réelle actuelle est la plus pertinente pour cette question Bazi ?',
        '¿Qué situación real actual es más relevante para esta pregunta de Bazi?'));
      if (short('decision', 12) && val('topic') !== 'life') list.push(Q('bazi_decision',
        'Is there a real decision behind this reading? If yes, what action are you considering?',
        '这次八字咨询背后有没有真正要做的决定？如果有，你正在考虑采取什么行动？',
        'Y a-t-il une décision réelle derrière cette lecture ? Si oui, quelle action envisagez-vous ?',
        '¿Hay una decisión real detrás de esta lectura? Si la hay, ¿qué acción consideras?'));
    } else if (method === 'timing') {
      if (!val('event_horizon')) list.push(Q('timing_window',
        'What exact period or deadline should the timing analysis cover?',
        '这次时运判断到底要看哪个具体阶段或截止时间？',
        'Quelle période ou échéance exacte l’analyse temporelle doit-elle couvrir ?',
        '¿Qué periodo o fecha límite exacta debe cubrir el análisis temporal?'));
      if (short('facts', 18)) list.push(Q('timing_facts',
        'What real-world conditions are already in motion during this period?',
        '这个阶段现实中已经有哪些事情在推进、变化或形成约束？',
        'Quelles conditions réelles sont déjà en mouvement pendant cette période ?',
        '¿Qué condiciones reales ya están en marcha durante ese periodo?'));
      if (short('decision', 12)) list.push(Q('timing_decision',
        'What decision or action depends on the timing judgment?',
        '你准备根据这个时运判断做什么现实决定或行动？',
        'Quelle décision ou action dépend de ce jugement de timing ?',
        '¿Qué decisión o acción depende de este juicio temporal?'));
    } else if (method === 'liuyao' || method === 'meihua') {
      if (question.length < 14) list.push(Q('event_exact',
        'State the event in a way that can later be judged clearly: what exactly would count as “yes” or “no”?',
        '请把事件问到以后能明确判定：到底什么结果算“是”，什么结果算“否”？',
        'Formulez l’événement de façon vérifiable : qu’est-ce qui comptera exactement comme « oui » ou « non » ?',
        'Formula el evento de forma verificable: ¿qué contará exactamente como “sí” o “no”?'));
      if (short('facts', 18)) list.push(Q('event_baseline',
        'Before casting, what relevant facts, base rates or leading indicators are already known?',
        '起卦以前，现实中已经知道哪些相关事实、基础概率或领先信号？',
        'Avant le tirage, quels faits, taux de base ou indicateurs avancés sont déjà connus ?',
        'Antes del cálculo, ¿qué hechos, tasas base o indicadores adelantados ya se conocen?'));
      if (short('decision', 12)) list.push(Q('event_action',
        'What action, if any, will you take differently depending on this result?',
        '这个结果出来以后，你可能因此改变什么行动？如果不会改变，也请说明。',
        'Quelle action changera éventuellement selon ce résultat ?',
        '¿Qué acción cambiarías, si alguna, según este resultado?'));
    } else if (method === 'fengshui') {
      if (!val('site_goal')) list.push(Q('feng_goal',
        'What exact outcome are you trying to improve in this space: comfort, sleep environment, work flow, privacy, access, layout efficiency, or something else?',
        '你真正想改善这个空间的什么结果：舒适度、睡眠环境、工作动线、隐私、出入、布局效率，还是别的？',
        'Quel résultat précis voulez-vous améliorer : confort, environnement de sommeil, circulation, intimité, accès, efficacité du plan ou autre ?',
        '¿Qué resultado exacto quieres mejorar: confort, entorno de sueño, circulación, privacidad, acceso, eficiencia del espacio u otro?'));
      if (hasDirectionLanguage(question) && !val('facing_degrees')) list.push(Q('feng_facing',
        'If direction matters to the question, what is the facing degree (0–359°) and how was it measured?',
        '如果这个问题确实涉及方位，请补充朝向度数（0–359°）以及这个度数是怎么测出来的。',
        'Si la direction compte, quel est le degré d’orientation (0–359°) et comment a-t-il été mesuré ?',
        'Si la orientación importa, ¿cuál es el grado (0–359°) y cómo se midió?'));
      if (!val('layout_notes') && !val('outside_environment')) list.push(Q('feng_layout',
        'Describe the key layout and surroundings: entrances, main rooms, windows, roads/buildings/water, and any obvious light, noise, moisture or circulation issue.',
        '请补充关键布局和外围：入口、主要房间、窗户、道路/建筑/水体，以及明显的采光、噪音、潮湿或动线问题。',
        'Décrivez le plan et l’environnement : entrées, pièces principales, fenêtres, routes/bâtiments/eau et problèmes de lumière, bruit, humidité ou circulation.',
        'Describe la distribución y el entorno: entradas, habitaciones principales, ventanas, carreteras/edificios/agua y problemas de luz, ruido, humedad o circulación.'));
      if (list.length < 3 && short('facts', 18)) list.push(Q('feng_facts',
        'What measured or directly observed environmental facts do you already have?',
        '你已经掌握哪些实际测量或直接观察到的环境事实？',
        'Quelles données environnementales mesurées ou directement observées avez-vous déjà ?',
        '¿Qué datos ambientales medidos u observados directamente ya tienes?'));
    } else {
      if (short('facts', 18)) list.push(Q('mixed_context',
        'What current real-world context should the traditional layer be compared against?',
        '传统层应该和哪一段现实处境进行对照？请补充当前事实。',
        'À quel contexte réel actuel faut-il comparer la couche traditionnelle ?',
        '¿Con qué contexto real actual debe compararse la capa tradicional?'));
      if (short('decision', 12)) list.push(Q('mixed_decision',
        'What real decision, if any, sits behind this request?',
        '这个传统咨询背后真正要决定的事情是什么？如果只是了解，也可以说明。',
        'Quelle décision réelle se trouve derrière cette demande, s’il y en a une ?',
        '¿Qué decisión real hay detrás de esta solicitud, si la hay?'));
      list.push(Q('mixed_focus',
        'Which traditional angle matters most to you: person/time (Bazi), event forecast (Six Lines/Meihua), timing, or environment (Feng Shui)?',
        '你最想重点看哪一类传统角度：人与时间（八字）、事件预测（六爻/梅花）、时运，还是环境（风水）？',
        'Quel angle traditionnel vous importe le plus : personne/temps (Bazi), événement (Six lignes/Meihua), timing ou environnement (Feng shui) ?',
        '¿Qué enfoque tradicional te importa más: persona/tiempo (Bazi), evento (Seis líneas/Meihua), tiempo o entorno (Feng Shui)?'));
    }
    return list.slice(0, 3);
  }

  function questionsForCurrentForm() {
    return mode === 'traditional' ? traditionalQuestions() : generalQuestions();
  }

  function removePanel() {
    panel?.remove();
    panel = null;
  }

  function addAnswersToFacts(questions, answers, l) {
    const facts = field('facts');
    if (!facts) return;
    const t = UI[l] || UI.en;
    const lines = [`【${t.block}】`];
    questions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q[l] || q.en}`);
      lines.push(answers[i]);
    });
    const block = lines.join('\n');
    facts.value = [clean(facts.value), block].filter(Boolean).join('\n\n');
  }

  function finishPreflight() {
    form.dataset.guanshiPreflightComplete = '1';
    removePanel();
    form.requestSubmit();
  }

  function showPanel(questions) {
    removePanel();
    const l = currentLang();
    const t = UI[l] || UI.en;
    panel = document.createElement('section');
    panel.className = 'guanshi-preflight';
    panel.dataset.guanshiPreflightPanel = '';
    panel.innerHTML = `
      <div class="preflight-head">
        <span class="preflight-kicker">GUANSHI · INFORMATION CHECK</span>
        <h3>${t.title}</h3>
        <p>${t.intro}</p>
        <small>${t.noCost}</small>
      </div>
      <div class="preflight-questions"></div>
      <div class="preflight-actions">
        <button type="button" class="consult-btn" data-preflight-continue>${t.continue}</button>
        <button type="button" class="consult-btn secondary" data-preflight-skip>${t.skip}</button>
      </div>`;

    const holder = panel.querySelector('.preflight-questions');
    questions.forEach((q, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'preflight-question';
      wrap.innerHTML = `<label for="guanshi-preflight-${i}"><b>${i + 1}</b><span>${q[l] || q.en}</span></label><textarea id="guanshi-preflight-${i}" data-preflight-answer rows="3"></textarea><small data-preflight-error hidden>${t.required}</small>`;
      holder.appendChild(wrap);
    });

    actions?.before(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });

    panel.querySelector('[data-preflight-continue]')?.addEventListener('click', () => {
      const inputs = [...panel.querySelectorAll('[data-preflight-answer]')];
      const answers = inputs.map(el => clean(el.value));
      let valid = true;
      inputs.forEach((el, i) => {
        const err = el.parentElement?.querySelector('[data-preflight-error]');
        const missing = !answers[i];
        el.classList.toggle('is-missing', missing);
        if (err) err.hidden = !missing;
        if (missing) valid = false;
      });
      if (!valid) return;
      addAnswersToFacts(questions, answers, l);
      finishPreflight();
    });

    panel.querySelector('[data-preflight-skip]')?.addEventListener('click', finishPreflight);
  }

  form.addEventListener('submit', e => {
    if (form.dataset.guanshiPreflightComplete === '1') return;
    const questions = questionsForCurrentForm();
    if (!questions.length) {
      form.dataset.guanshiPreflightComplete = '1';
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    showPanel(questions);
  }, true);

  const invalidate = e => {
    if (e.target?.closest?.('[data-guanshi-preflight-panel]')) return;
    delete form.dataset.guanshiPreflightComplete;
    removePanel();
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('reset', () => {
    delete form.dataset.guanshiPreflightComplete;
    removePanel();
  });
})();
