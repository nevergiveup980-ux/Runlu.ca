(() => {
  'use strict';

  const SUPABASE_URL = 'https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const ACCOUNT_RETURN_URL = 'https://runlu.ca/account.html';

  if (!window.supabase?.createClient) {
    console.error('Supabase client library failed to load.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const strings = {
    en: {
      pilot:'Private pilot', title:'One quiet account for RUNLU.', lead:'Sign in once. Product access, purchases and your RUNLU library can be connected here over time.', pilot_note:'Pilot stage: account authentication only. No existing RUNLU product requires an account yet.', sign_in:'Sign in', create_account:'Create account', display_name:'Display name', email:'Email', password:'Password', password_hint:'Use at least 8 characters.', forgot_password:'Forgot password?', reset_title:'Choose a new password', new_password:'New password', save_password:'Save new password', signed_in:'SIGNED IN', sign_out:'Sign out', preferred_language:'Preferred language', save_profile:'Save profile', library:'Library', library_note:'Reserved for products and downloads you own. Not connected yet.', orders:'Orders', orders_note:'Reserved for future RUNLU-direct purchases. Not connected yet.', subscriptions:'Subscriptions', subscriptions_note:'Reserved for future RUNLU services. Apple-managed purchases remain with Apple.', support_line:'Account help:', privacy_line:'Privacy:', signing_in:'Signing in…', creating:'Creating account…', check_email:'Account created. Check your email to confirm the address before signing in.', signed_in_ok:'Signed in.', signed_out_ok:'Signed out.', profile_saved:'Profile saved.', reset_sent:'If an account exists for that email, a password-reset message has been sent.', password_saved:'Password updated. You can continue using your account.', enter_email:'Enter your email address first.', generic_error:'Something went wrong. Please try again.', suspended:'This account is currently suspended. Contact support@runlu.ca.'
    },
    zh: {
      pilot:'内部试运行', title:'一个安静统一的 RUNLU 账户。', lead:'一次登录，今后逐步连接产品权限、购买记录与 RUNLU 资料库。', pilot_note:'当前为试运行阶段：只启用账户认证。现有 RUNLU 产品暂时都不强制登录。', sign_in:'登录', create_account:'创建账户', display_name:'显示名称', email:'邮箱', password:'密码', password_hint:'至少使用 8 个字符。', forgot_password:'忘记密码？', reset_title:'设置新密码', new_password:'新密码', save_password:'保存新密码', signed_in:'已登录', sign_out:'退出登录', preferred_language:'偏好语言', save_profile:'保存资料', library:'资料库', library_note:'将来用于显示你拥有的产品和下载内容，目前尚未连接。', orders:'订单', orders_note:'将来用于 RUNLU 直接购买记录，目前尚未连接。', subscriptions:'订阅', subscriptions_note:'将来用于 RUNLU 服务订阅；由 Apple 管理的购买仍由 Apple 管理。', support_line:'账户帮助：', privacy_line:'隐私：', signing_in:'正在登录…', creating:'正在创建账户…', check_email:'账户已创建，请检查邮箱并确认邮箱地址后再登录。', signed_in_ok:'登录成功。', signed_out_ok:'已退出。', profile_saved:'资料已保存。', reset_sent:'如果该邮箱存在账户，密码重置邮件已经发送。', password_saved:'密码已更新，可以继续使用账户。', enter_email:'请先输入邮箱地址。', generic_error:'发生错误，请稍后再试。', suspended:'该账户目前已暂停，请联系 support@runlu.ca。'
    },
    fr: {
      pilot:'Pilote privé', title:'Un compte discret pour RUNLU.', lead:'Connectez-vous une fois. L’accès aux produits, les achats et votre bibliothèque RUNLU pourront s’y relier progressivement.', pilot_note:'Phase pilote : authentification du compte uniquement. Aucun produit RUNLU actuel n’exige encore de compte.', sign_in:'Se connecter', create_account:'Créer un compte', display_name:'Nom affiché', email:'Courriel', password:'Mot de passe', password_hint:'Utilisez au moins 8 caractères.', forgot_password:'Mot de passe oublié ?', reset_title:'Choisir un nouveau mot de passe', new_password:'Nouveau mot de passe', save_password:'Enregistrer le mot de passe', signed_in:'CONNECTÉ', sign_out:'Se déconnecter', preferred_language:'Langue préférée', save_profile:'Enregistrer le profil', library:'Bibliothèque', library_note:'Réservée aux produits et téléchargements que vous possédez. Pas encore connectée.', orders:'Commandes', orders_note:'Réservées aux futurs achats directs auprès de RUNLU. Pas encore connectées.', subscriptions:'Abonnements', subscriptions_note:'Réservés aux futurs services RUNLU. Les achats gérés par Apple restent chez Apple.', support_line:'Aide au compte :', privacy_line:'Confidentialité :', signing_in:'Connexion…', creating:'Création du compte…', check_email:'Compte créé. Consultez votre courriel pour confirmer votre adresse avant de vous connecter.', signed_in_ok:'Connexion réussie.', signed_out_ok:'Déconnecté.', profile_saved:'Profil enregistré.', reset_sent:'Si un compte existe pour cette adresse, un message de réinitialisation a été envoyé.', password_saved:'Mot de passe mis à jour.', enter_email:'Saisissez d’abord votre adresse courriel.', generic_error:'Une erreur est survenue. Veuillez réessayer.', suspended:'Ce compte est suspendu. Contactez support@runlu.ca.'
    },
    es: {
      pilot:'Piloto privado', title:'Una cuenta tranquila para RUNLU.', lead:'Inicia sesión una vez. Con el tiempo, el acceso a productos, las compras y tu biblioteca RUNLU podrán conectarse aquí.', pilot_note:'Etapa piloto: solo autenticación de cuenta. Ningún producto RUNLU actual exige una cuenta todavía.', sign_in:'Iniciar sesión', create_account:'Crear cuenta', display_name:'Nombre visible', email:'Correo electrónico', password:'Contraseña', password_hint:'Usa al menos 8 caracteres.', forgot_password:'¿Olvidaste la contraseña?', reset_title:'Elige una nueva contraseña', new_password:'Nueva contraseña', save_password:'Guardar contraseña', signed_in:'SESIÓN INICIADA', sign_out:'Cerrar sesión', preferred_language:'Idioma preferido', save_profile:'Guardar perfil', library:'Biblioteca', library_note:'Reservada para productos y descargas que poseas. Aún no está conectada.', orders:'Pedidos', orders_note:'Reservados para futuras compras directas a RUNLU. Aún no están conectados.', subscriptions:'Suscripciones', subscriptions_note:'Reservadas para futuros servicios RUNLU. Las compras gestionadas por Apple siguen con Apple.', support_line:'Ayuda de cuenta:', privacy_line:'Privacidad:', signing_in:'Iniciando sesión…', creating:'Creando cuenta…', check_email:'Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.', signed_in_ok:'Sesión iniciada.', signed_out_ok:'Sesión cerrada.', profile_saved:'Perfil guardado.', reset_sent:'Si existe una cuenta para ese correo, se ha enviado un mensaje de restablecimiento.', password_saved:'Contraseña actualizada.', enter_email:'Introduce primero tu correo electrónico.', generic_error:'Algo salió mal. Inténtalo de nuevo.', suspended:'Esta cuenta está suspendida. Contacta con support@runlu.ca.'
    }
  };

  const els = {
    languageSelect: document.getElementById('languageSelect'),
    signInTab: document.getElementById('signInTab'),
    signUpTab: document.getElementById('signUpTab'),
    authForm: document.getElementById('authForm'),
    authSubmit: document.getElementById('authSubmit'),
    forgotButton: document.getElementById('forgotButton'),
    nameField: document.getElementById('nameField'),
    displayName: document.getElementById('displayName'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    passwordHint: document.getElementById('passwordHint'),
    authView: document.getElementById('authView'),
    recoveryView: document.getElementById('recoveryView'),
    recoveryForm: document.getElementById('recoveryForm'),
    newPassword: document.getElementById('newPassword'),
    accountView: document.getElementById('accountView'),
    accountEmail: document.getElementById('accountEmail'),
    signOutButton: document.getElementById('signOutButton'),
    profileForm: document.getElementById('profileForm'),
    profileName: document.getElementById('profileName'),
    profileLocale: document.getElementById('profileLocale'),
    statusBox: document.getElementById('statusBox')
  };

  let mode = 'signin';
  let currentLang = normalizeLanguage(localStorage.getItem('runlu-account-language') || navigator.language);

  function normalizeLanguage(value) {
    const v = String(value || '').toLowerCase();
    if (v.startsWith('zh')) return 'zh';
    if (v.startsWith('fr')) return 'fr';
    if (v.startsWith('es')) return 'es';
    return 'en';
  }

  function t(key) {
    return strings[currentLang]?.[key] || strings.en[key] || key;
  }

  function applyLanguage(lang) {
    currentLang = normalizeLanguage(lang);
    localStorage.setItem('runlu-account-language', currentLang);
    document.documentElement.lang = currentLang === 'zh' ? 'zh-Hans' : currentLang;
    els.languageSelect.value = currentLang;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const value = t(node.dataset.i18n);
      if (value) node.textContent = value;
    });
    syncModeUI();
  }

  function showStatus(message, isError = false) {
    els.statusBox.textContent = message;
    els.statusBox.classList.toggle('error', isError);
    els.statusBox.hidden = false;
  }

  function clearStatus() {
    els.statusBox.hidden = true;
    els.statusBox.textContent = '';
    els.statusBox.classList.remove('error');
  }

  function setBusy(button, busy, busyLabel) {
    button.disabled = busy;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyLabel;
    } else if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
      syncModeUI();
    }
  }

  function setMode(nextMode) {
    mode = nextMode;
    clearStatus();
    syncModeUI();
  }

  function syncModeUI() {
    const signingUp = mode === 'signup';
    els.signInTab.classList.toggle('active', !signingUp);
    els.signUpTab.classList.toggle('active', signingUp);
    els.nameField.hidden = !signingUp;
    els.passwordHint.hidden = !signingUp;
    els.password.autocomplete = signingUp ? 'new-password' : 'current-password';
    els.authSubmit.textContent = signingUp ? t('create_account') : t('sign_in');
    els.forgotButton.hidden = signingUp;
  }

  async function loadProfile(user) {
    const { data, error } = await client
      .from('runlu_profiles')
      .select('display_name,locale,account_tier,account_status,created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (data?.account_status === 'suspended') {
      await client.auth.signOut();
      throw new Error(t('suspended'));
    }
    els.profileName.value = data?.display_name || '';
    els.profileLocale.value = data?.locale || currentLang;
  }

  async function renderSession(session) {
    const user = session?.user;
    if (!user) {
      els.authView.hidden = false;
      els.recoveryView.hidden = true;
      els.accountView.hidden = true;
      return;
    }

    els.accountEmail.textContent = user.email || '—';
    els.authView.hidden = true;
    els.recoveryView.hidden = true;
    els.accountView.hidden = false;

    try {
      await loadProfile(user);
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    }
  }

  els.signInTab.addEventListener('click', () => setMode('signin'));
  els.signUpTab.addEventListener('click', () => setMode('signup'));
  els.languageSelect.addEventListener('change', (event) => applyLanguage(event.target.value));

  els.authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();
    const email = els.email.value.trim();
    const password = els.password.value;
    const signingUp = mode === 'signup';
    setBusy(els.authSubmit, true, signingUp ? t('creating') : t('signing_in'));

    try {
      if (signingUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: ACCOUNT_RETURN_URL,
            data: {
              display_name: els.displayName.value.trim(),
              locale: currentLang
            }
          }
        });
        if (error) throw error;
        if (data.session) {
          showStatus(t('signed_in_ok'));
          await renderSession(data.session);
        } else {
          showStatus(t('check_email'));
          setMode('signin');
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showStatus(t('signed_in_ok'));
        await renderSession(data.session);
      }
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    } finally {
      setBusy(els.authSubmit, false);
    }
  });

  els.forgotButton.addEventListener('click', async () => {
    clearStatus();
    const email = els.email.value.trim();
    if (!email) {
      showStatus(t('enter_email'), true);
      els.email.focus();
      return;
    }
    els.forgotButton.disabled = true;
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: ACCOUNT_RETURN_URL });
      if (error) throw error;
      showStatus(t('reset_sent'));
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    } finally {
      els.forgotButton.disabled = false;
    }
  });

  els.recoveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();
    try {
      const { error } = await client.auth.updateUser({ password: els.newPassword.value });
      if (error) throw error;
      els.newPassword.value = '';
      showStatus(t('password_saved'));
      const { data } = await client.auth.getSession();
      await renderSession(data.session);
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    }
  });

  els.profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData.session?.user;
      if (!user) throw new Error('Session not found.');
      const { error } = await client
        .from('runlu_profiles')
        .update({
          display_name: els.profileName.value.trim() || null,
          locale: els.profileLocale.value
        })
        .eq('user_id', user.id);
      if (error) throw error;
      applyLanguage(els.profileLocale.value);
      showStatus(t('profile_saved'));
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    }
  });

  els.signOutButton.addEventListener('click', async () => {
    clearStatus();
    els.signOutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      els.password.value = '';
      await renderSession(null);
      showStatus(t('signed_out_ok'));
    } catch (error) {
      showStatus(error?.message || t('generic_error'), true);
    } finally {
      els.signOutButton.disabled = false;
    }
  });

  client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      clearStatus();
      els.authView.hidden = true;
      els.accountView.hidden = true;
      els.recoveryView.hidden = false;
      return;
    }
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
      await renderSession(session);
    }
    if (event === 'SIGNED_OUT') {
      await renderSession(null);
    }
  });

  applyLanguage(currentLang);
  client.auth.getSession().then(({ data, error }) => {
    if (error) showStatus(error.message, true);
    else renderSession(data.session);
  });
})();
