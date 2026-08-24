/* RUNLU Deerfoot Flooring OS · PO Item Lines V0.1.0
   Adds editable PO product lines without changing the existing PO core.
   Stock Inventory lines feed Warehouse receiving; Job-specific lines remain job-staged.
*/
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const PANEL_ID='poItemLinesPanel';
  const by=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let draftItems=[];
  let lastPO='';

  function readPOs(){try{const x=JSON.parse(localStorage.getItem(PO_STORE)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
  function writePOs(x){localStorage.setItem(PO_STORE,JSON.stringify(x))}
  function poNumber(){
    const direct=(by('poNumberSafe')?.value||'').trim();
    if(direct)return direct;
    const title=(by('poSafeEditorTitle')?.textContent||'').trim();
    const m=title.match(/^PO\s*#\s*([^\s·]+)/i);
    return m?m[1].trim():'';
  }
  function currentPO(){const n=poNumber();return n?readPOs().find(x=>String(x.poNumber||'').trim()===n):null}
  function typeLabel(){return by('pickupPurchaseTypeSafe')?.value==='Stock'?'Stock Inventory':'Job-specific'}
  function unitOptions(selected){return ['carton','box','roll','sy','sf','ea','pail','bucket','tube','gal'].map(x=>`<option value="${x}"${String(selected||'').toLowerCase()===x?' selected':''}>${x.toUpperCase()}</option>`).join('')}

  function injectStyle(){
    if(by('runluPOItemLineStyle'))return;
    const s=document.createElement('style');s.id='runluPOItemLineStyle';s.textContent=`
      #${PANEL_ID}{margin-top:12px;padding:14px;border:1px solid rgba(23,61,48,.16);border-radius:14px;background:#fbfcfb}
      #${PANEL_ID} .poItemHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      #${PANEL_ID} .poItemHead h3{margin:0}
      #${PANEL_ID} .poItemLine{display:grid;grid-template-columns:1.5fr 1fr 1fr .7fr .8fr auto;gap:8px;align-items:end;padding:10px 0;border-top:1px solid rgba(23,61,48,.10)}
      #${PANEL_ID} .poItemLine:first-of-type{border-top:0}
      #${PANEL_ID} label{font-size:12px;display:block;margin-bottom:4px}
      #${PANEL_ID} input,#${PANEL_ID} select{width:100%}
      #${PANEL_ID} .poItemMsg{font-size:12px;color:#607067;margin-top:8px}
      @media(max-width:800px){#${PANEL_ID} .poItemLine{grid-template-columns:1fr 1fr}#${PANEL_ID} .poItemLine .wide{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  function ensurePanel(){
    if(by(PANEL_ID))return;
    const meta=by('pickupMetaSafe');if(!meta)return;
    const panel=document.createElement('div');panel.id=PANEL_ID;panel.className='full';
    panel.innerHTML=`<div class="poItemHead"><div><h3>PO Item Lines</h3><div class="muted" id="poItemModeHelp"></div></div><button class="action" type="button" id="poAddItemLine">+ Item</button></div><div id="poItemLines"></div><div class="actions"><button class="action primary" type="button" id="poSaveItemLines">Save Item Lines</button></div><div class="poItemMsg" id="poItemMsg">Add the actual product ordered from the supplier.</div>`;
    meta.insertAdjacentElement('afterend',panel);
    by('poAddItemLine')?.addEventListener('click',()=>{draftItems=gather();draftItems.push({style:'',colour:'',sku:'',qty:'',unit:'carton',size:''});renderItems(draftItems)});
    by('poSaveItemLines')?.addEventListener('click',()=>saveItems(true));
    updateHelp();loadForVisiblePO();
  }

  function updateHelp(){
    const h=by('poItemModeHelp');if(!h)return;
    h.textContent=typeLabel()==='Stock Inventory'?'Stock Inventory · these lines will be received into Warehouse inventory.':'Job-specific · these lines will be staged for the linked job/customer and will not increase general inventory.';
  }

  function renderItems(items){
    const box=by('poItemLines');if(!box)return;
    const list=Array.isArray(items)?items:[];
    box.innerHTML=list.length?list.map((x,i)=>`<div class="poItemLine" data-po-item-row="${i}">
      <div class="wide"><label>Product / Style</label><input data-f="style" value="${esc(x.style||x.product||'')}" placeholder="Product name / style"></div>
      <div><label>Colour</label><input data-f="colour" value="${esc(x.colour||x.color||'')}" placeholder="Colour"></div>
      <div><label>SKU / Product ID</label><input data-f="sku" value="${esc(x.sku||'')}" placeholder="SKU / ID"></div>
      <div><label>Quantity</label><input data-f="qty" inputmode="decimal" value="${esc(x.qty||'')}" placeholder="Qty"></div>
      <div><label>Unit</label><select data-f="unit">${unitOptions(x.unit||'carton')}</select></div>
      <div><button class="action" type="button" data-remove-item="${i}">Remove</button></div>
    </div>`).join(''):'<div class="muted">No PO item lines yet. Click + Item.</div>';
    box.querySelectorAll('[data-remove-item]').forEach(b=>b.addEventListener('click',()=>{draftItems=gather();draftItems.splice(Number(b.dataset.removeItem),1);renderItems(draftItems)}));
  }

  function gather(){
    return [...document.querySelectorAll('#'+PANEL_ID+' [data-po-item-row]')].map(row=>{
      const get=f=>row.querySelector('[data-f="'+f+'"]')?.value?.trim()||'';
      return {style:get('style'),colour:get('colour'),sku:get('sku'),qty:get('qty'),unit:get('unit')||'carton',size:'',supplier:(by('poSupplierSafe')?.value||'').trim()};
    });
  }

  function loadForVisiblePO(){
    ensurePanel();
    const n=poNumber();
    if(n===lastPO&&by('poItemLines')?.children.length)return;
    lastPO=n;
    const po=currentPO();
    draftItems=po&&Array.isArray(po.items)?JSON.parse(JSON.stringify(po.items)):[];
    renderItems(draftItems);updateHelp();
    const msg=by('poItemMsg');if(msg)msg.textContent=po?`Editing item lines for PO #${n}.`:'Add item lines now; they will attach when this PO is recorded/issued.';
  }

  function saveItems(showAlert){
    ensurePanel();
    const items=gather();
    if(items.some(x=>!x.style)){if(showAlert)alert('Enter Product / Style for every PO item.');return false}
    if(items.some(x=>!x.qty||Number(x.qty)<=0)){if(showAlert)alert('Enter a Quantity greater than 0 for every PO item.');return false}
    draftItems=items;
    const n=poNumber();const pos=readPOs();const po=n?pos.find(x=>String(x.poNumber||'').trim()===n):null;
    if(!po){const msg=by('poItemMsg');if(msg)msg.textContent='Item lines are ready and will attach when the PO is recorded/issued.';return false}
    po.items=JSON.parse(JSON.stringify(items));writePOs(pos);
    try{window.runluPickupSafeRender?.()}catch(_){ }
    const msg=by('poItemMsg');if(msg)msg.textContent=`Saved ${items.length} item line${items.length===1?'':'s'} to PO #${n}.`;
    if(showAlert)alert('PO item lines saved.');
    return true;
  }

  function attachAfterPOAction(){
    draftItems=gather();
    setTimeout(()=>{
      const n=poNumber();if(!n)return;
      const pos=readPOs();const po=pos.find(x=>String(x.poNumber||'').trim()===n);if(!po)return;
      if(draftItems.length){po.items=JSON.parse(JSON.stringify(draftItems));writePOs(pos);try{window.runluPickupSafeRender?.()}catch(_){}}
      lastPO='';loadForVisiblePO();
    },120);
  }

  function versionBadge(){
    document.title='RUNLU Deerfoot Flooring OS V0.3.27 PO Item Lines';
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.27 PO Item Lines';
  }

  function boot(){
    injectStyle();ensurePanel();versionBadge();
    const obs=new MutationObserver(()=>{ensurePanel();versionBadge()});obs.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('change',ev=>{if(ev.target?.id==='pickupPurchaseTypeSafe')updateHelp()},true);
    document.addEventListener('click',ev=>{
      if(ev.target?.closest?.('[data-po-open]'))setTimeout(()=>{lastPO='';loadForVisiblePO()},30);
      if(ev.target?.id==='poNewBtn')setTimeout(()=>{lastPO='';draftItems=[];renderItems([]);updateHelp()},30);
      if(['poManualBtn','poIssueBtn','poSaveDraftBtn'].includes(ev.target?.id))attachAfterPOAction();
    },true);
    setInterval(()=>{const n=poNumber();if(n!==lastPO)loadForVisiblePO()},700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
