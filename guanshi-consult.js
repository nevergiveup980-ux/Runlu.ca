(() => {
  const form = document.querySelector('[data-guanshi-consult-form]');
  if (!form) return;

  const output = document.querySelector('[data-consult-output]');
  const pre = document.querySelector('[data-consult-summary]');
  const copyBtn = document.querySelector('[data-copy-summary]');
  const mode = document.body.dataset.consultMode || 'general';

  const i18n = {
    en: {
      titleGeneral: 'RUNLU GUANSHI · Consultation Brief',
      titleTraditional: 'RUNLU GUANSHI · Traditional Consultation Brief',
      generated: 'Prepared',
      route: 'Route',
      routeGeneral: 'Start GUANSHI · question first',
      routeTraditional: 'Traditional View · traditional request first',
      note: 'Note',
      noteGeneral: 'Reality and evidence remain the primary basis for practical recommendations. Traditional lenses are optional.',
      noteTraditional: 'Traditional interpretation is recorded separately from factual claims. For practical decisions, reality and evidence remain controlling.',
      copied: 'Copied',
      copy: 'Copy brief'
    },
    zh: {
      titleGeneral: 'RUNLU GUANSHI · 观势咨询摘要',
      titleTraditional: 'RUNLU GUANSHI · 传统观势咨询摘要',
      generated: '生成时间',
      route: '咨询入口',
      routeGeneral: '开始观势 · 先问事',
      routeTraditional: '传统观势 · 先定传统需求',
      note: '说明',
      noteGeneral: '现实与可靠证据始终是实际建议的首要依据；传统观察层为可选项。',
      noteTraditional: '传统解释与事实判断分账记录；涉及现实决策时，以现实条件与可靠证据为准。',
      copied: '已复制',
      copy: '复制咨询摘要'
    },
    fr: {
      titleGeneral: 'RUNLU GUANSHI · Résumé de consultation',
      titleTraditional: 'RUNLU GUANSHI · Résumé de consultation traditionnelle',
      generated: 'Préparé',
      route: 'Parcours',
      routeGeneral: 'Commencer GUANSHI · question d’abord',
      routeTraditional: 'Vue traditionnelle · demande traditionnelle d’abord',
      note: 'Note',
      noteGeneral: 'La réalité et les preuves restent la base principale des recommandations pratiques. Les angles traditionnels sont facultatifs.',
      noteTraditional: 'L’interprétation traditionnelle est séparée des faits. Pour les décisions pratiques, réalité et preuves gardent la priorité.',
      copied: 'Copié',
      copy: 'Copier le résumé'
    },
    es: {
      titleGeneral: 'RUNLU GUANSHI · Resumen de consulta',
      titleTraditional: 'RUNLU GUANSHI · Resumen de consulta tradicional',
      generated: 'Preparado',
      route: 'Ruta',
      routeGeneral: 'Empezar GUANSHI · primero la pregunta',
      routeTraditional: 'Vista tradicional · primero la solicitud tradicional',
      note: 'Nota',
      noteGeneral: 'La realidad y la evidencia siguen siendo la base principal de las recomendaciones prácticas. Las perspectivas tradicionales son opcionales.',
      noteTraditional: 'La interpretación tradicional se registra aparte de los hechos. Para decisiones prácticas, mandan la realidad y la evidencia.',
      copied: 'Copiado',
      copy: 'Copiar resumen'
    }
  };

  const lang = () => {
    const select = document.querySelector('[data-runlu-language-select]');
    return (select && select.value) || localStorage.getItem('runlu_site_language') || 'en';
  };

  const clean = v => (v || '').toString().trim();
  const labelFor = el => {
    if (!el) return '';
    if (el.tagName === 'SELECT') return clean(el.options[el.selectedIndex]?.textContent);
    return clean(el.value);
  };

  const row = (name, value) => value ? `${name}: ${value}` : '';

  function buildGeneral(data) {
    const lines = [];
    const field = name => form.elements[name];
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
    const lines = [];
    const field = name => form.elements[name];
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

  function syncSummaryLabels() {
    const l = lang();
    document.querySelectorAll('[data-summary-label-en]').forEach(el => {
      el.dataset.summaryLabel = el.dataset[`summaryLabel${l.charAt(0).toUpperCase()+l.slice(1)}`] || el.dataset.summaryLabelEn;
    });
    document.querySelectorAll('[data-current-label-en]').forEach(el => {
      el.dataset.currentLabel = el.dataset[`currentLabel${l.charAt(0).toUpperCase()+l.slice(1)}`] || el.dataset.currentLabelEn;
    });
    if (copyBtn) copyBtn.textContent = (i18n[l] || i18n.en).copy;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    syncSummaryLabels();
    const data = new FormData(form);
    const l = lang();
    const t = i18n[l] || i18n.en;
    const title = mode === 'traditional' ? t.titleTraditional : t.titleGeneral;
    const route = mode === 'traditional' ? t.routeTraditional : t.routeGeneral;
    const note = mode === 'traditional' ? t.noteTraditional : t.noteGeneral;
    const body = mode === 'traditional' ? buildTraditional(data) : buildGeneral(data);
    const timestamp = new Date().toLocaleString(l === 'zh' ? 'zh-CN' : l);
    pre.textContent = [title, '', `${t.generated}: ${timestamp}`, `${t.route}: ${route}`, '', ...body, '', `${t.note}: ${note}`].join('\n');
    output.classList.add('is-visible');
    output.scrollIntoView({behavior:'smooth', block:'nearest'});
  });

  copyBtn?.addEventListener('click', async () => {
    const text = pre.textContent;
    const l = lang();
    const t = i18n[l] || i18n.en;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const old = copyBtn.textContent;
    copyBtn.textContent = t.copied;
    setTimeout(() => copyBtn.textContent = old, 1400);
  });

  document.querySelector('[data-runlu-language-select]')?.addEventListener('change', () => setTimeout(syncSummaryLabels, 0));
  syncSummaryLabels();
})();