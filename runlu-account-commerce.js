(() => {
  'use strict';

  const SUPABASE_URL = 'https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  if (!window.supabase?.createClient) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  const copy = {
    en:{link_title:'Link a past purchase',link_note:'Bought with another email? Verify the purchase once and keep it linked to this account.',purchase_email:'Purchase email',session_id:'Stripe checkout session ID',link_button:'Verify & link',linking:'Verifying…',linked:'Purchase linked. Downloads refreshed.',link_failed:'We could not verify that paid purchase. Check the purchase email and checkout session ID.',downloads:'Downloads',download_ready:'Purchased download · private link valid 5 min',orders_empty:'No RUNLU-direct orders yet.',subscriptions_empty:'No RUNLU-direct subscriptions yet.',items:'items',renewal:'Current period',cancel_end:'Cancels at period end'},
    zh:{link_title:'绑定历史购买',link_note:'如果购买时使用了另一个邮箱，可验证一次并永久绑定到当前账户。',purchase_email:'购买邮箱',session_id:'Stripe 结账 Session ID',link_button:'验证并绑定',linking:'正在验证…',linked:'购买已绑定，下载已刷新。',link_failed:'未能验证这笔已付款购买，请检查购买邮箱和结账 Session ID。',downloads:'下载',download_ready:'已购商品下载 · 私密链接有效 5 分钟',orders_empty:'目前还没有 RUNLU 直售订单。',subscriptions_empty:'目前还没有 RUNLU 直售订阅。',items:'项',renewal:'当前周期',cancel_end:'本周期结束后取消'},
    fr:{link_title:'Lier un achat antérieur',link_note:'Achat effectué avec un autre e-mail ? Vérifiez-le une fois pour le lier à ce compte.',purchase_email:'E-mail d’achat',session_id:'ID de session Stripe Checkout',link_button:'Vérifier et lier',linking:'Vérification…',linked:'Achat lié. Téléchargements actualisés.',link_failed:'Impossible de vérifier cet achat payé. Vérifiez l’e-mail et l’ID de session.',downloads:'Télécharger',download_ready:'Téléchargement acheté · lien privé valable 5 min',orders_empty:'Aucune commande directe RUNLU pour le moment.',subscriptions_empty:'Aucun abonnement direct RUNLU pour le moment.',items:'articles',renewal:'Période actuelle',cancel_end:'Annulation en fin de période'},
    es:{link_title:'Vincular una compra anterior',link_note:'¿Compraste con otro correo? Verifica la compra una vez y quedará vinculada a esta cuenta.',purchase_email:'Correo de compra',session_id:'ID de sesión de Stripe Checkout',link_button:'Verificar y vincular',linking:'Verificando…',linked:'Compra vinculada. Descargas actualizadas.',link_failed:'No pudimos verificar esa compra pagada. Revisa el correo y el ID de sesión.',downloads:'Descargar',download_ready:'Descarga comprada · enlace privado válido 5 min',orders_empty:'Todavía no hay pedidos directos de RUNLU.',subscriptions_empty:'Todavía no hay suscripciones directas de RUNLU.',items:'artículos',renewal:'Período actual',cancel_end:'Se cancela al final del período'}
  };

  const ordersList = document.getElementById('ordersList');
  const subscriptionsList = document.getElementById('subscriptionsList');
  const linkForm=document.getElementById('purchaseLinkForm');
  const linkEmail=document.getElementById('purchaseLinkEmail');
  const linkSession=document.getElementById('purchaseLinkSession');
  const linkStatus=document.getElementById('purchaseLinkStatus');
  const linkButton=document.getElementById('purchaseLinkButton');
  let generation = 0;

  function language(){
    const value=(localStorage.getItem('runlu-account-language')||document.documentElement.lang||navigator.language||'en').toLowerCase();
    return value.startsWith('zh')?'zh':value.startsWith('fr')?'fr':value.startsWith('es')?'es':'en';
  }
  function t(key){const lang=language();return copy[lang]?.[key]||copy.en[key]||key}
  function empty(container,key){
    if(!container)return;
    const p=document.createElement('p');p.className='library-empty';p.textContent=t(key);
    container.replaceChildren(p);
  }
  function money(value,currency){
    const amount=Number(value||0);
    try{return new Intl.NumberFormat(undefined,{style:'currency',currency:currency||'CAD'}).format(amount)}catch{return `${currency||'CAD'} ${amount.toFixed(2)}`}
  }
  function date(value){
    if(!value)return '';
    const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
    return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d);
  }
  function rowCard(title,meta,status){
    const item=document.createElement('div');item.className='library-item';
    const text=document.createElement('div');text.className='library-item-copy';
    const strong=document.createElement('strong');strong.textContent=title;
    const span=document.createElement('span');span.textContent=meta;
    text.append(strong,span);item.append(text);
    if(status){const badge=document.createElement('span');badge.className='store-action planned';badge.textContent=status;item.append(badge)}
    return item;
  }


  async function autoLinkCheckout(session){
    const params=new URLSearchParams(window.location.search);
    const sessionId=String(params.get('session_id')||'').trim();
    if(params.get('checkout')!=='success'||!sessionId||!session?.access_token)return false;
    const endpoint='https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-digital-download';
    const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'link_purchase_by_session',session_id:sessionId})});
    const payload=await res.json().catch(()=>({}));
    if(!res.ok||!payload.ok)return false;
    const clean=window.location.pathname+'?checkout=success#orders';
    window.history.replaceState({},'',clean);
    return true;
  }

  async function loadPurchasedDownloads(session,token){
    if(!ordersList||!session?.access_token)return;
    const endpoint='https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-digital-download';
    const request=async(accessToken)=>fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+accessToken},body:JSON.stringify({action:'account_downloads'})});
    let res=await request(session.access_token);
    let payload=await res.json().catch(()=>({}));
    if(res.status===401){
      const refreshed=await client.auth.refreshSession();
      const freshSession=refreshed?.data?.session;
      if(freshSession?.access_token){
        res=await request(freshSession.access_token);
        payload=await res.json().catch(()=>({}));
      }
    }
    if(!res.ok||!payload.ok||token!==generation)return;
    if((payload.downloads||[]).length) ordersList.querySelectorAll('.library-empty').forEach(n=>n.remove());
    for(const d of payload.downloads||[]){
      const card=rowCard(d.filename||d.product_key,t('download_ready'),'');
      const a=document.createElement('a');a.className='store-action available';a.href=d.download_url;a.rel='noopener';a.textContent=t('downloads');card.append(a);
      ordersList.prepend(card);
    }
  }

  async function loadOrders(token){
    if(!ordersList)return;
    const {data,error}=await client.from('runlu_account_orders_v1')
      .select('id,order_number,currency,total,status,created_at,item_count')
      .order('created_at',{ascending:false});
    if(error)throw error;if(token!==generation)return;
    const fragment=document.createDocumentFragment();
    for(const row of data||[]){
      const meta=[date(row.created_at),money(row.total,row.currency),`${row.item_count||0} ${t('items')}`].filter(Boolean).join(' · ');
      fragment.append(rowCard(row.order_number||'RUNLU order',meta,row.status));
    }
    if(!fragment.childNodes.length){const p=document.createElement('p');p.className='library-empty';p.textContent=t('orders_empty');fragment.append(p)}
    ordersList.replaceChildren(fragment);
  }

  async function loadSubscriptions(token){
    if(!subscriptionsList)return;
    const {data,error}=await client.from('runlu_account_subscriptions_v1')
      .select('id,product_name,plan_name,status,current_period_start,current_period_end,cancel_at_period_end,created_at')
      .order('created_at',{ascending:false});
    if(error)throw error;if(token!==generation)return;
    const fragment=document.createDocumentFragment();
    for(const row of data||[]){
      const period=row.current_period_start||row.current_period_end ? `${t('renewal')}: ${date(row.current_period_start)} – ${date(row.current_period_end)}` : '';
      const meta=[row.product_name,period,row.cancel_at_period_end?t('cancel_end'):''].filter(Boolean).join(' · ');
      fragment.append(rowCard(row.plan_name||row.product_name||'RUNLU subscription',meta,row.status));
    }
    if(!fragment.childNodes.length){const p=document.createElement('p');p.className='library-empty';p.textContent=t('subscriptions_empty');fragment.append(p)}
    subscriptionsList.replaceChildren(fragment);
  }

  async function render(session){
    const token=++generation;
    if(!session?.user){ordersList?.replaceChildren();subscriptionsList?.replaceChildren();return}
    try{
      await autoLinkCheckout(session);
      await Promise.all([loadOrders(token),loadSubscriptions(token)]);
      await loadPurchasedDownloads(session,token);
    }
    catch{if(token===generation){empty(ordersList,'orders_empty');empty(subscriptionsList,'subscriptions_empty')}}
  }


  client.auth.onAuthStateChange((event,session)=>{
    if(['SIGNED_IN','INITIAL_SESSION','USER_UPDATED','TOKEN_REFRESHED'].includes(event))setTimeout(()=>render(session),0);
    if(event==='SIGNED_OUT')setTimeout(()=>render(null),0);
  });

  client.auth.getSession().then(({data})=>render(data?.session||null));
  window.addEventListener('storage',e=>{if(e.key==='runlu-account-language')client.auth.getSession().then(({data})=>render(data?.session||null))});
})();
