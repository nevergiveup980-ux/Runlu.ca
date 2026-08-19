(() => {
  const cfg = window.RUNLU_AI || {};
  let providerStatus = { OpenAI: false, Claude: false, Gemini: false };
  let currentThreadId = null;
  const liveProviderNames = ['OpenAI', 'Claude', 'Gemini'];
  const liveText=(en,zh,fr,es)=>({en,zh,fr,es}[lang]||en);

  function aiConfigReady() {
    return Boolean(cfg.endpoint && cfg.anonKey);
  }

  async function callGateway(payload) {
    if (!aiConfigReady()) throw new Error('RUNLU AI gateway is not configured.');
    const response = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.anonKey}`,
        'apikey': cfg.anonKey
      },
      body: JSON.stringify(payload)
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || `AI gateway HTTP ${response.status}`);
    return data;
  }

  function statusText(provider) {
    if (!aiConfigReady()) return liveText('Gateway not configured','网关未配置','Passerelle non configurée','Pasarela no configurada');
    if (providerStatus[provider]) return liveText('Live · Connected','在线 · 已连接','En direct · Connecté','En vivo · Conectado');
    return liveText('Gateway ready · API key needed','网关就绪 · 需要 API Key',"Passerelle prête · clé d’API requise",'Pasarela lista · se necesita clave de API');
  }

  function refreshSeatStatus() {
    document.querySelectorAll('.seat-mini').forEach(row => {
      const provider = row.querySelector('b')?.textContent?.trim();
      const small = row.querySelector('small');
      if (small && liveProviderNames.includes(provider)) small.textContent = statusText(provider);
    });
    document.querySelectorAll('.seat-option').forEach(btn => {
      const provider = btn.dataset.seat;
      const small = btn.querySelector('small');
      if (small && liveProviderNames.includes(provider)) small.textContent = statusText(provider);
    });
  }

  async function refreshProviderStatus() {
    if (!aiConfigReady()) { refreshSeatStatus(); return; }
    try {
      const data = await callGateway({ action: 'status' });
      providerStatus = { ...providerStatus, ...(data.providers || {}) };
    } catch (error) {
      console.warn('RUNLU AI status check failed:', error);
    }
    refreshSeatStatus();
  }

  function replyHtml(r) {
    const model = r.model ? ` · ${esc(r.model)}` : '';
    const badge = esc(r.badge || tr('reply'));
    return `<div class="reply"><div class="reply-avatar">${esc((r.who || 'R')[0])}</div><div><div class="reply-head"><b>${esc(r.who || tr('reply'))}</b><small>${badge}${model}</small></div><p>${esc(r.text || '')}</p></div></div>`;
  }

  function providerButton(provider, enabled) {
    const label = `${tr('invite')} ${provider}`;
    return `<button type="button" data-live-provider="${provider}" ${enabled ? '' : 'disabled'}>${label}</button>`;
  }

  function liveOpenThread(id) {
    currentThreadId = id;
    const p = allPosts().find(x => x.id === id);
    if (!p) return;
    const replies = (p.replies || []).map(replyHtml).join('');
    const seats = (p.seats || []).length ? p.seats.join(', ') : tr('none');
    const canInvite = !p.sample;
    const liveButtons = liveProviderNames.map(provider => providerButton(provider, canInvite && providerStatus[provider])).join('');
    const roundtableProviders = (p.seats || []).filter(x => providerStatus[x]);
    const roundtableEnabled = canInvite && (roundtableProviders.length >= 2 || liveProviderNames.filter(x => providerStatus[x]).length >= 2);
    const note = p.sample
      ? `<div class="prototype-note">${esc(tr('demoTranscript'))}</div>`
      : `<div class="prototype-note">${esc(liveText('Live AI gateway is installed. Only connected seats can be invited. Current configured seats:','实时 AI 网关已安装。只能邀请已连接的席位。当前已配置席位：',"La passerelle IA en direct est installée. Seuls les sièges connectés peuvent être invités. Sièges configurés :",'La pasarela de IA en vivo está instalada. Solo se pueden invitar puestos conectados. Puestos configurados:'))} ${liveProviderNames.filter(x => providerStatus[x]).join(', ') || liveText('none yet','暂无','aucun','ninguno')}.</div>`;

    $('threadContent').innerHTML = `<div class="thread-head"><div class="discussion-meta"><span class="category-pill">${esc(text(categoryNames[p.category]))}</span><span class="mode-pill">${esc(text(modeNames[p.mode]))}</span></div><h2>${esc(text(p.title))}</h2><div class="discussion-meta">${esc(text(p.author)||tr('you'))} · ${esc(formatTime(p.created))}</div></div>
      <p class="thread-body">${esc(text(p.body))}</p>
      ${note}
      <div class="thread-divider"></div><p class="eyebrow">${esc(tr('conversation'))}</p>${replies || `<div class="empty-state">${esc(tr('noReplies'))}</div>`}
      <div class="invite-panel"><h4>${esc(tr('inviteAI'))}</h4><p>${esc(tr('configuredSeats'))}: ${esc(seats)}.</p><div class="invite-buttons">${liveButtons}<button type="button" id="liveRoundtable" ${roundtableEnabled ? '' : 'disabled'}>${esc(tr('startRoundtable'))}</button></div><div id="liveAiState" class="tiny-note"></div></div>`;

    $('threadModal').classList.remove('hidden');
    document.querySelectorAll('[data-live-provider]').forEach(btn => {
      btn.onclick = () => inviteProviders(id, [btn.dataset.liveProvider]);
    });
    const roundtable = $('liveRoundtable');
    if (roundtable) roundtable.onclick = () => {
      const preferred = (p.seats || []).filter(x => providerStatus[x]);
      const providers = preferred.length >= 2 ? preferred : liveProviderNames.filter(x => providerStatus[x]);
      inviteProviders(id, providers.slice(0, 3));
    };
  }

  function saveAiReplies(postId, results) {
    const rows = userPosts();
    const post = rows.find(x => x.id === postId);
    if (!post) return;
    post.replies = post.replies || [];
    let successes = 0;
    for (const result of results || []) {
      if (result?.text) {
        post.replies.push({
          who: result.provider,
          badge: 'Live AI',
          model: result.model || '',
          text: result.text
        });
        successes += 1;
      }
    }
    post.comments = post.replies.length;
    savePosts(rows);
    if (successes) {
      const spent = Number(localStorage.getItem(BUDGET) || 0);
      const delta = successes === 1 ? 0.02 : successes * 0.025;
      localStorage.setItem(BUDGET, String(spent + delta));
      renderBudget();
    }
  }

  async function inviteProviders(postId, providers) {
    const p = userPosts().find(x => x.id === postId);
    if (!p || !providers?.length) return;
    const state = $('liveAiState');
    if (state) state.textContent = liveText('AI is thinking…','AI 正在思考…',"L’IA réfléchit…",'La IA está pensando…');
    document.querySelectorAll('.invite-buttons button').forEach(b => b.disabled = true);
    try {
      const context = (p.replies || []).slice(-6).map(r => `${r.who}: ${r.text}`).join('\n\n');
      const data = await callGateway({ title: p.title, body: p.body, context, providers });
      const results = data.results || [];
      saveAiReplies(postId, results);
      const problems = results.filter(r => !r.text).map(r => `${r.provider}: ${r.error || 'No response'}`);
      liveOpenThread(postId);
      const newState = $('liveAiState');
      if (newState && problems.length) newState.textContent = problems.join(' · ');
    } catch (error) {
      if (state) state.textContent = error.message || String(error);
      document.querySelectorAll('.invite-buttons button').forEach(b => b.disabled = false);
    }
  }

  async function publishWithLiveAI() {
    const title = $('postTitle').value.trim();
    const body = $('postBody').value.trim();
    if (!title || !body) {
      alert(liveText('Please add a title and some context.','请先写标题和内容。','Ajoutez un titre et un peu de contexte.','Añade un título y algo de contexto.'));
      return;
    }
    const mode = $('postMode').value;
    let seats = mode === 'human' ? [] : [...document.querySelectorAll('.seat-option.selected')].map(x => x.dataset.seat);
    if (mode === 'one') seats = seats.slice(0, 1);
    if (mode === 'roundtable' && seats.length < 2) seats = liveProviderNames.filter(x => providerStatus[x]).slice(0, 3);

    const rows = userPosts();
    const id = 'post-' + Date.now();
    rows.unshift({ id, title, body, category: $('postCategory').value, mode, author: 'You', created: new Date().toISOString(), comments: 0, seats, replies: [] });
    savePosts(rows);
    $('postTitle').value = '';
    $('postBody').value = '';
    closeComposer();
    filter = 'all';
    document.querySelectorAll('.topic-link').forEach(x => x.classList.toggle('active', x.dataset.filter === 'all'));
    renderFeed();

    if (mode !== 'human') {
      liveOpenThread(id);
      const connected = seats.filter(x => providerStatus[x]);
      if (connected.length) await inviteProviders(id, connected);
      else {
        const state = $('liveAiState');
        if (state) state.textContent = liveText('AI gateway installed; add the selected provider API key to activate the seat.','AI 网关已安装；请先添加所选模型的 API Key。',"Passerelle IA installée ; ajoutez la clé d’API du fournisseur choisi pour activer le siège.",'Pasarela de IA instalada; añade la clave de API del proveedor elegido para activar el puesto.');
      }
    }
  }

  if (typeof openThread === 'function') openThread = liveOpenThread;
  const publish = $('publishPost');
  if (publish) publish.onclick = publishWithLiveAI;

  const originalLangHandler = $('forumLang')?.onclick;
  if ($('forumLang')) {
    $('forumLang').onclick = () => {
      if (originalLangHandler) originalLangHandler();
      refreshSeatStatus();
    };
  }

  refreshProviderStatus();
  window.addEventListener('runlu:languagechange',refreshSeatStatus);
})();
