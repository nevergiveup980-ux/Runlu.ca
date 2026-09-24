(() => {
  const cfg = window.RUNLUCommerceConfig;
  if (!cfg || !cfg.products) return;

  const STORAGE_KEY = "runlu-bag-v1";
  const labels = {
    en:{bag:"Bag",add:"Add to Bag",added:"Added",title:"Your Bag",empty:"Your bag is empty.",subtotal:"Subtotal",checkout:"Checkout",remove:"Remove",close:"Close",signin:"Sign in to RUNLU Account to continue.",error:"Could not start checkout. Please try again."},
    zh:{bag:"购物袋",add:"加入购物袋",added:"已加入",title:"购物袋",empty:"购物袋还是空的。",subtotal:"小计",checkout:"结账",remove:"移除",close:"关闭",signin:"请先登录 RUNLU 账户再继续。",error:"暂时无法开始结账，请再试一次。"},
    fr:{bag:"Panier",add:"Ajouter au panier",added:"Ajouté",title:"Votre panier",empty:"Votre panier est vide.",subtotal:"Sous-total",checkout:"Paiement",remove:"Retirer",close:"Fermer",signin:"Connectez-vous à RUNLU Account pour continuer.",error:"Impossible de démarrer le paiement. Réessayez."},
    es:{bag:"Bolsa",add:"Añadir a la bolsa",added:"Añadido",title:"Tu bolsa",empty:"Tu bolsa está vacía.",subtotal:"Subtotal",checkout:"Pagar",remove:"Eliminar",close:"Cerrar",signin:"Inicia sesión en RUNLU Account para continuar.",error:"No se pudo iniciar el checkout. Inténtalo de nuevo."}
  };

  function lang(){ return document.documentElement.dataset.runluLanguage || "en"; }
  function t(k){ const l=labels[lang()]||labels.en; return l[k]||labels.en[k]; }
  function validCheckout(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return false;
      if (cfg.provider === "stripe") return parsed.hostname === "buy.stripe.com";
      if (cfg.provider === "lemonsqueezy") {
        const hostOk = parsed.hostname === "lemonsqueezy.com" || parsed.hostname.endsWith(".lemonsqueezy.com");
        return hostOk && parsed.pathname.includes("/checkout/buy/");
      }
      return false;
    } catch (_) { return false; }
  }
  let accountClient=null;
  function getAccountClient(){
    if(accountClient) return accountClient;
    if(!cfg.account || !window.supabase || typeof window.supabase.createClient!=="function") return null;
    accountClient=window.supabase.createClient(cfg.account.supabaseUrl,cfg.account.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    return accountClient;
  }
  async function buildCheckoutUrl(key,product){
    if(!product.requiresAccount && !product.requiresServerReference) return product.checkoutUrl;
    const client=getAccountClient();
    if(!client) throw new Error("account_client_unavailable");
    const {data,error}=await client.auth.getSession();
    if(error) throw error;
    const session=data?.session||null;
    if(!session){
      const signIn=new URL(cfg.account.signInUrl||"account.html",location.href);
      signIn.searchParams.set("return_to",location.href);
      alert(t("signin"));
      location.href=signIn.toString();
      return null;
    }
    const url=new URL(product.checkoutUrl);
    if(product.requiresServerReference){
      const res=await fetch(cfg.account.referenceEndpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token,"apikey":cfg.account.publishableKey},
        body:JSON.stringify({action:"prepare_payment_link_reference",plan_key:key})
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.ok||!data.client_reference_id) throw new Error(data.error||"reference_prepare_failed");
      url.searchParams.set("client_reference_id",data.client_reference_id);
    }
    return url.toString();
  }
  async function startCheckout(key,product,button){
    if(button)button.disabled=true;
    try{
      localStorage.setItem("runlu-pending-product",key);
      const checkoutUrl=await buildCheckoutUrl(key,product);
      if(checkoutUrl) location.href=checkoutUrl;
    }catch(e){
      console.error("RUNLU checkout start failed",e);
      alert(t("error"));
    }finally{
      if(button&&button.isConnected)button.disabled=false;
    }
  }

  function getBag(){
    try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(v)?v.filter(k=>cfg.products[k]):[]; }
    catch(_){ return []; }
  }
  function setBag(v){ localStorage.setItem(STORAGE_KEY,JSON.stringify([...new Set(v)])); renderBag(); }
  function add(key){ if(!cfg.products[key]) return; setBag([...getBag(),key]); openBag(); }
  function remove(key){ setBag(getBag().filter(k=>k!==key)); }

  function ensureUI(){
    if(document.getElementById("runluBagButton")) return;
    const style=document.createElement("style");
    style.textContent=`
      .runlu-bag-button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,rgba(23,25,21,.12));background:rgba(255,255,255,.72);border-radius:999px;padding:8px 12px;font:inherit;color:inherit;cursor:pointer;white-space:nowrap}
      .runlu-bag-count{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#122218;color:#fff;font-size:.72rem}
      .runlu-bag-backdrop{position:fixed;inset:0;z-index:198;background:rgba(18,34,24,.22);opacity:0;pointer-events:none;transition:opacity .25s ease}
      .runlu-bag-drawer{position:fixed;top:0;right:0;z-index:199;width:min(420px,94vw);height:100dvh;background:#fbfaf7;box-shadow:-20px 0 60px rgba(18,34,24,.16);transform:translateX(104%);transition:transform .3s cubic-bezier(.22,.61,.36,1);padding:28px;display:flex;flex-direction:column}
      .runlu-bag-open .runlu-bag-backdrop{opacity:1;pointer-events:auto}.runlu-bag-open .runlu-bag-drawer{transform:none}
      .runlu-bag-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid rgba(23,25,21,.12)}.runlu-bag-head h2{margin:0;font-size:1.45rem}
      .runlu-bag-close{border:0;background:transparent;font:inherit;cursor:pointer;padding:8px}
      .runlu-bag-items{display:grid;gap:12px;padding:22px 0;overflow:auto}.runlu-bag-item{padding:18px;border:1px solid rgba(23,25,21,.12);border-radius:18px;background:#fff}
      .runlu-bag-item strong{display:block;margin-bottom:5px}.runlu-bag-item-row{display:flex;justify-content:space-between;gap:16px;align-items:center}.runlu-bag-remove{border:0;background:transparent;padding:8px 0;color:#6a6f68;text-decoration:underline;cursor:pointer}
      .runlu-bag-empty{color:#6a6f68;padding:18px 0}.runlu-bag-foot{margin-top:auto;padding-top:20px;border-top:1px solid rgba(23,25,21,.12)}.runlu-bag-total{display:flex;justify-content:space-between;margin-bottom:16px}
      .runlu-bag-checkout{width:100%;display:flex;justify-content:center;padding:14px 18px;border:0;border-radius:14px;background:#2f6f45;color:#fff;font:inherit;font-weight:600;cursor:pointer}.runlu-bag-checkout:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:860px){.runlu-bag-button{padding:8px 10px}.runlu-bag-word{display:none}}
    `;
    document.head.appendChild(style);
    const header=document.querySelector(".site-header");
    if(header){
      const btn=document.createElement("button"); btn.id="runluBagButton"; btn.className="runlu-bag-button"; btn.type="button"; btn.onclick=openBag;
      const actions=header.querySelector(".header-actions");
      if(actions) actions.insertBefore(btn,actions.firstChild); else {
        const sel=header.querySelector("[data-runlu-language-select]"); header.insertBefore(btn,sel||null);
      }
    }
    const backdrop=document.createElement("div"); backdrop.className="runlu-bag-backdrop"; backdrop.onclick=closeBag;
    const drawer=document.createElement("aside"); drawer.id="runluBagDrawer"; drawer.className="runlu-bag-drawer"; drawer.setAttribute("aria-label","Shopping bag");
    drawer.innerHTML='<div class="runlu-bag-head"><h2 id="runluBagTitle"></h2><button class="runlu-bag-close" type="button" aria-label="Close">✕</button></div><div id="runluBagItems" class="runlu-bag-items"></div><div class="runlu-bag-foot"><div class="runlu-bag-total"><span id="runluBagSubtotalLabel"></span><strong id="runluBagSubtotal"></strong></div><button id="runluBagCheckout" class="runlu-bag-checkout" type="button"></button></div>';
    drawer.querySelector(".runlu-bag-close").onclick=closeBag;
    document.body.append(backdrop,drawer);
    document.addEventListener("keydown",e=>{if(e.key==="Escape") closeBag();});
  }
  function openBag(){ document.documentElement.classList.add("runlu-bag-open"); }
  function closeBag(){ document.documentElement.classList.remove("runlu-bag-open"); }
  function renderBag(){
    ensureUI();
    const bag=getBag(), btn=document.getElementById("runluBagButton"), items=document.getElementById("runluBagItems");
    if(btn) btn.innerHTML='<span class="runlu-bag-word">'+t("bag")+'</span><span class="runlu-bag-count">'+bag.length+'</span>';
    document.getElementById("runluBagTitle").textContent=t("title");
    document.getElementById("runluBagSubtotalLabel").textContent=t("subtotal");
    const products=bag.map(k=>({key:k,...cfg.products[k]}));
    items.innerHTML=products.length?products.map(p=>'<div class="runlu-bag-item"><strong>'+p.name+'</strong><div class="runlu-bag-item-row"><span>'+p.price+'</span><button class="runlu-bag-remove" type="button" data-remove="'+p.key+'">'+t("remove")+'</button></div></div>').join(""):'<div class="runlu-bag-empty">'+t("empty")+'</div>';
    items.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>remove(b.dataset.remove));
    const checkout=document.getElementById("runluBagCheckout"), subtotal=document.getElementById("runluBagSubtotal");
    subtotal.textContent=products.length===1?products[0].price:(products.length?products.map(p=>p.price).join(" + "):"CAD $0.00");
    checkout.textContent=t("checkout");
    const ready=products.length===1 && products[0].enabled && validCheckout(products[0].checkoutUrl);
    checkout.disabled=!ready;
    checkout.onclick=ready?()=>startCheckout(products[0].key,products[0],checkout):null;
  }
  function apply(){
    ensureUI();
    document.querySelectorAll("[data-commerce-buy]").forEach(el=>{
      const key=el.dataset.commerceBuy, product=cfg.products[key], live=!!(product&&product.enabled&&validCheckout(product.checkoutUrl));
      if(!live){ el.setAttribute("aria-disabled","true"); if(el.tagName==="A") el.setAttribute("href","#"); el.onclick=e=>e.preventDefault(); return; }
      el.setAttribute("href","#"); el.removeAttribute("aria-disabled"); el.classList.remove("disabled-buy"); if(!el.classList.contains("button")) el.classList.add("button","primary");
      el.dataset.en=t("add")+" · "+product.price; el.dataset.zh=labels.zh.add+" · "+product.price; el.dataset.fr=labels.fr.add+" · "+product.price; el.dataset.es=labels.es.add+" · "+product.price;
      el.textContent=el.dataset[lang()]||el.dataset.en;
      el.onclick=e=>{e.preventDefault();add(key);};
    });
    renderBag();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply,{once:true}); else apply();
  window.addEventListener("runlu:languagechange",apply);
})();
