(() => {
'use strict';
const URL='https://ekrnknlawekeoszzkamd.supabase.co',KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
if(!window.supabase?.createClient)return;
const client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const box=document.getElementById('accountOverview');if(!box)return;
const copy={
en:{loading:'Loading account overview…',plan:'GUANSHI plan',products:'Products',ai:'Cloud AI today',health:'Access health',ready:'All ready',attention:'Attention',blocked:'Blocked',none:'None',free:'GUANSHI Free',monthly:'GUANSHI Plus Monthly',annual:'GUANSHI Plus Annual',remaining:(r,l)=>r+' / '+l+' left',jumpPlan:'Plan',jumpAccess:'Access',jumpDiagnostic:'Diagnostic',jumpLibrary:'Library',jumpStore:'Store'},
zh:{loading:'正在读取账户总览…',plan:'观势方案',products:'产品权限',ai:'今日云端 AI',health:'权限健康',ready:'全部正常',attention:'需注意',blocked:'受限',none:'无',free:'观势 Free',monthly:'观势 Plus 月付',annual:'观势 Plus 年付',remaining:(r,l)=>'剩余 '+r+' / '+l,jumpPlan:'方案',jumpAccess:'权限',jumpDiagnostic:'诊断',jumpLibrary:'资料库',jumpStore:'商店'},
fr:{loading:'Chargement de la vue d’ensemble…',plan:'Forfait GUANSHI',products:'Produits',ai:'IA cloud aujourd’hui',health:'Santé des accès',ready:'Tout est prêt',attention:'Attention',blocked:'Bloqué',none:'Aucun',free:'GUANSHI Free',monthly:'GUANSHI Plus mensuel',annual:'GUANSHI Plus annuel',remaining:(r,l)=>r+' / '+l+' restantes',jumpPlan:'Forfait',jumpAccess:'Accès',jumpDiagnostic:'Diagnostic',jumpLibrary:'Bibliothèque',jumpStore:'Boutique'},
es:{loading:'Cargando resumen de cuenta…',plan:'Plan GUANSHI',products:'Productos',ai:'IA en la nube hoy',health:'Estado de acceso',ready:'Todo listo',attention:'Atención',blocked:'Bloqueado',none:'Ninguno',free:'GUANSHI Free',monthly:'GUANSHI Plus mensual',annual:'GUANSHI Plus anual',remaining:(r,l)=>r+' / '+l+' restantes',jumpPlan:'Plan',jumpAccess:'Acceso',jumpDiagnostic:'Diagnóstico',jumpLibrary:'Biblioteca',jumpStore:'Tienda'}};
let gen=0;
function lang(){const v=(localStorage.getItem('runlu-account-language')||document.documentElement.lang||navigator.language||'en').toLowerCase();return v.startsWith('zh')?'zh':v.startsWith('fr')?'fr':v.startsWith('es')?'es':'en'}
function t(k,...a){const v=copy[lang()]?.[k]??copy.en[k]??k;return typeof v==='function'?v(...a):v}
function planName(k){return k==='guanshi-plus-monthly'?t('monthly'):k==='guanshi-plus-annual'?t('annual'):k==='guanshi-free'?t('free'):t('none')}
function card(label,value,cls=''){const d=document.createElement('div');d.className='overview-card';const s=document.createElement('span');s.textContent=label;const b=document.createElement('strong');b.textContent=value;if(cls)b.className=cls;d.append(s,b);return d}
function render(plan,access,usage,diagnostics){
 const grid=document.createElement('div');grid.className='overview-grid';
 const ds=diagnostics||[],blocked=ds.filter(x=>x.status==='blocked').length,limited=ds.filter(x=>x.status==='limited').length;
 const health=blocked?t('blocked'):limited?t('attention'):t('ready'),healthClass=blocked?'blocked':limited?'attention':'ready';
 grid.append(card(t('plan'),plan?.resolved?planName(plan.plan_key):t('none')),card(t('products'),String((access||[]).length)),card(t('ai'),usage?t('remaining',usage.remaining_today,usage.daily_limit):'—'),card(t('health'),health,'overview-health '+healthClass));
 box.replaceChildren(grid);
}
async function load(){
 const token=++gen;box.textContent=t('loading');
 const {data:s}=await client.auth.getSession();if(token!==gen)return;if(!s?.session?.user){box.replaceChildren();return}
 const [p,a,u,...d]=await Promise.all([
  client.rpc('runlu_get_my_plan_transition_state',{p_product_key:'guanshi'}),
  client.rpc('runlu_get_my_access_sources'),
  client.rpc('runlu_get_my_guanshi_cloud_ai_usage'),
  ...['guanshi-consult.html','guanshi-traditional-consult.html','guanshi-validation.html','guanshi-library.html','guanshi-vault.html'].map(page=>client.rpc('runlu_get_my_access_diagnostic',{p_page_path:page}))
 ]);
 if(token!==gen)return;
 render(p.error?null:p.data,a.error?[]:(a.data||[]),u.error?null:(Array.isArray(u.data)?u.data[0]:u.data),d.map(x=>x.error?{status:'blocked'}:x.data));
}
client.auth.onAuthStateChange(e=>{if(['SIGNED_IN','INITIAL_SESSION','USER_UPDATED','TOKEN_REFRESHED','SIGNED_OUT'].includes(e))setTimeout(load,0)});
window.addEventListener('storage',e=>{if(e.key==='runlu-account-language')load()});
window.addEventListener('runlu:account-entitlements-changed',()=>load());
client.auth.getSession().then(load);
})();