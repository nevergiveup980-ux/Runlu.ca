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

  const AI = Object.freeze({
    endpoint: 'https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-guanshi-ai',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImVrcm5rbmxhd2VrZW9zenprYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTkxNTMsImV4cCI6MjEwMDE3NTE1M30.MypEa1JShRDE2GqDpNooR1ZmWhkTCDWy22TIjCoNM9w'
  });

  const i18n = {
    en: {
      titleGeneral: 'RUNLU GUANSHI · Consultation',
      titleTraditional: 'RUNLU GUANSHI · Traditional Consultation',
      generated: 'Generated', route: 'Route',
      routeGeneral: 'Start GUANSHI · question first',
      routeTraditional: 'Traditional View · traditional request first',
      note: 'Boundary note',
      noteGeneral: 'Reality and reliable evidence remain the primary basis for practical recommendations. Traditional lenses are optional.',
      noteTraditional: 'Traditional interpretation is recorded separately from factual claims. For practical decisions, reality and reliable evidence remain primary.',
      input: 'INPUT BRIEF', result: 'GUANSHI RESULT', chart: 'CALENDAR / FOUR PILLARS LAYER',
      chartNote: 'Calendar calculation uses the civil date and time entered. No true-solar-time or historical timezone correction is applied; boundary conventions may differ by school.',
      year: 'Year pillar', month: 'Month pillar', day: 'Day pillar', hour: 'Hour pillar', dayMaster: 'Day Master',
      thinking: 'GUANSHI is analyzing the question…',
      error: 'The consultation engine could not complete the analysis',
      retry: 'Your input brief is preserved below. Please try again.',
      copied: 'Copied', copy: 'Copy full consultation',
      submitGeneral: 'Generate GUANSHI result', submitTraditional: 'Generate Traditional View result',
      outputGeneral: 'Your GUANSHI consultation result', outputTraditional: 'Your Traditional View consultation result',
      privacy: 'Privacy V1.3: when you generate a result, the fields you entered are sent to RUNLU’s server-side AI route for processing. This page does not intentionally save the consultation content to a RUNLU consultation database.'
    },
    zh: {
      titleGeneral: 'RUNLU GUANSHI · 观势咨询',
      titleTraditional: 'RUNLU GUANSHI · 传统观势咨询',
      generated: '生成时间', route: '咨询入口',
      routeGeneral: '开始观势 · 先问事',
      routeTraditional: '传统观势 · 先定传统需求',
      note: '边界说明',
      noteGeneral: '现实与可靠证据始终是实际建议的首要依据；传统观察层为可选项。',
      noteTraditional: '传统解释与事实判断分账记录；涉及现实决策时，以现实条件与可靠证据为主。',
      input: '输入摘要', result: '观势结果', chart: '历法 / 四柱计算层',
      chartNote: '四柱按你输入的民用出生日期与时间计算；当前未做真太阳时或历史时区修正，边界时刻不同流派也可能存在差异。',
      year: '年柱', month: '月柱', day: '日柱', hour: '时柱', dayMaster: '日主',
      thinking: '观势正在分析这个问题……',
      error: '观势分析引擎这次没有完成结果',
      retry: '你的输入摘要已经保留在下面，可以稍后再试。',
      copied: '已复制', copy: '复制完整咨询',
      submitGeneral: '生成观势结果', submitTraditional: '生成传统观势结果',
      outputGeneral: '你的观势咨询结果', outputTraditional: '你的传统观势咨询结果',
      privacy: 'V1.3 隐私说明：点击生成结果后，你填写的资料会发送到 RUNLU 的服务器端 AI 通道用于本次分析；本页面不会主动把咨询内容写入 RUNLU 的咨询数据库。'
    },
    fr: {
      titleGeneral: 'RUNLU GUANSHI · Consultation',
      titleTraditional: 'RUNLU GUANSHI · Consultation traditionnelle',
      generated: 'Généré', route: 'Parcours',
      routeGeneral: 'Commencer GUANSHI · question d’abord',
      routeTraditional: 'Vue traditionnelle · demande traditionnelle d’abord',
      note: 'Limite',
      noteGeneral: 'La réalité et les preuves fiables restent la base principale des recommandations pratiques. Les angles traditionnels sont facultatifs.',
      noteTraditional: 'L’interprétation traditionnelle est séparée des faits. Pour les décisions pratiques, réalité et preuves fiables restent prioritaires.',
      input: 'RÉSUMÉ DES DONNÉES', result: 'RÉSULTAT GUANSHI', chart: 'COUCHE CALENDAIRE / QUATRE PILIERS',
      chartNote: 'Le calcul utilise la date et l’heure civiles saisies, sans correction du temps solaire vrai ni du fuseau historique ; les conventions de frontière peuvent varier selon les écoles.',
      year: 'Pilier de l’année', month: 'Pilier du mois', day: 'Pilier du jour', hour: 'Pilier de l’heure', dayMaster: 'Maître du jour',
      thinking: 'GUANSHI analyse la question…',
      error: 'Le moteur de consultation n’a pas pu terminer l’analyse',
      retry: 'Votre résumé de saisie est conservé ci-dessous. Veuillez réessayer.',
      copied: 'Copié', copy: 'Copier la consultation complète',
      submitGeneral: 'Générer le résultat GUANSHI', submitTraditional: 'Générer le résultat traditionnel',
      outputGeneral: 'Votre résultat de consultation GUANSHI', outputTraditional: 'Votre résultat de consultation traditionnelle',
      privacy: 'Confidentialité V1.3 : lorsque vous générez un résultat, les champs saisis sont envoyés vers la voie IA côté serveur de RUNLU pour traitement. Cette page n’enregistre pas intentionnellement le contenu dans une base de consultations RUNLU.'
    },
    es: {
      titleGeneral: 'RUNLU GUANSHI · Consulta',
      titleTraditional: 'RUNLU GUANSHI · Consulta tradicional',
      generated: 'Generado', route: 'Ruta',
      routeGeneral: 'Empezar GUANSHI · primero la pregunta',
      routeTraditional: 'Vista tradicional · primero la solicitud tradicional',
      note: 'Límite',
      noteGeneral: 'La realidad y la evidencia fiable siguen siendo la base principal de las recomendaciones prácticas. Las perspectivas tradicionales son opcionales.',
      noteTraditional: 'La interpretación tradicional se registra aparte de los hechos. Para decisiones prácticas, la realidad y la evidencia fiable siguen siendo prioritarias.',
      input: 'RESUMEN DE ENTRADA', result: 'RESULTADO GUANSHI', chart: 'CAPA CALENDÁRICA / CUATRO PILARES',
      chartNote: 'El cálculo usa la fecha y hora civil introducidas, sin corrección de tiempo solar verdadero ni zona horaria histórica; las convenciones de frontera pueden variar según la escuela.',
      year: 'Pilar del año', month: 'Pilar del mes', day: 'Pilar del día', hour: 'Pilar de la hora', dayMaster: 'Maestro del día',
      thinking: 'GUANSHI está analizando la pregunta…',
      error: 'El motor de consulta no pudo completar el análisis',
      retry: 'Tu resumen de entrada se conserva abajo. Inténtalo de nuevo.',
      copied: 'Copiado', copy: 'Copiar consulta completa',
      submitGeneral: 'Generar resultado GUANSHI', submitTraditional: 'Generar resultado tradicional',
      outputGeneral: 'Tu resultado de consulta GUANSHI', outputTraditional: 'Tu resultado de consulta tradicional',
      privacy: 'Privacidad V1.3: al generar un resultado, los campos introducidos se envían a la ruta de IA del servidor de RUNLU para procesarlos. Esta página no guarda intencionalmente el contenido en una base de consultas RUNLU.'
    }
  };

  const lang = () => {
    const select = document.querySelector('[data-runlu-language-select]');
    return (select && select.value) || localStorage.getItem('runlu_site_language') || 'en';
  };
  const clean = v => (v || '').toString().trim();
  const labelFor = el => el?.tagName === 'SELECT' ? clean(el.options[el.selectedIndex]?.textContent) : clean(el?.value);
  const row = (name, value) => value ? `${name}: ${value}` : '';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function buildGeneral(data) {
    const lines = [], field = name => form.elements[name];
    lines.push(row(field('topicLabel')?.dataset.currentLabel || 'Topic', labelFor(field('topic'))));
    lines.push(row(field('question')?.dataset.summaryLabel || 'Question', clean(data.get('question'))));
    lines.push(row(field('horizonLabel')?.dataset.currentLabel || 'Time horizon', labelFor(field('horizon'))));
    lines.push(row(field('options')?.dataset.summaryLabel || 'Options / alternatives', clean(data.get('options'))));
    lines.push(row(field('facts')?.dataset.summaryLabel || 'Known facts', clean(data.get('facts'))));
    lines.push(row(field('constraints')?.dataset.summaryLabel || 'Constraints', clean(data.get('constraints'))));
    lines.push(row(field('stakesLabel')?.dataset.currentLabel || 'Stakes', labelFor(field('stakes'))));
    lines.push(row(field('traditionalLabel')?.dataset.currentLabel || 'Traditional lens', labelFor(field('traditional'))));
    return lines.filter(Boolean);
  }

  function buildTraditional(data) {
    const lines = [], field = name => form.elements[name];
    lines.push(row(field('methodLabel')?.dataset.currentLabel || 'Traditional method', labelFor(field('method'))));
    lines.push(row(field('topicLabel')?.dataset.currentLabel || 'Topic', labelFor(field('topic'))));
    lines.push(row(field('question')?.dataset.summaryLabel || 'Question', clean(data.get('question'))));
    lines.push(row(field('birth_date')?.dataset.summaryLabel || 'Birth date', clean(data.get('birth_date'))));
    lines.push(row(field('birth_time')?.dataset.summaryLabel || 'Birth time', clean(data.get('birth_time'))));
    lines.push(row(field('birth_place')?.dataset.summaryLabel || 'Birth place', clean(data.get('birth_place'))));
    lines.push(row(field('event_horizon')?.dataset.summaryLabel || 'Event / time horizon', clean(data.get('event_horizon'))));
    lines.push(row(field('environment')?.dataset.summaryLabel || 'Place / environment', clean(data.get('environment'))));
    lines.push(row(field('facts')?.dataset.summaryLabel || 'Known facts', clean(data.get('facts'))));
    lines.push(row(field('decision')?.dataset.summaryLabel || 'Real-world decision', clean(data.get('decision'))));
    return lines.filter(Boolean);
  }

  function payloadFields(data) {
    const fields = {};
    for (const [name, value] of data.entries()) {
      if (name === 'boundary' || name.endsWith('Label')) continue;
      fields[name] = clean(value).slice(0, 3500);
      const el = form.elements[name];
      if (el?.tagName === 'SELECT') fields[`${name}_label`] = labelFor(el).slice(0, 500);
    }
    return fields;
  }

  function localDate() {
    const d = new Date(), pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function chartText(chart, t) {
    if (!chart || chart.error || !chart.four_pillars) return '';
    const p = chart.four_pillars;
    return [
      `【${t.chart}】`,
      `${t.year}: ${p.year}`,
      `${t.month}: ${p.month}`,
      `${t.day}: ${p.day}`,
      `${t.hour}: ${p.hour}`,
      `${t.dayMaster}: ${chart.day_master || ''}`,
      t.chartNote,
      ''
    ].join('\n');
  }

  async function callEngine(fields, l) {
    const response = await fetch(AI.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI.anonKey}`,
        'apikey': AI.anonKey
      },
      body: JSON.stringify({ mode, language: l, fields, client_local_date: localDate() })
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || `GUANSHI AI HTTP ${response.status}`);
    if (!data.result) throw new Error('No consultation result was returned.');
    return data;
  }

  function applyV13Labels() {
    const l = lang(), t = i18n[l] || i18n.en;
    document.querySelectorAll('[data-summary-label-en]').forEach(el => {
      el.dataset.summaryLabel = el.dataset[`summaryLabel${cap(l)}`] || el.dataset.summaryLabelEn;
    });
    document.querySelectorAll('[data-current-label-en]').forEach(el => {
      el.dataset.currentLabel = el.dataset[`currentLabel${cap(l)}`] || el.dataset.currentLabelEn;
    });
    if (copyBtn) copyBtn.textContent = t.copy;
    if (submitBtn) submitBtn.textContent = mode === 'traditional' ? t.submitTraditional : t.submitGeneral;
    if (outputTitle) outputTitle.textContent = mode === 'traditional' ? t.outputTraditional : t.outputGeneral;
    if (privacyNote) {
      privacyNote.dataset.en = i18n.en.privacy;
      privacyNote.dataset.zh = i18n.zh.privacy;
      privacyNote.dataset.fr = i18n.fr.privacy;
      privacyNote.dataset.es = i18n.es.privacy;
      privacyNote.textContent = t.privacy;
    }
    document.querySelectorAll('.consult-kicker').forEach(el => {
      if (el.textContent.includes('RUNLU GUANSHI')) el.textContent = 'RUNLU GUANSHI · V1.3';
    });
    const footerVersion = document.querySelector('.gs-footer > div');
    if (footerVersion?.textContent.includes('RUNLU GUANSHI')) footerVersion.textContent = 'RUNLU GUANSHI · V1.3';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    applyV13Labels();
    const data = new FormData(form), l = lang(), t = i18n[l] || i18n.en;
    const title = mode === 'traditional' ? t.titleTraditional : t.titleGeneral;
    const route = mode === 'traditional' ? t.routeTraditional : t.routeGeneral;
    const note = mode === 'traditional' ? t.noteTraditional : t.noteGeneral;
    const body = mode === 'traditional' ? buildTraditional(data) : buildGeneral(data);
    const timestamp = new Date().toLocaleString(l === 'zh' ? 'zh-CN' : l);
    const brief = [title, '', `${t.generated}: ${timestamp}`, `${t.route}: ${route}`, '', ...body, '', `${t.note}: ${note}`].join('\n');

    output.classList.add('is-visible');
    pre.textContent = `【${t.input}】\n${brief}\n\n【${t.result}】\n${t.thinking}`;
    output.scrollIntoView({behavior:'smooth', block:'nearest'});
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await callEngine(payloadFields(data), l);
      const chart = mode === 'traditional' ? chartText(response.chart, t) : '';
      pre.textContent = `【${t.input}】\n${brief}\n\n${chart}【${t.result}】\n${response.result}`;
    } catch (error) {
      pre.textContent = `【${t.input}】\n${brief}\n\n【${t.result}】\n${t.error}: ${error?.message || String(error)}\n${t.retry}`;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  copyBtn?.addEventListener('click', async () => {
    const text = pre.textContent, l = lang(), t = i18n[l] || i18n.en;
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    const old = copyBtn.textContent;
    copyBtn.textContent = t.copied;
    setTimeout(() => copyBtn.textContent = old, 1400);
  });

  form.addEventListener('reset', () => setTimeout(() => {
    output?.classList.remove('is-visible');
    if (pre) pre.textContent = '';
  }, 0));

  document.querySelector('[data-runlu-language-select]')?.addEventListener('change', () => setTimeout(applyV13Labels, 0));
  window.addEventListener('runlu:languagechange', applyV13Labels);
  applyV13Labels();
})();