(() => {
  'use strict';

  const SUPABASE_URL = 'https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const ACCOUNT_RETURN_URL = 'https://runlu.ca/account.html';
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  const initialRecoveryHint = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery' || queryParams.get('recovery') === '1';

  if (!window.supabase?.createClient) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const copy = {
    en:{pilot:'Private pilot',title:'One quiet account for RUNLU.',lead:'Sign in once. Product access, purchases and your RUNLU library can be connected here over time.',pilot_note:'Pilot stage: authentication, account-linked Library and Store preview are active. Existing RUNLU products do not require an account yet.',sign_in:'Sign in',create_account:'Create account',display_name:'Display name',email:'Email',password:'Password',password_hint:'Use at least 8 characters.',forgot_password:'Forgot password?',reset_title:'Choose a new password',new_password:'New password',save_password:'Save new password',signed_in:'SIGNED IN',sign_out:'Sign out',preferred_language:'Preferred language',save_profile:'Save profile',plan_center:'Plan Center',plan_center_note:'Your current GUANSHI plan, access period, cloud AI allowance and included capabilities appear here. Paid checkout remains disabled.',access_center:'Access Center',access_center_note:'See which RUNLU products this account can use and the active source of that access. This is read-only.',access_diagnostic:'Access Diagnostic',access_diagnostic_note:'A read-only health check of the GUANSHI access chain: account, product access, plan, capability and usage limit.',overview:'Account Overview',overview_note:'A compact live summary of your RUNLU access.',overview_plan:'Plan',overview_access:'Access',overview_diagnostic:'Diagnostic',overview_library:'Library',overview_store:'Store',library:'Library',library_note:'Products explicitly linked to this account appear here. Apple-managed purchases are not imported.',library_empty:'No RUNLU products are linked to this account yet.',open_product:'Open',store:'Store preview',store_note:'No paid checkout is active in this pilot. Eligible free plans can be activated into your Library; paid plans remain clearly marked until checkout is ready.',store_empty:'No RUNLU-direct offers are available yet.',planned:'Planned',available:'Available',activate_free:'Activate free',activating_free:'Activating…',free_activated:'Free plan activated and added to your Library.',checkout_not_enabled:'Checkout not enabled',orders:'Orders',orders_note:'Reserved for future RUNLU-direct purchases. Not connected yet.',subscriptions:'Subscriptions',subscriptions_note:'Reserved for future RUNLU services. Apple-managed purchases remain with Apple.',support_line:'Account help:',privacy_line:'Privacy:',signing_in:'Signing in…',creating:'Creating account…',check_email:'Account created. Check your email to confirm the address before signing in.',signed_in_ok:'Signed in.',signed_out_ok:'Signed out.',profile_saved:'Profile saved.',reset_sent:'If an account exists for that email, a password-reset message has been sent.',password_saved:'Password updated. You can continue using your account.',enter_email:'Enter your email address first.',generic_error:'Something went wrong. Please try again.',suspended:'This account is currently suspended. Contact support@runlu.ca.'},
    zh:{pilot:'内部试运行',title:'一个安静统一的 RUNLU 账户。',lead:'一次登录，今后逐步连接产品权限、购买记录与 RUNLU 资料库。',pilot_note:'当前为试运行阶段：账户认证、账户资料库与商店预览已经启用；现有 RUNLU 产品暂时都不强制登录。',sign_in:'登录',create_account:'创建账户',display_name:'显示名称',email:'邮箱',password:'密码',password_hint:'至少使用 8 个字符。',forgot_password:'忘记密码？',reset_title:'设置新密码',new_password:'新密码',save_password:'保存新密码',signed_in:'已登录',sign_out:'退出登录',preferred_language:'偏好语言',save_profile:'保存资料',plan_center:'方案中心',plan_center_note:'这里显示当前观势方案、权限周期、云端 AI 额度与已包含功能；付费结账仍未启用。',access_center:'权限中心',access_center_note:'这里显示这个账户当前可使用的 RUNLU 产品，以及每项权限的真实来源；此区域只读。',access_diagnostic:'权限诊断',access_diagnostic_note:'只读检查观势的账户、产品权限、方案、功能权限与使用额度整条链路。',overview:'账户总览',overview_note:'用一块简洁面板查看当前 RUNLU 权限状态。',overview_plan:'方案',overview_access:'权限',overview_diagnostic:'诊断',overview_library:'资料库',overview_store:'商店',library:'资料库',library_note:'明确关联到这个账户的 RUNLU 产品会显示在这里；Apple 管理的购买不会自动导入。',library_empty:'这个账户目前还没有关联任何 RUNLU 产品。',open_product:'打开',store:'商店预览',store_note:'当前试运行不启用付费结账。符合条件的免费方案可以激活并加入资料库；付费方案会一直明确标为计划中，直到结账系统真正就绪。',store_empty:'目前还没有 RUNLU 直售方案。',planned:'计划中',available:'可用',activate_free:'免费激活',activating_free:'正在激活…',free_activated:'免费方案已激活并加入资料库。',checkout_not_enabled:'尚未启用结账',orders:'订单',orders_note:'将来用于 RUNLU 直接购买记录，目前尚未连接。',subscriptions:'订阅',subscriptions_note:'将来用于 RUNLU 服务订阅；由 Apple 管理的购买仍由 Apple 管理。',support_line:'账户帮助：',privacy_line:'隐私：',signing_in:'正在登录…',creating:'正在创建账户…',check_email:'账户已创建，请检查邮箱并确认邮箱地址后再登录。',signed_in_ok:'登录成功。',signed_out_ok:'已退出。',profile_saved:'资料已保存。',reset_sent:'如果该邮箱存在账户，密码重置邮件已经发送。',password_saved:'密码已更新，可以继续使用账户。',enter_email:'请先输入邮箱地址。',generic_error:'发生错误，请稍后再试。',suspended:'该账户目前已暂停，请联系 support@runlu.ca。'},
    fr:{pilot:'Pilote privé',title:'Un compte discret pour RUNLU.',lead:'Connectez-vous une fois. L’accès aux produits, les achats et votre bibliothèque RUNLU pourront s’y relier progressivement.',pilot_note:'Phase pilote : l’authentification, la bibliothèque liée au compte et l’aperçu de la boutique sont actifs. Les produits RUNLU actuels n’exigent pas encore de compte.',sign_in:'Se connecter',create_account:'Créer un compte',display_name:'Nom affiché',email:'Courriel',password:'Mot de passe',password_hint:'Utilisez au moins 8 caractères.',forgot_password:'Mot de passe oublié ?',reset_title:'Choisir un nouveau mot de passe',new_password:'Nouveau mot de passe',save_password:'Enregistrer le mot de passe',signed_in:'CONNECTÉ',sign_out:'Se déconnecter',preferred_language:'Langue préférée',save_profile:'Enregistrer le profil',plan_center:'Centre du forfait',plan_center_note:'Votre forfait GUANSHI actuel, sa période d’accès, votre quota IA cloud et les fonctions incluses apparaissent ici. Le paiement reste désactivé.',access_center:'Centre d’accès',access_center_note:'Voyez quels produits RUNLU ce compte peut utiliser et la source active de chaque accès. Cette zone est en lecture seule.',access_diagnostic:'Diagnostic d’accès',access_diagnostic_note:'Contrôle en lecture seule de la chaîne GUANSHI : compte, accès produit, forfait, capacité et limite d’usage.',overview:'Vue d’ensemble du compte',overview_note:'Un résumé compact et en direct de vos accès RUNLU.',overview_plan:'Forfait',overview_access:'Accès',overview_diagnostic:'Diagnostic',overview_library:'Bibliothèque',overview_store:'Boutique',library:'Bibliothèque',library_note:'Les produits RUNLU explicitement liés à ce compte apparaissent ici. Les achats gérés par Apple ne sont pas importés.',library_empty:'Aucun produit RUNLU n’est encore lié à ce compte.',open_product:'Ouvrir',store:'Aperçu boutique',store_note:'Aucun paiement payant n’est actif pendant ce pilote. Les offres gratuites admissibles peuvent être activées dans votre Bibliothèque ; les offres payantes restent prévues jusqu’à ce que le paiement soit prêt.',store_empty:'Aucune offre directe RUNLU n’est disponible pour le moment.',planned:'Prévu',available:'Disponible',activate_free:'Activer gratuitement',activating_free:'Activation…',free_activated:'Offre gratuite activée et ajoutée à votre Bibliothèque.',checkout_not_enabled:'Paiement non activé',orders:'Commandes',orders_note:'Réservées aux futurs achats directs auprès de RUNLU. Pas encore connectées.',subscriptions:'Abonnements',subscriptions_note:'Réservés aux futurs services RUNLU. Les achats gérés par Apple restent chez Apple.',support_line:'Aide au compte :',privacy_line:'Confidentialité :',signing_in:'Connexion…',creating:'Création du compte…',check_email:'Compte créé. Consultez votre courriel pour confirmer votre adresse avant de vous connecter.',signed_in_ok:'Connexion réussie.',signed_out_ok:'Déconnecté.',profile_saved:'Profil enregistré.',reset_sent:'Si un compte existe pour cette adresse, un message de réinitialisation a été envoyé.',password_saved:'Mot de passe mis à jour.',enter_email:'Saisissez d’abord votre adresse courriel.',generic_error:'Une erreur est survenue. Veuillez réessayer.',suspended:'Ce compte est suspendu. Contactez support@runlu.ca.'},
    es:{pilot:'Piloto privado',title:'Una cuenta tranquila para RUNLU.',lead:'Inicia sesión una vez. Con el tiempo, el acceso a productos, las compras y tu biblioteca RUNLU podrán conectarse aquí.',pilot_note:'Etapa piloto: la autenticación, la biblioteca vinculada a la cuenta y la vista previa de la tienda ya están activas. Los productos RUNLU actuales todavía no exigen una cuenta.',sign_in:'Iniciar sesión',create_account:'Crear cuenta',display_name:'Nombre visible',email:'Correo electrónico',password:'Contraseña',password_hint:'Usa al menos 8 caracteres.',forgot_password:'¿Olvidaste la contraseña?',reset_title:'Elige una nueva contraseña',new_password:'Nueva contraseña',save_password:'Guardar contraseña',signed_in:'SESIÓN INICIADA',sign_out:'Cerrar sesión',preferred_language:'Idioma preferido',save_profile:'Guardar perfil',plan_center:'Centro del plan',plan_center_note:'Aquí aparecen tu plan GUANSHI actual, el período de acceso, el cupo de IA en la nube y las funciones incluidas. El pago sigue deshabilitado.',access_center:'Centro de acceso',access_center_note:'Aquí puedes ver qué productos RUNLU puede usar esta cuenta y la fuente activa de cada acceso. Esta zona es de solo lectura.',access_diagnostic:'Diagnóstico de acceso',access_diagnostic_note:'Comprobación de solo lectura de la cadena GUANSHI: cuenta, acceso al producto, plan, función y límite de uso.',overview:'Resumen de cuenta',overview_note:'Un resumen compacto y en vivo de tu acceso RUNLU.',overview_plan:'Plan',overview_access:'Acceso',overview_diagnostic:'Diagnóstico',overview_library:'Biblioteca',overview_store:'Tienda',library:'Biblioteca',library_note:'Los productos RUNLU vinculados explícitamente a esta cuenta aparecen aquí. Las compras gestionadas por Apple no se importan.',library_empty:'Todavía no hay productos RUNLU vinculados a esta cuenta.',open_product:'Abrir',store:'Vista previa de tienda',store_note:'No hay pagos de pago activos durante este piloto. Los planes gratuitos elegibles pueden activarse en tu Biblioteca; los planes de pago seguirán previstos hasta que el pago esté listo.',store_empty:'Todavía no hay ofertas directas de RUNLU disponibles.',planned:'Previsto',available:'Disponible',activate_free:'Activar gratis',activating_free:'Activando…',free_activated:'Plan gratuito activado y añadido a tu Biblioteca.',checkout_not_enabled:'Pago no habilitado',orders:'Pedidos',orders_note:'Reservados para futuras compras directas a RUNLU. Aún no están conectados.',subscriptions:'Suscripciones',subscriptions_note:'Reservadas para futuros servicios RUNLU. Las compras gestionadas por Apple siguen con Apple.',support_line:'Ayuda de cuenta:',privacy_line:'Privacidad:',signing_in:'Iniciando sesión…',creating:'Creando cuenta…',check_email:'Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.',signed_in_ok:'Sesión iniciada.',signed_out_ok:'Sesión cerrada.',profile_saved:'Perfil guardado.',reset_sent:'Si existe una cuenta para ese correo, se ha enviado un mensaje de restablecimiento.',password_saved:'Contraseña actualizada.',enter_email:'Introduce primero tu correo electrónico.',generic_error:'Algo salió mal. Inténtalo de nuevo.',suspended:'Esta cuenta está suspendida. Contacta con support@runlu.ca.'}
  };

  const id = (x) => document.getElementById(x);
  const el = {
    languageSelect:id('languageSelect'),signInTab:id('signInTab'),signUpTab:id('signUpTab'),authForm:id('authForm'),authSubmit:id('authSubmit'),forgotButton:id('forgotButton'),nameField:id('nameField'),displayName:id('displayName'),email:id('email'),password:id('password'),passwordHint:id('passwordHint'),authView:id('authView'),recoveryView:id('recoveryView'),recoveryForm:id('recoveryForm'),newPassword:id('newPassword'),accountView:id('accountView'),accountEmail:id('accountEmail'),signOutButton:id('signOutButton'),profileForm:id('profileForm'),profileName:id('profileName'),profileLocale:id('profileLocale'),libraryList:id('libraryList'),storeList:id('storeList'),statusBox:id('statusBox')
  };

  let mode = 'signin';
  let recoveryMode = initialRecoveryHint;
  let lang = normalize(localStorage.getItem('runlu-account-language') || navigator.language);
  let renderGeneration = 0;

  function normalize(v){v=String(v||'').toLowerCase();return v.startsWith('zh')?'zh':v.startsWith('fr')?'fr':v.startsWith('es')?'es':'en'}
  function t(k){return copy[lang]?.[k]||copy.en[k]||k}
  function applyLanguage(v){lang=normalize(v);localStorage.setItem('runlu-account-language',lang);document.documentElement.lang=lang==='zh'?'zh-Hans':lang;el.languageSelect.value=lang;document.querySelectorAll('[data-i18n]').forEach(n=>{const value=t(n.dataset.i18n);if(value)n.textContent=value});syncMode()}
  function showStatus(msg,error=false){el.statusBox.textContent=msg;el.statusBox.classList.toggle('error',error);el.statusBox.hidden=false}
  function clearStatus(){el.statusBox.hidden=true;el.statusBox.textContent='';el.statusBox.classList.remove('error')}
  function syncMode(){const up=mode==='signup';el.signInTab.classList.toggle('active',!up);el.signUpTab.classList.toggle('active',up);el.nameField.hidden=!up;el.passwordHint.hidden=!up;el.password.autocomplete=up?'new-password':'current-password';el.authSubmit.textContent=up?t('create_account'):t('sign_in');el.forgotButton.hidden=up}
  function setMode(v,{clear=true}={}){mode=v;if(clear)clearStatus();syncMode()}
  function busy(button,on,label){button.disabled=on;if(on){button.dataset.old=button.textContent;button.textContent=label}else{button.textContent=button.dataset.old||button.textContent;delete button.dataset.old;syncMode()}}
  function showRecovery(){el.authView.hidden=true;el.accountView.hidden=true;el.recoveryView.hidden=false}
  function safeProductUrl(value){if(!value)return null;try{const url=new URL(value,window.location.origin);return url.protocol==='https:'?url.href:null}catch{return null}}
  function emptyMessage(key,className){const p=document.createElement('p');p.className=className;p.dataset.i18n=key;p.textContent=t(key);return p}

  async function loadProfile(user){
    const {data,error}=await client.from('runlu_profiles').select('display_name,locale,account_tier,account_status,staff_role,created_at').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    if(data?.account_status==='suspended'){await client.auth.signOut();throw new Error(t('suspended'))}
    el.profileName.value=data?.display_name||'';
    el.profileLocale.value=data?.locale||lang;
  }

  async function loadLibrary(generation){
    if(!el.libraryList)return;
    const {data,error}=await client.from('runlu_account_library_v1')
      .select('product_key,name,kind,platform,access_url,lifecycle_status,commerce_status,starts_at,ends_at')
      .order('starts_at',{ascending:false});
    if(error)throw error;
    if(generation!==renderGeneration)return;

    const seen=new Set();
    const fragment=document.createDocumentFragment();
    for(const row of data||[]){
      if(seen.has(row.product_key))continue;
      seen.add(row.product_key);
      const item=document.createElement('div');item.className='library-item';
      const text=document.createElement('div');text.className='library-item-copy';
      const name=document.createElement('strong');name.textContent=row.name||row.product_key;
      const meta=document.createElement('span');meta.textContent=[row.kind,row.platform].filter(Boolean).join(' · ');
      text.append(name,meta);item.append(text);
      const href=safeProductUrl(row.access_url);
      if(href){const link=document.createElement('a');link.className='library-open';link.href=href;link.dataset.i18n='open_product';link.textContent=t('open_product');item.append(link)}
      fragment.append(item);
    }
    if(!fragment.childNodes.length)fragment.append(emptyMessage('library_empty','library-empty'));
    el.libraryList.replaceChildren(fragment);
  }

  async function loadStore(generation){
    if(!el.storeList)return;
    const [offersResult,ownedResult]=await Promise.all([
      client.from('runlu_store_offers_v1')
        .select('product_key,product_name,kind,platform,access_url,commerce_status,plan_key,plan_name,plan_type,billing_period,price_cad,availability,public_label,sort_order,action_state')
        .order('sort_order',{ascending:true}),
      client.from('runlu_account_library_v1').select('product_key')
    ]);
    if(offersResult.error)throw offersResult.error;
    if(ownedResult.error)throw ownedResult.error;
    if(generation!==renderGeneration)return;

    const ownedProducts=new Set((ownedResult.data||[]).map(row=>row.product_key));
    const seen=new Set();
    const fragment=document.createDocumentFragment();
    for(const row of offersResult.data||[]){
      if(seen.has(row.plan_key))continue;
      seen.add(row.plan_key);
      const item=document.createElement('div');item.className='store-item';
      const text=document.createElement('div');text.className='store-item-copy';
      const name=document.createElement('strong');name.textContent=row.plan_name||row.product_name||row.plan_key;
      const meta=document.createElement('span');meta.textContent=row.public_label||'';
      text.append(name,meta);item.append(text);

      if(row.action_state==='available_free'){
        const href=safeProductUrl(row.access_url);
        if(ownedProducts.has(row.product_key)){
          if(href){const link=document.createElement('a');link.className='store-action available';link.href=href;link.dataset.i18n='open_product';link.textContent=t('open_product');item.append(link)}
          else{const badge=document.createElement('span');badge.className='store-action available';badge.dataset.i18n='available';badge.textContent=t('available');item.append(badge)}
        }else{
          const button=document.createElement('button');button.type='button';button.className='store-action available';button.dataset.i18n='activate_free';button.textContent=t('activate_free');
          button.addEventListener('click',async()=>{
            clearStatus();button.disabled=true;button.textContent=t('activating_free');
            try{
              const {error:activationError}=await client.rpc('runlu_activate_free_plan',{p_plan_key:row.plan_key});
              if(activationError)throw activationError;
              showStatus(t('free_activated'));window.dispatchEvent(new CustomEvent('runlu:account-entitlements-changed',{detail:{productKey:row.product_key,planKey:row.plan_key}}));
              const nextGeneration=++renderGeneration;
              await Promise.all([loadLibrary(nextGeneration),loadStore(nextGeneration)]);
            }catch(e){showStatus(e?.message||t('generic_error'),true)}
            finally{if(button.isConnected){button.disabled=false;button.textContent=t('activate_free')}}
          });
          item.append(button);
        }
      }else{
        const badge=document.createElement('span');badge.className='store-action planned';
        const key=row.action_state==='ready_for_checkout'?'checkout_not_enabled':'planned';
        badge.dataset.i18n=key;badge.textContent=t(key);item.append(badge);
      }
      fragment.append(item);
    }
    if(!fragment.childNodes.length)fragment.append(emptyMessage('store_empty','library-empty'));
    el.storeList.replaceChildren(fragment);
  }

  async function renderSession(session){
    const generation=++renderGeneration;
    const user=session?.user;
    if(!user){el.authView.hidden=false;el.recoveryView.hidden=true;el.accountView.hidden=true;el.libraryList?.replaceChildren();el.storeList?.replaceChildren();return}
    if(recoveryMode){showRecovery();return}
    el.accountEmail.textContent=user.email||'—';
    el.authView.hidden=true;el.recoveryView.hidden=true;el.accountView.hidden=false;
    try{await loadProfile(user)}catch(e){showStatus(e?.message||t('generic_error'),true)}
    try{await Promise.all([loadLibrary(generation),loadStore(generation)])}catch(e){showStatus(e?.message||t('generic_error'),true)}
  }

  el.signInTab.addEventListener('click',()=>setMode('signin'));
  el.signUpTab.addEventListener('click',()=>setMode('signup'));
  el.languageSelect.addEventListener('change',e=>applyLanguage(e.target.value));

  el.authForm.addEventListener('submit',async e=>{
    e.preventDefault();clearStatus();const email=el.email.value.trim(),password=el.password.value,up=mode==='signup';busy(el.authSubmit,true,up?t('creating'):t('signing_in'));
    try{
      if(up){
        const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:ACCOUNT_RETURN_URL,data:{display_name:el.displayName.value.trim(),locale:lang}}});if(error)throw error;
        if(data.session){showStatus(t('signed_in_ok'));await renderSession(data.session)}else{setMode('signin',{clear:false});showStatus(t('check_email'))}
      }else{
        const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;showStatus(t('signed_in_ok'));await renderSession(data.session)
      }
    }catch(e2){showStatus(e2?.message||t('generic_error'),true)}finally{busy(el.authSubmit,false)}
  });

  el.forgotButton.addEventListener('click',async()=>{
    clearStatus();const email=el.email.value.trim();if(!email){showStatus(t('enter_email'),true);el.email.focus();return}el.forgotButton.disabled=true;
    try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:ACCOUNT_RETURN_URL});if(error)throw error;showStatus(t('reset_sent'))}catch(e){showStatus(e?.message||t('generic_error'),true)}finally{el.forgotButton.disabled=false}
  });

  el.recoveryForm.addEventListener('submit',async e=>{
    e.preventDefault();clearStatus();
    try{
      const {error}=await client.auth.updateUser({password:el.newPassword.value});if(error)throw error;
      recoveryMode=false;el.newPassword.value='';
      if(window.history?.replaceState)window.history.replaceState({},'',ACCOUNT_RETURN_URL);
      showStatus(t('password_saved'));
      const {data}=await client.auth.getSession();await renderSession(data.session)
    }catch(e2){showStatus(e2?.message||t('generic_error'),true)}
  });

  el.profileForm.addEventListener('submit',async e=>{
    e.preventDefault();clearStatus();try{const {data,error}=await client.auth.getSession();if(error)throw error;const user=data.session?.user;if(!user)throw new Error('Session not found.');const result=await client.from('runlu_profiles').update({display_name:el.profileName.value.trim()||null,locale:el.profileLocale.value}).eq('user_id',user.id);if(result.error)throw result.error;applyLanguage(el.profileLocale.value);showStatus(t('profile_saved'))}catch(e2){showStatus(e2?.message||t('generic_error'),true)}
  });

  el.signOutButton.addEventListener('click',async()=>{
    clearStatus();el.signOutButton.disabled=true;try{const {error}=await client.auth.signOut();if(error)throw error;recoveryMode=false;el.password.value='';await renderSession(null);showStatus(t('signed_out_ok'))}catch(e){showStatus(e?.message||t('generic_error'),true)}finally{el.signOutButton.disabled=false}
  });

  client.auth.onAuthStateChange((event,session)=>{
    if(event==='PASSWORD_RECOVERY'){
      recoveryMode=true;
      queueMicrotask(()=>{clearStatus();showRecovery()});
      return;
    }
    if(['SIGNED_IN','INITIAL_SESSION','USER_UPDATED'].includes(event))setTimeout(()=>renderSession(session),0);
    if(event==='SIGNED_OUT')setTimeout(()=>renderSession(null),0);
  });

  applyLanguage(lang);
  client.auth.getSession().then(({data,error})=>{
    if(error)showStatus(error.message,true);
    else renderSession(data.session)
  });
})();
