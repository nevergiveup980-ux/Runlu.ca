(() => {
'use strict';
const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co',SUPABASE_PUBLISHABLE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn',PRODUCT_KEY='guanshi';
const root=document.documentElement;root.classList.add('runlu-access-pending');
const REQUIRED_CAPABILITY=root.dataset.runluCapability||'';
const copy={
en:{kicker:'RUNLU FORESIGHT · ACCOUNT ACCESS',checking:'Checking access…',checkingBody:'Confirming your RUNLU Account and GUANSHI access.',signin:'Sign in to continue',signinBody:'GUANSHI tools now use RUNLU Account access. Sign in, then activate the free plan if it is not already in your Library.',activate:'Activate GUANSHI Free',activateBody:'Your RUNLU Account is signed in, but GUANSHI access is not active yet. Activate the free plan in Account; no payment is required.',account:'Open RUNLU Account',home:'Back to Foresight',capability:'Feature not included',capabilityBody:'Your GUANSHI access is active, but this feature is not enabled for the current plan.',error:'Access check unavailable',errorBody:'We could not verify GUANSHI access right now. Your data has not been changed.'},
zh:{kicker:'RUNLU 观势 · 账户权限',checking:'正在检查权限…',checkingBody:'正在确认你的 RUNLU 账户与观势使用权限。',signin:'登录后继续',signinBody:'观势工具现在使用 RUNLU Account 权限。请先登录；如果资料库里还没有观势，再免费激活即可。',activate:'免费激活 GUANSHI',activateBody:'RUNLU 账户已经登录，但观势权限尚未激活。请到 Account 免费激活，不需要付款。',account:'打开 RUNLU Account',home:'返回观势首页',capability:'当前方案未包含此功能',capabilityBody:'你的观势权限有效，但当前方案尚未启用这个功能。',error:'暂时无法检查权限',errorBody:'目前无法确认观势权限；你的任何资料都没有被改动。'},
fr:{kicker:'RUNLU FORESIGHT · ACCÈS COMPTE',checking:'Vérification de l’accès…',checkingBody:'Confirmation de votre compte RUNLU et de l’accès GUANSHI.',signin:'Se connecter pour continuer',signinBody:'Les outils GUANSHI utilisent maintenant l’accès RUNLU Account. Connectez-vous puis activez l’offre gratuite si nécessaire.',activate:'Activer GUANSHI gratuitement',activateBody:'Votre compte RUNLU est connecté, mais l’accès GUANSHI n’est pas encore actif. Activez l’offre gratuite dans Account ; aucun paiement n’est requis.',account:'Ouvrir RUNLU Account',home:'Retour à Foresight',capability:'Fonction non incluse',capabilityBody:'Votre accès GUANSHI est actif, mais cette fonction n’est pas activée pour le forfait actuel.',error:'Vérification indisponible',errorBody:'Impossible de confirmer l’accès GUANSHI pour le moment. Aucune donnée n’a été modifiée.'},
es:{kicker:'RUNLU FORESIGHT · ACCESO DE CUENTA',checking:'Comprobando acceso…',checkingBody:'Confirmando tu cuenta RUNLU y el acceso a GUANSHI.',signin:'Inicia sesión para continuar',signinBody:'Las herramientas GUANSHI ahora usan el acceso de RUNLU Account. Inicia sesión y activa el plan gratuito si todavía no está en tu Biblioteca.',activate:'Activar GUANSHI gratis',activateBody:'Tu cuenta RUNLU está iniciada, pero el acceso a GUANSHI aún no está activo. Activa el plan gratuito en Account; no requiere pago.',account:'Abrir RUNLU Account',home:'Volver a Foresight',capability:'Función no incluida',capabilityBody:'Tu acceso a GUANSHI está activo, pero esta función no está habilitada para el plan actual.',error:'Comprobación no disponible',errorBody:'No pudimos confirmar el acceso a GUANSHI ahora. No se ha modificado ningún dato.'}};
function lang(){const v=String(localStorage.getItem('runlu_site_language')||localStorage.getItem('runlu-account-language')||navigator.language||'en').toLowerCase();return v.startsWith('zh')?'zh':v.startsWith('fr')?'fr':v.startsWith('es')?'es':'en'}
function t(k){return copy[lang()]?.[k]||copy.en[k]||k}
function gate(){let el=document.getElementById('runluAccessGate');if(el)return el;el=document.createElement('div');el.id='runluAccessGate';el.className='runlu-access-gate';el.innerHTML='<section class="runlu-access-card" role="dialog" aria-modal="true" aria-live="polite"><p class="runlu-access-kicker"></p><h2></h2><p class="runlu-access-body"></p><div class="runlu-access-actions"></div><div class="runlu-access-state"></div></section>';document.body.append(el);return el}
function show(titleKey,bodyKey,opts={}){const account=opts.account!==false,home=opts.home!==false,state=opts.state||'',el=gate();el.hidden=false;el.querySelector('.runlu-access-kicker').textContent=t('kicker');el.querySelector('h2').textContent=t(titleKey);el.querySelector('.runlu-access-body').textContent=t(bodyKey);const actions=el.querySelector('.runlu-access-actions');actions.replaceChildren();if(account){const a=document.createElement('a');a.className='primary';a.href='account.html';a.textContent=t('account');actions.append(a)}if(home){const a=document.createElement('a');a.className='secondary';a.href='guanshi.html';a.textContent=t('home');actions.append(a)}el.querySelector('.runlu-access-state').textContent=state}
function updateUsageMeter(capabilities,effectivePlan,usage){
  const el=document.querySelector('[data-runlu-usage-meter]'),rule=capabilities?.['guanshi.cloud_ai'];if(!el||!rule)return;
  const n=Number(rule.limit_value||0),period=rule.limit_period||'day';
  if(!(rule.enabled===true&&rule.config_status==='active'&&n>0&&period==='day'))return;
  const plan=effectivePlan==='guanshi-free'?'Free':effectivePlan?.includes('annual')?'Plus Annual':effectivePlan?.includes('monthly')?'Plus Monthly':'Current plan',remaining=Number(usage?.remaining_today);
  const values={
    en:`${plan} · ${n} cloud AI analyses per account per day${Number.isFinite(remaining)?` · ${remaining} remaining today`:''}. Capacity and protected budget limits may pause generation earlier.`,
    zh:`${plan==='Free'?'免费方案':plan} · 每个账号每天 ${n} 次云端 AI 观势${Number.isFinite(remaining)?` · 今天剩余 ${remaining} 次`:''}；遇到小时容量或受保护预算上限时，系统可能更早暂停生成。`,
    fr:`${plan} · ${n} analyses IA cloud par compte et par jour${Number.isFinite(remaining)?` · ${remaining} restantes aujourd’hui`:''}. La capacité ou le budget protégé peuvent suspendre la génération plus tôt.`,
    es:`${plan} · ${n} análisis de IA en la nube por cuenta al día${Number.isFinite(remaining)?` · ${remaining} restantes hoy`:''}. La capacidad o el presupuesto protegido pueden pausar antes la generación.`
  };
  for(const [k,v] of Object.entries(values))el.dataset[k]=v;
  el.textContent=values[lang()]||values.en;
}
function grant(client,session,capabilities,effectivePlan,usage){window.RUNLU_AUTH={client,accessToken:session.access_token,userId:session.user.id,hasGuanshiAccess:true,effectivePlan,capabilities,usage};updateUsageMeter(capabilities,effectivePlan,usage);root.classList.remove('runlu-access-pending');root.classList.add('runlu-access-granted');document.getElementById('runluAccessGate')?.remove();window.dispatchEvent(new CustomEvent('runlu:guanshi-access',{detail:{granted:true,userId:session.user.id,effectivePlan,requiredCapability:REQUIRED_CAPABILITY}}))}
async function check(){show('checking','checkingBody',{account:false});if(!window.supabase?.createClient){show('error','errorBody');return}const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});window.RUNLU_AUTH={client,accessToken:null,userId:null,hasGuanshiAccess:false};const sessionResult=await client.auth.getSession();if(sessionResult.error){show('error','errorBody',{state:sessionResult.error.message});return}const session=sessionResult.data?.session;if(!session){show('signin','signinBody');return}window.RUNLU_AUTH.accessToken=session.access_token;window.RUNLU_AUTH.userId=session.user.id;const result=await client.from('runlu_account_library_v1').select('product_key').eq('product_key',PRODUCT_KEY).maybeSingle();if(result.error){show('error','errorBody',{state:result.error.message});return}if(!result.data){show('activate','activateBody');return}
    const capabilityResult=await client.rpc('runlu_get_user_capabilities',{p_product_key:PRODUCT_KEY});
    if(capabilityResult.error){show('error','errorBody',{state:capabilityResult.error.message});return}
    const rows=capabilityResult.data||[],capabilities=Object.fromEntries(rows.map(row=>[row.capability_key,row]));
    const effectivePlan=rows[0]?.effective_plan_key||null;
    if(REQUIRED_CAPABILITY){
      const rule=capabilities[REQUIRED_CAPABILITY];
      if(!rule||rule.enabled!==true||rule.config_status!=='active'){
        show('capability','capabilityBody',{state:effectivePlan?('Plan: '+effectivePlan):''});return;
      }
    }
    let usage=null;
    const cloudRule=capabilities['guanshi.cloud_ai'];
    if(cloudRule?.enabled===true&&cloudRule?.config_status==='active'){
      const usageResult=await client.rpc('runlu_get_my_guanshi_cloud_ai_usage');
      if(!usageResult.error)usage=Array.isArray(usageResult.data)?usageResult.data[0]:usageResult.data;
    }
    grant(client,session,capabilities,effectivePlan,usage)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
})();