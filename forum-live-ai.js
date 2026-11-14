(() => {
  const cfg = window.RUNLU_AI || {};
  let providerStatus = { OpenAI: false, Claude: false, Gemini: false };
  let providerConfigured = { OpenAI: false, Claude: false, Gemini: false };
  let currentThreadId = null;
  const pendingPosts = new Set();
  const liveProviderNames = ['OpenAI', 'Claude', 'Gemini'];
  const liveText=(en,zh,fr,es)=>({en,zh,fr,es}[lang]||en);

  function errorText(code) {
    const messages = {
      DAILY_BUDGET_EXHAUSTED: ['Today’s $2.00 server budget is exhausted (UTC).', '今日服务端 $2.00 预算已用尽（UTC）。'],
      FORUM_BUSY: ['A discussion is already running. Try again after it finishes.', '已有讨论正在进行，请结束后重试。'],
      RATE_LIMITED: ['Too many requests. Wait a minute before retrying.', '请求过于频繁，请等待一分钟。'],
      CLIENT_DAILY_LIMIT: ['Your daily AI call limit has been reached.', '已达到今日个人 AI 调用上限。'],
      PROVIDER_QUOTA_OR_RATE_LIMIT: ['Provider quota, balance or rate limit reached. Check billing and retry later.', '厂商配额、余额或速率限制，请检查计费设置后稍后重试。'],
      PROVIDER_BALANCE_REQUIRED: ['Provider billing or balance needs attention.', '请检查厂商计费账户或余额。'],
      API_TIMEOUT: ['The model timed out. Reserved budget is retained.', '模型调用超时，预留预算不会退回。'],
      PROVIDER_NOT_CONFIGURED: ['This provider is not configured on the server.', '服务端尚未配置该模型。'],
      INVALID_API_KEY: ['Provider authentication failed. Check the server secret.', '厂商认证失败，请检查服务端密钥。'],
      INPUT_TOO_LARGE: ['Discussion context is too long. Shorten the post or context.', '讨论内容过长，请缩短正文或上下文。'],
      BUDGET_SERVICE_UNAVAILABLE: ['Budget checks are unavailable. No model call was started.', '预算检查不可用，未发起模型调用。']
    };
    const message = messages[code];
    return message ? (lang === 'zh' ? message[1] : message[0]) : code;
  }

  function aiConfigReady() {
    return Boolean(cfg.endpoint && cfg.anonKey);
  }

  async function callGateway(payload) {
    if (!aiConfigReady()) throw new Error('RUNLU AI gateway is not configured.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 130000);
    try {
    const response = await fetch(cfg.endpoint, {
      signal: controller.signal,
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
    if (!response.ok) throw new Error(errorText(data.error) || `AI gateway HTTP ${response.status}`);
    return data;
    } catch (error) {
      if (controller.signal.aborted) throw new Error('Gateway timeout. A reservation may remain charged; check budget before retrying.');
      throw error;
    } finally { clearTimeout(timer); }
  }

  function statusText(provider) {
    if (!aiConfigReady()) return liveText('Gateway not configured','网关未配置','Passerelle non configurée','Pasarela no configurada');
    if (providerStatus[provider]) return liveText('Live · Connected','在线 · 已连接','En direct · Connecté','En vivo · Conectado');
    if (providerConfigured[provider]) return liveText('Configured · not verified','已配置 · 尚未验证','Configuré · non vérifié','Configurado · sin verificar');
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
      providerStatus = Object.fromEntries(liveProviderNames.map(p => [p, data.provider_details?.[p]?.configured === true && data.provider_details?.[p]?.verified === true]));
      providerConfigured = Object.fromEntries(liveProviderNames.map(p => [p, data.provider_details?.[p]?.configured === true]));
      renderBudget(data.budget);
    } catch (error) {
      providerStatus = { OpenAI: false, Claude: false, Gemini: false };
      providerConfigured = { OpenAI: false, Claude: false, Gemini: false };
      renderBudget(null);
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
    return `<button type="button" data-live-provider="${provider}" ${enabled && !pendingPosts.has(currentThreadId) ? '' : 'disabled'}>${label}</button>`;
  }

  function liveOpenThread(id) {
    currentThreadId = id;
    const p = allPosts().find(x => x.id === id);
    if (!p) return;
    const replies = (p.replies || []).map(replyHtml).join('');
    const seats = (p.seats || []).length ? p.seats.join(', ') : tr('none');
    const canInvite = !p.sample;
    const liveButtons = liveProviderNames.map(provider => providerButton(provider, canInvite && providerConfigured[provider])).join('');
    const roundtableProviders = (p.seats || []).filter(x => providerConfigured[x]);
    const roundtableEnabled = canInvite && (roundtableProviders.length >= 2 || liveProviderNames.filter(x => providerConfigured[x]).length >= 2);
    const note = p.sample
      ? `<div class="prototype-note">${esc(tr('demoTranscript'))}</div>`
      : `<div class="prototype-note">${esc(liveText('Live AI gateway is installed. Configured seats can be invited; a successful reply verifies the connection. Current configured seats:','实时 AI 网关已安装。可邀请已配置的席位，真实回复成功后确认连接。当前已配置席位：',"La passerelle IA en direct est installée. Invitez un siège configuré pour vérifier sa connexion. Sièges configurés :",'La pasarela de IA en vivo está instalada. Invita a un puesto configurado para verificar su conexión. Puestos configurados:'))} ${liveProviderNames.filter(x => providerConfigured[x]).join(', ') || liveText('none yet','暂无','aucun','ninguno')}.</div>`;

    $('threadContent').innerHTML = `<div class="thread-head"><div class="discussion-meta"><span class="category-pill">${esc(text(categoryNames[p.category]))}</span><span class="mode-pill">${esc(text(modeNames[p.mode]))}</span></div><h2>${esc(text(p.title))}</h2><div class="discussion-meta">${esc(text(p.author)||tr('you'))} · ${esc(formatTime(p.created))}</div></div>
      <p class="thread-body">${esc(text(p.body))}</p>
      ${note}
      <div class="thread-divider"></div><p class="eyebrow">${esc(tr('conversation'))}</p>${replies || `<div class="empty-state">${esc(tr('noReplies'))}</div>`}
      <div class="invite-panel"><h4>${esc(tr('inviteAI'))}</h4><p>${esc(tr('configuredSeats'))}: ${esc(seats)}.</p><div class="invite-buttons">${liveButtons}<button type="button" id="liveRoundtable" ${roundtableEnabled && !pendingPosts.has(id) ? '' : 'disabled'}>${esc(tr('startRoundtable'))}</button></div><div id="liveAiState" class="tiny-note"></div></div>`;

    $('threadModal').classList.remove('hidden');
    document.querySelectorAll('[data-live-provider]').forEach(btn => {
      btn.onclick = () => inviteProviders(id, [btn.dataset.liveProvider]);
    });
    const roundtable = $('liveRoundtable');
    if (roundtable) roundtable.onclick = () => {
      const preferred = (p.seats || []).filter(x => providerConfigured[x]);
      const providers = preferred.length >= 2 ? preferred : liveProviderNames.filter(x => providerConfigured[x]);
      inviteProviders(id, providers.slice(0, 3), 2);
    };
  }

  function saveAiReplies(postId, results) {
    const rows = userPosts();
    const post = rows.find(x => x.id === postId);
    if (!post) return;
    post.replies = post.replies || [];
    for (const result of results || []) {
      if (result?.text) {
        post.replies.push({
          who: result.provider,
          badge: 'Live AI',
          model: result.model || '',
          text: result.text
        });
      }
    }
    post.comments = post.replies.length;
    savePosts(rows);

  }

  async function inviteProviders(postId, providers, rounds = 1) {
    if (pendingPosts.has(postId)) return;
    const p = userPosts().find(x => x.id === postId);
    if (!p || !providers?.length) return;
    pendingPosts.add(postId);
    const state = $('liveAiState');
    if (state) state.textContent = liveText('AI is thinking…','AI 正在思考…',"L’IA réfléchit…",'La IA está pensando…');
    document.querySelectorAll('.invite-buttons button').forEach(b => b.disabled = true);
    try {
      let context = (p.replies || []).slice(-6).map(r => `${r.who}: ${r.text}`).join('\n\n');
      while (new TextEncoder().encode(context).length > 1000) context = context.slice(100);
      const data = await callGateway({ title: p.title, body: p.body, context, providers, rounds });
      renderBudget(data.budget);
      const results = data.results || [];
      saveAiReplies(postId, results);
      const problems = results.filter(r => !r.text).map(r => `${r.provider}: ${errorText(r.error) || 'No response'}`);
      await refreshProviderStatus();
      pendingPosts.delete(postId);
      if (!$('threadModal').classList.contains('hidden') && currentThreadId === postId) liveOpenThread(postId);
      const newState = $('liveAiState');
      if (newState && problems.length) newState.textContent = problems.join(' · ');
    } catch (error) {
      if (state) state.textContent = error.message || String(error);
      await refreshProviderStatus();
      pendingPosts.delete(postId);
      if (currentThreadId === postId && !$('threadModal').classList.contains('hidden')) { liveOpenThread(postId); const message = $('liveAiState'); if (message) message.textContent = error.message; }
    } finally { pendingPosts.delete(postId); }
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
    if (mode === 'roundtable' && seats.length < 2) seats = liveProviderNames.filter(x => providerConfigured[x]).slice(0, 3);

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
      const connected = seats.filter(x => providerConfigured[x]);
      if (connected.length) await inviteProviders(id, connected, mode === 'roundtable' && connected.length > 1 ? 2 : 1);
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
