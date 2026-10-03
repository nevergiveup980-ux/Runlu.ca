(() => {
  'use strict';
  const form = document.getElementById('flooringInterestForm');
  if (!form) return;
  const button = document.getElementById('interestSubmit');
  const status = document.getElementById('interestStatus');
  const messages = {
    en: {send:'Register interest →', sending:'Saving your request…', success:'Your request has been saved. RUNLU may contact you about your selected interest as the product progresses. This is not an account activation or a confirmed beta place.', error:'Your request could not be confirmed. Your details are still here; please try again later or email hello@runlu.ca.', rate:'Too many requests. Please try again in an hour or email hello@runlu.ca.'},
    zh: {send:'登记意向 →', sending:'正在保存登记…', success:'登记已保存。RUNLU 会根据产品进展，就你选择的意向与你联系。这不代表账号开通或内测名额确认。', error:'暂时无法确认登记成功。已保留填写内容，请稍后重试，或联系 hello@runlu.ca。', rate:'提交次数较多，请一小时后重试，或联系 hello@runlu.ca。'},
    fr: {send:'Enregistrer mon intérêt →', sending:'Enregistrement…', success:'Votre demande est enregistrée. RUNLU pourra vous contacter selon votre choix et l’avancement du produit. Cela ne crée pas de compte et ne confirme pas de place en bêta.', error:'Impossible de confirmer votre demande. Vos informations sont conservées dans ce formulaire. Réessayez plus tard ou écrivez à hello@runlu.ca.', rate:'Trop de demandes. Réessayez dans une heure ou écrivez à hello@runlu.ca.'},
    es: {send:'Registrar interés →', sending:'Guardando tu solicitud…', success:'Tu solicitud está guardada. RUNLU podrá contactarte sobre la opción elegida según avance el producto. Esto no activa una cuenta ni confirma una plaza en la beta.', error:'No se pudo confirmar tu solicitud. Tus datos siguen en el formulario. Inténtalo más tarde o escribe a hello@runlu.ca.', rate:'Demasiadas solicitudes. Inténtalo en una hora o escribe a hello@runlu.ca.'}
  };
  let state = '', pending = false;
  const language = () => window.RUNLULanguage?.get() || document.documentElement.lang || 'en';
  function render() {
    const copy = messages[language()] || messages.en;
    button.textContent = pending ? copy.sending : copy.send;
    button.disabled = pending;
    form.setAttribute('aria-busy', String(pending));
    status.textContent = state ? copy[state] : '';
    status.dataset.error = String(state === 'error' || state === 'rate');
  }
  window.addEventListener('runlu:languagechange', render);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    if (form.elements.website.value) return;
    pending = true; state = 'sending'; render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const intent = form.elements.intent.value === 'release' ? 'release' : 'beta';
    const payload = {
      category: 'product', name: '', email: form.elements.email.value.trim(),
      message: ['FLOORING_OS_INTEREST_V1', 'Source: https://runlu.ca/flooring-business-os.html', `Intent: ${intent}`, `Company: ${form.elements.company.value.trim() || '(not provided)'}`, `Language: ${language()}`, 'Consent: Flooring OS selected request only; version 20261003', `Submitted: ${new Date().toISOString()}`].join('\n'),
      language: language(), wants_reply: true, consent_to_feature: false, website: ''
    };
    try {
      const response = await fetch('https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-leave-a-note', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json();
      if (response.status === 201 && result.ok === true) { state = 'success'; form.reset(); }
      else state = response.status === 429 ? 'rate' : 'error';
    } catch (_) { state = 'error'; }
    finally { clearTimeout(timeout); pending = false; render(); status.focus(); }
  });
  render();
})();
