(() => {
  'use strict';
  const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  if(!window.supabase?.createClient)return;
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const box=document.getElementById('accessCenter');if(!box)return;
  const copy={
    en:{loading:'Loading access sources…',empty:'No active RUNLU access sources yet.',owner:'Owner access',manual:'Granted access',free:'Free plan',subscription:'Subscription',purchase:'Purchase',legacy:'Previous purchase access',permanent:'Permanent access',since:d=>`Since ${d}`,through:d=>`Through ${d}`,plan:p=>`Plan: ${p}`},
    zh:{loading:'正在读取权限来源…',empty:'当前没有有效的 RUNLU 权限来源。',owner:'Owner 权限',manual:'授权访问',free:'免费方案',subscription:'订阅',purchase:'购买权限',legacy:'历史购买权限',permanent:'长期有效',since:d=>`自 ${d} 起`,through:d=>`有效至 ${d}`,plan:p=>`方案：${p}`},
    fr:{loading:'Chargement des sources d’accès…',empty:'Aucune source d’accès RUNLU active.',owner:'Accès propriétaire',manual:'Accès accordé',free:'Offre gratuite',subscription:'Abonnement',purchase:'Achat',legacy:'Accès d’achat antérieur',permanent:'Accès permanent',since:d=>`Depuis le ${d}`,through:d=>`Jusqu’au ${d}`,plan:p=>`Forfait : ${p}`},
    es:{loading:'Cargando fuentes de acceso…',empty:'No hay fuentes de acceso RUNLU activas.',owner:'Acceso de propietario',manual:'Acceso concedido',free:'Plan gratuito',subscription:'Suscripción',purchase:'Compra',legacy:'Acceso de compra anterior',permanent:'Acceso permanente',since:d=>`Desde ${d}`,through:d=>`Hasta ${d}`,plan:p=>`Plan: ${p}`}
  };
  let generation=0;
  function lang(){const v=(localStorage.getItem('runlu-account-language')||document.documentElement.lang||navigator.language||'en').toLowerCase();return v.startsWith('zh')?'zh':v.startsWith('fr')?'fr':v.startsWith('es')?'es':'en'}
  function t(k,...args){const v=copy[lang()]?.[k]??copy.en[k]??k;return typeof v==='function'?v(...args):v}
  function date(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d)}
  function source(type){
    if(type==='owner_seed')return ['owner','owner'];
    if(type==='manual')return ['manual',''];
    if(type==='free_plan')return ['free','free'];
    if(type==='subscription')return ['subscription','subscription'];
    if(type==='commerce_order')return ['purchase',''];
    return ['legacy',''];
  }
  function loading(){const p=document.createElement('p');p.className='access-empty';p.textContent=t('loading');box.replaceChildren(p)}
  function empty(){const p=document.createElement('p');p.className='access-empty';p.textContent=t('empty');box.replaceChildren(p)}
  function render(rows){
    if(!rows?.length){empty();return}
    const fragment=document.createDocumentFragment();
    for(const row of rows){
      const item=document.createElement('div');item.className='access-item';
      const body=document.createElement('div');body.className='access-copy';
      const name=document.createElement('strong');name.textContent=row.product_name||row.product_key;
      const meta=document.createElement('span');
      const bits=[];
      if(row.plan_key)bits.push(t('plan',row.plan_key));
      bits.push(row.perpetual?t('permanent'):(row.ends_at?t('through',date(row.ends_at)):''));
      if(row.starts_at)bits.push(t('since',date(row.starts_at)));
      meta.textContent=bits.filter(Boolean).join(' · ');
      body.append(name,meta);
      const [labelKey,cls]=source(row.basis_type);
      const badge=document.createElement('span');badge.className='access-source '+cls;badge.textContent=t(labelKey);
      item.append(body,badge);fragment.append(item);
    }
    box.replaceChildren(fragment);
  }
  async function load(){
    const token=++generation;loading();
    const {data:sessionData}=await client.auth.getSession();if(token!==generation)return;
    if(!sessionData?.session?.user){box.replaceChildren();return}
    const {data,error}=await client.rpc('runlu_get_my_access_sources');
    if(token!==generation)return;
    if(error){empty();return}
    render(data||[]);
  }
  client.auth.onAuthStateChange((event)=>{if(['SIGNED_IN','INITIAL_SESSION','USER_UPDATED','TOKEN_REFRESHED','SIGNED_OUT'].includes(event))setTimeout(load,0)});
  window.addEventListener('storage',e=>{if(e.key==='runlu-account-language')load()});
  window.addEventListener('runlu:account-entitlements-changed',()=>load());
  client.auth.getSession().then(()=>load());
})();