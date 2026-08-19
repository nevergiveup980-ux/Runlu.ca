(() => {
  const ENDPOINT = 'https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-leave-a-note';
  const form = document.getElementById('noteForm');
  const message = document.getElementById('noteMessage');
  const count = document.getElementById('noteCount');
  const status = document.getElementById('noteStatus');
  const submit = document.getElementById('noteSubmit');
  const email = document.getElementById('noteEmail');
  const reply = document.getElementById('noteReply');
  const category = document.getElementById('noteCategory');
  const consent = document.getElementById('noteFeature');
  const honeypot = document.getElementById('noteWebsite');

  const language = () => document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
  const copy = (en, zh) => language() === 'zh' ? zh : en;

  const syncLanguage = () => {
    message.placeholder = message.dataset[`placeholder${language() === 'zh' ? 'Zh' : 'En'}`];
    document.querySelectorAll('#noteCategory option[data-en]').forEach(option => {
      option.textContent = option.dataset[language()];
    });
  };

  message.addEventListener('input', () => { count.textContent = String(message.value.length); });
  window.addEventListener('runlu:languagechange', syncLanguage);
  document.addEventListener('runlu:languagechange', syncLanguage);
  setTimeout(syncLanguage, 0);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'note-status';
    status.textContent = '';

    if (!category.value) {
      status.classList.add('error');
      status.textContent = copy('Please choose a note type.', '请选择留言类型。');
      category.focus();
      return;
    }
    if (message.value.trim().length < 10) {
      status.classList.add('error');
      status.textContent = copy('Please write at least 10 characters.', '请至少写 10 个字。');
      message.focus();
      return;
    }
    if (reply.checked && !email.value.trim()) {
      status.classList.add('error');
      status.textContent = copy('Please add an email if you would like a reply.', '如需回复，请填写邮箱。');
      email.focus();
      return;
    }
    if (email.value && !email.validity.valid) {
      status.classList.add('error');
      status.textContent = copy('Please check the email address.', '请检查邮箱格式。');
      email.focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = copy('Sending…', '正在发送……');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.value,
          name: document.getElementById('noteName').value,
          email: email.value,
          message: message.value,
          wants_reply: reply.checked,
          consent_to_feature: consent.checked,
          website: honeypot.value,
          language: language(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || copy('We could not save your note. Please try again.', '暂时无法提交，请稍后再试。'));
      form.reset();
      count.textContent = '0';
      status.classList.add('success');
      status.textContent = result.message || copy('Thank you. Your note will be read with care.', '谢谢你的留言。我们会认真阅读。');
    } catch (error) {
      status.classList.add('error');
      status.textContent = error.message || copy('We could not save your note. Please try again.', '暂时无法提交，请稍后再试。');
    } finally {
      submit.disabled = false;
      submit.textContent = copy('Send Note', '发送留言');
    }
  });
})();
