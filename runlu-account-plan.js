(() => {
  'use strict';
  const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  if(!window.supabase?.createClient)return;
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const box=document.getElementById('planCenter');if(!box)return;
  const copy={
    en:{loading:'Loading plan…',empty:'No account plan is active yet.',current:'Current plan',ai:'Cloud AI today',period:'Access period',free:'GUANSHI Free',monthly:'GUANSHI Plus Monthly',annual:'GUANSHI Plus Annual',active:'Active',paid:'Paid active',cancel:'Cancels at period end',internal:'Internal access · Free capability profile',remaining:(r,l)=>`${r} of ${l} remaining`,until:d=>`Paid through ${d}`,ongoing:'Ongoing',note:'Paid checkout remains disabled in this private pilot. This panel is read-only.'},
    zh:{loading:'正在读取方案…',empty:'当前没有有效的账户方案。',current:'当前方案',ai:'今日云端 AI',period:'权限周期',free:'观势 Free',monthly:'观势 Plus 月付',annual:'观势 Plus 年付',active:'有效',paid:'付费权限有效',cancel:'本周期结束后取消',internal:'内部权限 · Free 功能配置',remaining:(r,l)=>`剩余 ${r} / ${l} 次`,until:d=>`付费权限持续至 ${d}`,ongoing:'持续有效',note:'当前仍为内部试运行，付费结账尚未启用；此面板只读。'},
    fr:{loading:'Chargement du forfait…',empty:'Aucun forfait de compte actif.',current:'Forfait actuel',ai:'IA cloud aujourd’hui',period:'Période d’accès',free:'GUANSHI Free',monthly:'GUANSHI Plus mensuel',annual:'GUANSHI Plus annuel',active:'Actif',paid:'Accès payant actif',cancel:'Annulation en fin de période',internal:'Accès interne · profil de capacités Free',remaining:(r,l)=>`${r} sur ${l} restantes`,until:d=>`Payé jusqu’au ${d}`,ongoing:'Continu',note:'Le paiement reste désactivé dans ce pilote privé. Ce panneau est en lecture seule.'},
    es:{loading:'Cargando plan…',empty:'No hay un plan de cuenta activo.',current:'Plan actual',ai:'IA en la nube hoy',period:'Período de acceso',free:'GUANSHI Free',monthly:'GUANSHI Plus mensual',annual:'GUANSHI Plus anual',active:'Activo',paid:'Acceso de pago activo',cancel:'Se cancela al final del período',internal:'Acceso interno · perfil de capacidades Free',remaining:(r,l)=>`${r} de ${l} restantes`,until:d=>`Pagado hasta ${d}`,ongoing:'Continuo',note:'El pago sigue deshabilitado en este piloto privado. Este panel es de solo lectura.'}
  };
  let generation=0;
  function lang(){const v=(localStorage.getItem('runlu-account-language')||document.documentElement.lang||navigator.language||'en').toLowerCase();return v.startsWith('zh')?'zh':v.startsWith('fr')?'fr':v.startsWith('es')?'es':'en'}
  function t(k,...args){const v=copy[lang()]?.[k]??copy.en[k]??k;return typeof v==='function'?v(...args):v}
  function date(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d)}
  function planName(k){return k==='guanshi-plus-monthly'?t('monthly'):k==='guanshi-plus-annual'?t('annual'):t('free')}
  function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
  function loading(){const p=node('p','plan-loading',t('loading'));box.replaceChildren(p)}
  function empty(){const p=node('p','plan-loading',t('empty'));box.replaceChildren(p)}
  function render(state,usage){
    if(!state?.resolved){empty();return}
    const hero=node('div','plan-hero'),title=node('div','plan-title'),strong=node('strong','',planName(state.plan_key));
    let source=state.lifecycle_state==='paid_through_cancellation'?t('cancel'):state.lifecycle_state==='paid_active'?t('paid'):state.resolution_source==='access_fallback'?t('internal'):t('active');
    title.append(strong,node('span','',source));hero.append(title,node('span','plan-badge',state.plan_key?.includes('plus')?'PLUS':'FREE'));
    const stats=node('div','plan-stats');
    const current=node('div','plan-stat');current.append(node('span','',t('current')),node('strong','',planName(state.plan_key)));
    const ai=node('div','plan-stat');ai.append(node('span','',t('ai')),node('strong','',usage?t('remaining',usage.remaining_today,usage.daily_limit):'—'));
    const period=node('div','plan-stat');period.append(node('span','',t('period')),node('strong','',state.paid_through_until?t('until',date(state.paid_through_until)):t('ongoing')));
    stats.append(current,ai,period);
    box.replaceChildren(hero,stats,node('div','plan-note',t('note')));
  }
  async function load(){
    const token=++generation;loading();
    const {data:sessionData}=await client.auth.getSession();if(token!==generation)return;
    if(!sessionData?.session?.user){box.replaceChildren();return}
    const [stateResult,usageResult]=await Promise.all([
      client.rpc('runlu_get_my_plan_transition_state',{p_product_key:'guanshi'}),
      client.rpc('runlu_get_my_guanshi_cloud_ai_usage')
    ]);
    if(token!==generation)return;
    if(stateResult.error){empty();return}
    const usage=usageResult.error?null:(Array.isArray(usageResult.data)?usageResult.data[0]:usageResult.data);
    render(stateResult.data,usage);
  }
  client.auth.onAuthStateChange((event)=>{if(['SIGNED_IN','INITIAL_SESSION','USER_UPDATED','TOKEN_REFRESHED','SIGNED_OUT'].includes(event))setTimeout(load,0)});
  window.addEventListener('storage',e=>{if(e.key==='runlu-account-language')load()});
  window.addEventListener('runlu:account-entitlements-changed',()=>load());
  client.auth.getSession().then(()=>load());
})();