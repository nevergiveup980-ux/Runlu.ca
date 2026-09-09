/* RUNLU Deerfoot Flooring OS · V0.3.84 PO VOID Preview
   Adds auditable VOID handling for already-issued PO records without deleting or renumbering them.
   Compatibility rule: core PO status is saved as Cancelled so existing Pickup/active-PO logic safely exits the record;
   VOID identity and audit metadata are stored separately and the UI/print output displays VOID.
   No Warehouse physical inventory reversal and no automatic Inventory Hold release.
*/
(function(){
'use strict';
if(window.__RUNLU_PO_VOID_V084__)return;
window.__RUNLU_PO_VOID_V084__=true;

var PO_STORE='runlu_deerfoot_supplier_orders_v1';
var VOID_STORE='runlu_flooring_po_void_v084';
var PREVIEW_KEY='runlu_flooring_po_deerfoot_invoice_v040';
var observer=null,timer=0,locked=false;
var by=function(id){return document.getElementById(id)};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};

function readPOs(){try{var x=JSON.parse(localStorage.getItem(PO_STORE)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}}
function readVoids(){try{var x=JSON.parse(localStorage.getItem(VOID_STORE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return{}}}
function saveVoids(x){try{localStorage.setItem(VOID_STORE,JSON.stringify(x));return true}catch(_){return false}}
function activeJob(){try{return typeof window.active==='function'?window.active()||{}:{}}catch(_){return{}}}
function currentPO(){var n=String(by('poNumberSafe')&&by('poNumberSafe').value||'').trim();if(!n)return null;return readPOs().find(function(x){return String(x.poNumber||'').trim()===n})||null}
function voidMeta(r){if(!r)return null;var v=readVoids();return v[r.id]||v['po:'+String(r.poNumber||'').trim()]||null}
function isVoided(r){var m=voidMeta(r);return !!(m&&m.state==='VOID')}
function prettyStamp(s){if(!s)return '';try{return new Date(s).toLocaleString('en-CA',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(_){return String(s)}}
function moneySubtotal(items){return Math.round((items||[]).reduce(function(sum,x){var direct=Number(String(x.lineTotal==null?'':x.lineTotal).replace(/[$,]/g,''));var q=Number(String(x.qty==null?'':x.qty).replace(/[$,]/g,''));var c=Number(String(x.unitCost==null?'':x.unitCost).replace(/[$,]/g,''));return sum+(Number.isFinite(direct)&&direct?direct:((Number.isFinite(q)?q:0)*(Number.isFinite(c)?c:0)))},0)*100)/100}

function style(){if(by('runluPOVoidV084Css'))return;var s=document.createElement('style');s.id='runluPOVoidV084Css';s.textContent='\
#poVoidBtnV084{border-color:#9d3b3b!important;background:#fff3f3!important;color:#8f2929!important;font-weight:900!important}#poVoidBtnV084:disabled{opacity:.7}\
#poVoidNoticeV084{display:none;margin:10px 0 0;padding:11px 12px;border:2px solid #b44949;border-radius:10px;background:#fff5f5;color:#6f2222;font-size:11px;line-height:1.45}#poVoidNoticeV084.on{display:block}#poVoidNoticeV084 b{font-size:15px;letter-spacing:.06em}\
.v084VoidLedger{border-left:5px solid #ad4141!important;background:#fff9f9!important}.v084VoidBadge{display:inline-block;margin-left:6px;padding:3px 7px;border-radius:999px;background:#a73535;color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}\
.v084VoidEditor{position:relative}.v084VoidEditor:after{content:"VOID";position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) rotate(-30deg);font:900 clamp(64px,13vw,150px)/1 Arial,sans-serif;letter-spacing:.08em;color:rgba(160,45,45,.075);pointer-events:none;z-index:0;white-space:nowrap}.v084VoidEditor>*{position:relative;z-index:1}\
';document.head.appendChild(s)}

function editorCard(){return by('poSafeEditorTitle')&&by('poSafeEditorTitle').closest('.card')}
function ensureControls(){
  style();var print=by('poPrintBtn');if(!print)return;
  var actions=print.parentElement;if(actions&&!by('poVoidBtnV084')){var b=document.createElement('button');b.type='button';b.id='poVoidBtnV084';b.className='action';b.textContent='VOID PO';print.insertAdjacentElement('afterend',b);b.addEventListener('click',voidCurrent)}
  var card=editorCard();if(card&&!by('poVoidNoticeV084')){var n=document.createElement('div');n.id='poVoidNoticeV084';var title=by('poSafeEditorTitle');if(title&&title.parentElement)title.parentElement.insertAdjacentElement('afterend',n);else card.insertBefore(n,card.firstChild)}
  var st=by('poStatusSafe');if(st&&!Array.from(st.options).some(function(o){return o.value==='VOID'})){var o=document.createElement('option');o.value='VOID';o.textContent='VOID';st.appendChild(o)}
}

function restoreLock(){
  var card=editorCard();if(!card)return;card.querySelectorAll('[data-v084-prev-disabled]').forEach(function(el){el.disabled=el.dataset.v084PrevDisabled==='1';delete el.dataset.v084PrevDisabled});
  card.querySelectorAll('[data-v084-prev-readonly]').forEach(function(el){el.readOnly=el.dataset.v084PrevReadonly==='1';delete el.dataset.v084PrevReadonly});
  card.classList.remove('v084VoidEditor');locked=false;
}
function lockEditor(r,m){
  var card=editorCard();if(!card)return;card.classList.add('v084VoidEditor');
  card.querySelectorAll('input,select,textarea,button').forEach(function(el){
    var id=el.id||'';var allow=id==='poPreviewBtn'||id==='poPrintBtn'||id==='poVoidBtnV084'||el.hasAttribute('data-v080-hold-release');
    if(allow)return;
    if(!el.hasAttribute('data-v084-prev-disabled'))el.dataset.v084PrevDisabled=el.disabled?'1':'0';el.disabled=true;
  });
  var st=by('poStatusSafe');if(st){if(!st.hasAttribute('data-v084-prev-disabled'))st.dataset.v084PrevDisabled=st.disabled?'1':'0';st.disabled=true;st.value='VOID'}
  var title=by('poSafeEditorTitle');if(title)title.textContent='PO #'+String(r.poNumber||'')+' · VOID';
  var n=by('poVoidNoticeV084');if(n){n.classList.add('on');n.innerHTML='<b>VOID</b> · This issued PO is retained as an audit record.<br>Reason: '+esc(m.reason||'Not stated')+' · Voided '+esc(prettyStamp(m.voidedAt))+' · Previous status: '+esc(m.previousStatus||'Issued')+'<br><span style="color:#7b5a5a">Original PO number and content are preserved. Received inventory is not reversed. Existing Inventory Holds must be released explicitly if no longer needed.</span>'}
  var vb=by('poVoidBtnV084');if(vb){vb.disabled=true;vb.textContent='VOIDED'}
  if(by('poPreviewBtn'))by('poPreviewBtn').textContent='Preview VOID Copy';if(by('poPrintBtn'))by('poPrintBtn').textContent='Print VOID Copy';locked=true;
}
function normalEditor(r){
  if(locked)restoreLock();var n=by('poVoidNoticeV084');if(n){n.classList.remove('on');n.innerHTML=''}
  var vb=by('poVoidBtnV084');if(vb){vb.disabled=false;vb.textContent='VOID PO';vb.style.display=r&&r.poNumber&&r.status!=='Draft'?'inline-flex':'none'}
  if(by('poPreviewBtn'))by('poPreviewBtn').textContent='Preview Deerfoot Invoice';if(by('poPrintBtn'))by('poPrintBtn').textContent='Print Deerfoot Invoice';
  var st=by('poStatusSafe');if(st&&st.value==='VOID')st.value=r&&r.status?r.status:'Draft';
}

function decorateLedger(){
  var pos=readPOs(),vs=readVoids();document.querySelectorAll('[data-po-open]').forEach(function(btn){var r=pos.find(function(x){return x.id===btn.dataset.poOpen});if(!r)return;var m=vs[r.id]||vs['po:'+String(r.poNumber||'').trim()];var row=btn.closest('.poSafeRow');if(!row)return;row.classList.toggle('v084VoidLedger',!!(m&&m.state==='VOID'));var status=row.children&&row.children[2]?row.children[2].querySelector('b'):null;if(m&&m.state==='VOID'){if(status)status.textContent='VOID';var first=row.children&&row.children[0]?row.children[0].querySelector('b'):null;if(first&&!first.querySelector('.v084VoidBadge')){var tag=document.createElement('span');tag.className='v084VoidBadge';tag.textContent='VOID';first.appendChild(tag)}}});
}
function apply(){ensureControls();decorateLedger();var r=currentPO();if(r&&isVoided(r))lockEditor(r,voidMeta(r));else normalEditor(r)}
function schedule(ms){clearTimeout(timer);timer=setTimeout(apply,ms||40)}

function voidCurrent(){
  var r=currentPO();if(!r||!r.poNumber){alert('Open an issued PO before using VOID. Drafts without a PO number should not be voided.');return}
  if(isVoided(r)){apply();return}
  if(r.status==='Draft'){alert('This PO is still a Draft. VOID is intended for a PO that has already been issued / recorded.');return}
  var reason=window.prompt('VOID reason for PO #'+r.poNumber+'\nExamples: cancelled after issue, duplicate PO, vendor change, customer change, replaced PO.','Cancelled after issue');if(reason==null)return;reason=String(reason).trim();if(!reason){alert('Enter a short VOID reason so the audit record is clear.');return}
  var received=['Partially Received','Received','Completed'].indexOf(r.status)>=0;
  var msg='VOID PO #'+r.poNumber+'?\n\nSupplier: '+(r.supplier||'—')+'\nReason: '+reason+'\n\nThe PO number and all existing content will be retained. The PO will leave the active workflow and all VOID copies will carry a large VOID watermark.';
  if(received)msg+='\n\nIMPORTANT: this PO has status '+r.status+'. VOID will NOT reverse material already received into inventory.';
  msg+='\n\nExisting Inventory Holds are not released automatically.';
  if(!window.confirm(msg))return;
  var st=by('poStatusSafe'),saveBtn=by('poSaveDraftBtn');if(!st||!saveBtn){alert('PO editor is not ready. No changes were made.');return}
  var previousStatus=r.status;st.value='Cancelled';var originalAlert=window.alert,savedMessage='';window.alert=function(x){savedMessage=String(x||'');if(savedMessage!=='PO draft saved.')originalAlert(x)};
  try{saveBtn.click()}finally{window.alert=originalAlert}
  var saved=readPOs().find(function(x){return String(x.poNumber||'').trim()===String(r.poNumber)});if(!saved||saved.status!=='Cancelled'){st.value=previousStatus;alert('VOID could not be completed. The original PO was left unchanged.');return}
  var vs=readVoids(),meta={state:'VOID',recordId:saved.id,poNumber:String(saved.poNumber||''),reason:reason,voidedAt:new Date().toISOString(),previousStatus:previousStatus,supplier:saved.supplier||'',jobNumber:saved.jobNumber||'',hadReceivedStatus:received};vs[saved.id]=meta;vs['po:'+String(saved.poNumber||'')]=meta;if(!saveVoids(vs)){alert('The PO was cancelled in the base workflow, but the VOID audit marker could not be saved in this browser. Please do not use this preview for production.');return}
  try{if(typeof window.runluPORender==='function')window.runluPORender();if(typeof window.runluPickupSafeRender==='function')window.runluPickupSafeRender()}catch(_){}
  schedule(80);alert('PO #'+saved.poNumber+' is now VOID. Original content and PO number are preserved.'+(received?' Received inventory was not reversed.':''));
}

function payload(r,m){
  var j=activeJob();var items=Array.isArray(r.items)?r.items:[];return {build:'V0.3.84',purpose:'PO / Supplier Pickup',poNumber:r.poNumber||'',poStatus:'VOID',voided:true,voidReason:m.reason||'',voidedAt:m.voidedAt||'',previousStatus:m.previousStatus||'',invoiceNumber:j.invoiceNumber||j.jobNumber||r.jobNumber||'',invoiceDate:r.orderDate||new Date().toISOString().slice(0,10),customerName:j.customerName||r.customerName||'',soldToAddress:j.soldToAddress||'',shipToName:j.shipToName||'',shipToAddress:j.shipToAddress||'',email:j.email||'',cell:j.cell||'',phoneHome:j.phoneHome||'',phoneWork:j.phoneWork||'',pickup:r.requestedDate||j.pickup||'',delivery:j.delivery||'',dateRequired:j.dateRequired||r.expectedDate||'',clerk:r.salesRep||j.clerk||'',notes:r.notes||'',items:items.map(function(x){return {qty:x.qty||'',size:x.size||'',style:x.style||'',colour:x.colour||'',sourceType:x.sourceType||'Supplier',sourceRef:x.sourceRef||x.supplierStock||x.supplier||'',supplier:x.supplier||r.supplier||'',unit:x.unit||'',unitCost:x.unitCost||'',lineTotal:x.lineTotal||''}}),subtotal:r.subtotal||moneySubtotal(items),showCosts:false,isDemo:!!j.isDemo};
}
function injectWatermark(w,m,r){
  try{var d=w.document,invoice=d.getElementById('invoice');if(!invoice)return false;if(d.getElementById('runluVoidWatermark84'))return true;invoice.style.position='relative';var s=d.createElement('style');s.id='runluVoidPrintCss84';s.textContent='#runluVoidWatermark84{position:absolute;left:14mm;top:96mm;width:186mm;text-align:center;z-index:9999;pointer-events:none;transform:rotate(-32deg);transform-origin:center;font:900 42mm/1 Arial,sans-serif;letter-spacing:3mm;color:rgba(160,35,35,.18);-webkit-print-color-adjust:exact;print-color-adjust:exact}#runluVoidStamp84{position:absolute;right:8mm;top:8mm;z-index:10000;border:2px solid #a33a3a;border-radius:3mm;padding:2.2mm 3mm;background:rgba(255,255,255,.88);color:#8d2929;font:900 4mm/1.2 Arial,sans-serif;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}#runluVoidScreen84{margin:8px auto;max-width:900px;padding:9px 12px;border:2px solid #aa4545;border-radius:8px;background:#fff2f2;color:#792626;font:700 13px/1.4 Arial,sans-serif}@media print{#runluVoidWatermark84,#runluVoidStamp84{display:block!important}#runluVoidScreen84{display:none!important}}';d.head.appendChild(s);var wm=d.createElement('div');wm.id='runluVoidWatermark84';wm.textContent='VOID';invoice.appendChild(wm);var stamp=d.createElement('div');stamp.id='runluVoidStamp84';stamp.innerHTML='VOID<br><span style="font-size:2.7mm">PO #'+esc(r.poNumber||'')+'</span>';invoice.appendChild(stamp);var screen=d.createElement('div');screen.id='runluVoidScreen84';screen.innerHTML='VOID PO #'+esc(r.poNumber||'')+' · '+esc(m.reason||'')+' · '+esc(prettyStamp(m.voidedAt));var controls=d.querySelector('.controls');if(controls)controls.insertAdjacentElement('beforebegin',screen);var p=d.querySelector('.appbar .primary');if(p)p.textContent='Print VOID Copy / Save PDF';d.title='VOID PO #'+String(r.poNumber||'')+' · Deerfoot Invoice';var tag=d.querySelector('.copyTag');if(tag)tag.textContent='VOID · PO WORKFLOW';return true}catch(e){console.error('RUNLU V084 VOID watermark injection failed',e);return false}
}
function openVoidCopy(r,m){try{localStorage.setItem(PREVIEW_KEY,JSON.stringify(payload(r,m)))}catch(e){alert('Could not prepare VOID copy. No PO record was changed.');return}var w=window.open('deerfoot-po-invoice-v040.html?void84=1&t='+Date.now(),'_blank');if(!w){alert('Allow pop-ups to preview / print the VOID copy.');return}var tries=0,iv=setInterval(function(){tries++;if(w.closed||injectWatermark(w,m,r)||tries>120)clearInterval(iv)},60)}

function capture(ev){
  var open=ev.target&&ev.target.closest&&ev.target.closest('[data-po-open],#poNewBtn');if(open){restoreLock();setTimeout(function(){schedule(50)},0);return}
  var b=ev.target&&ev.target.closest&&ev.target.closest('#poPreviewBtn,#poPrintBtn');if(!b)return;var r=currentPO();if(!r||!isVoided(r))return;ev.preventDefault();ev.stopImmediatePropagation();openVoidCopy(r,voidMeta(r));
}
function install(){ensureControls();document.addEventListener('click',capture,true);var p=by('purchasing');if(p){observer=new MutationObserver(function(){schedule(60)});observer.observe(p,{childList:true,subtree:true})}window.addEventListener('storage',function(e){if(e.key===PO_STORE||e.key===VOID_STORE)schedule(80)});setInterval(function(){decorateLedger();var r=currentPO();if(r&&isVoided(r)&&!locked)schedule(10)},1200);apply();window.RUNLUPOVoidV084={version:'0.3.84',isVoided:function(poNumber){var r=readPOs().find(function(x){return String(x.poNumber||'')===String(poNumber||'')});return isVoided(r)},getAudit:function(){return JSON.parse(JSON.stringify(readVoids()))}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
