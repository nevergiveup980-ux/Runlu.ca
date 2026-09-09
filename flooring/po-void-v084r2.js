/* RUNLU Deerfoot Flooring OS · V0.3.84r2 PO VOID Preview
   Real-world rule: a formal PO number is the VOID eligibility gate.
   Manual / existing-paper POs may still show Draft in the digital workflow even after the paper PO was issued.
   VOID never deletes or renumbers the PO, never reverses Warehouse physical inventory, and never auto-releases Inventory Holds.
*/
(function(){
'use strict';
if(window.__RUNLU_PO_VOID_V084R2__)return;
window.__RUNLU_PO_VOID_V084R2__=true;

var PO_STORE='runlu_deerfoot_supplier_orders_v1';
var VOID_STORE='runlu_flooring_po_void_v084';
var PREVIEW_KEY='runlu_flooring_po_deerfoot_invoice_v040';
var timer=0,observer=null,lockedId='';
var by=function(id){return document.getElementById(id)};
var str=function(v){return String(v==null?'':v).trim()};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var clone=function(x){try{return JSON.parse(JSON.stringify(x))}catch(_){return x}};

function readJSON(key,fallback){try{var x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x}catch(_){return fallback}}
function writeJSON(key,value){localStorage.setItem(key,JSON.stringify(value));return true}
function readPOs(){var x=readJSON(PO_STORE,[]);return Array.isArray(x)?x:[]}
function readVoids(){var x=readJSON(VOID_STORE,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}
function activeJob(){try{return typeof active==='function'?active()||{}:{}}catch(_){return{}}}
function currentNumber(){return str(by('poNumberSafe')&&by('poNumberSafe').value)}
function currentPO(){var n=currentNumber();if(!n)return null;return readPOs().find(function(x){return str(x.poNumber)===n})||null}
function metaFor(r){if(!r)return null;var v=readVoids();return v[r.id]||v['po:'+str(r.poNumber)]||(r.voidState==='VOID'?{state:'VOID',recordId:r.id,poNumber:str(r.poNumber),reason:r.voidReason||'',voidedAt:r.voidedAt||'',previousStatus:r.voidPreviousStatus||''}:null)}
function isVoid(r){var m=metaFor(r);return !!(m&&m.state==='VOID')}
function stamp(s){if(!s)return '';try{return new Date(s).toLocaleString('en-CA',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(_){return str(s)}}
function numberEligible(r){return !!(r&&str(r.poNumber))}
function editorCard(){return by('poSafeEditorTitle')&&by('poSafeEditorTitle').closest('.card')}

function installStyle(){
 if(by('runluPOVoidV084R2Css'))return;
 var s=document.createElement('style');s.id='runluPOVoidV084R2Css';s.textContent='\
#poVoidBtnV084R2{border:1px solid #a43d3d!important;background:#fff1f1!important;color:#8f2929!important;font-weight:900!important}#poVoidBtnV084R2:disabled{opacity:.72}\
#poVoidNoticeV084R2{display:none;margin:10px 0 0;padding:11px 12px;border:2px solid #b44949;border-radius:10px;background:#fff5f5;color:#6f2222;font-size:11px;line-height:1.45}#poVoidNoticeV084R2.on{display:block}#poVoidNoticeV084R2 b{font-size:16px;letter-spacing:.07em}\
.v084r2VoidRow{border-left:5px solid #ad4141!important;background:#fff9f9!important}.v084r2VoidBadge{display:inline-block;margin-left:6px;padding:3px 7px;border-radius:999px;background:#a73535;color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}\
.v084r2VoidEditor{position:relative}.v084r2VoidEditor:after{content:"VOID";position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) rotate(-30deg);font:900 clamp(64px,13vw,150px)/1 Arial,sans-serif;letter-spacing:.08em;color:rgba(160,45,45,.075);pointer-events:none;z-index:0;white-space:nowrap}.v084r2VoidEditor>*{position:relative;z-index:1}\
';document.head.appendChild(s)
}

function ensureControls(){
 installStyle();
 var print=by('poPrintBtn');if(!print)return;
 if(!by('poVoidBtnV084R2')){
   var old=by('poVoidBtnV084');if(old)old.style.display='none';
   var b=document.createElement('button');b.type='button';b.id='poVoidBtnV084R2';b.className='action';b.textContent='VOID PO';
   print.insertAdjacentElement('afterend',b);b.addEventListener('click',voidCurrent);
 }
 var card=editorCard();if(card&&!by('poVoidNoticeV084R2')){
   var n=document.createElement('div');n.id='poVoidNoticeV084R2';var title=by('poSafeEditorTitle');
   if(title&&title.parentElement)title.parentElement.insertAdjacentElement('afterend',n);else card.insertBefore(n,card.firstChild)
 }
}

function restoreEditor(){
 var card=editorCard();if(!card)return;
 card.querySelectorAll('[data-v084r2-prev-disabled]').forEach(function(el){el.disabled=el.dataset.v084r2PrevDisabled==='1';delete el.dataset.v084r2PrevDisabled});
 card.classList.remove('v084r2VoidEditor');lockedId='';
}
function setButtonNormal(r){
 var b=by('poVoidBtnV084R2');if(!b)return;b.disabled=false;b.textContent='VOID PO';b.style.display=numberEligible(r)?'inline-flex':'none';
 var old=by('poVoidBtnV084');if(old)old.style.display='none';
}
function normalEditor(r){
 if(lockedId)restoreEditor();
 var n=by('poVoidNoticeV084R2');if(n){n.classList.remove('on');n.innerHTML=''}
 setButtonNormal(r)
}
function lockEditor(r,m){
 var card=editorCard();if(!card)return;
 if(lockedId&&lockedId!==r.id)restoreEditor();
 card.classList.add('v084r2VoidEditor');
 card.querySelectorAll('input,select,textarea,button').forEach(function(el){
   var id=el.id||'',txt=str(el.textContent).toLowerCase();
   var allow=id==='poPreviewBtn'||id==='poPrintBtn'||id==='poVoidBtnV084R2'||el.hasAttribute('data-v080-hold-release')||txt.indexOf('preview')>=0||txt.indexOf('print')>=0;
   if(allow)return;if(!el.hasAttribute('data-v084r2-prev-disabled'))el.dataset.v084r2PrevDisabled=el.disabled?'1':'0';el.disabled=true;
 });
 var st=by('poStatusSafe');if(st){if(!Array.from(st.options).some(function(o){return o.value==='VOID'})){var o=document.createElement('option');o.value='VOID';o.textContent='VOID';st.appendChild(o)}st.value='VOID';st.disabled=true}
 var title=by('poSafeEditorTitle');if(title)title.textContent='PO #'+str(r.poNumber)+' · VOID';
 var n=by('poVoidNoticeV084R2');if(n){n.classList.add('on');n.innerHTML='<b>VOID</b> · Formal PO retained as an audit record.<br>Reason: '+esc(m.reason||'Not stated')+' · Voided '+esc(stamp(m.voidedAt))+' · Previous system status: '+esc(m.previousStatus||'—')+'<br><span style="color:#7b5a5a">PO number and all original content are preserved. Received inventory is not reversed. Existing Inventory Holds remain until explicitly released.</span>'}
 var b=by('poVoidBtnV084R2');if(b){b.style.display='inline-flex';b.disabled=true;b.textContent='VOIDED'}
 var old=by('poVoidBtnV084');if(old)old.style.display='none';
 if(by('poPreviewBtn'))by('poPreviewBtn').textContent='Preview VOID Copy';if(by('poPrintBtn'))by('poPrintBtn').textContent='Print VOID Copy';
 lockedId=r.id
}

function decorateLedger(){
 var pos=readPOs(),vs=readVoids();
 document.querySelectorAll('[data-po-open]').forEach(function(btn){
   var r=pos.find(function(x){return x.id===btn.dataset.poOpen});if(!r)return;
   var m=vs[r.id]||vs['po:'+str(r.poNumber)]||(r.voidState==='VOID'?{state:'VOID'}:null),row=btn.closest('.poSafeRow');if(!row)return;
   var yes=!!(m&&m.state==='VOID');row.classList.toggle('v084r2VoidRow',yes);
   if(yes){var status=row.children&&row.children[2]?row.children[2].querySelector('b'):null;if(status)status.textContent='VOID';var first=row.children&&row.children[0]?row.children[0].querySelector('b'):null;if(first&&!first.querySelector('.v084r2VoidBadge')){var tag=document.createElement('span');tag.className='v084r2VoidBadge';tag.textContent='VOID';first.appendChild(tag)}}
 })
}
function apply(){ensureControls();decorateLedger();var r=currentPO();if(r&&isVoid(r))lockEditor(r,metaFor(r));else normalEditor(r)}
function schedule(ms){clearTimeout(timer);timer=setTimeout(apply,ms||80)}

function syncLinkedPO(jobId){
 try{
   if(!jobId||typeof jobs==='undefined'||typeof saveStore!=='function')return;
   var j=jobs.find(function(x){return x.id===jobId});if(!j)return;
   var nums=readPOs().filter(function(x){return x.jobId===jobId&&x.poNumber&&x.status!=='Cancelled'}).map(function(x){return x.poNumber}).sort(function(a,b){return String(a).localeCompare(String(b),undefined,{numeric:true})});
   j.supplierPO=nums.join(', ');saveStore();if(typeof renderAll==='function')renderAll()
 }catch(e){console.warn('[RUNLU V084r2] linked PO sync skipped',e)}
}
function voidCurrent(){
 var r=currentPO();if(!r||!numberEligible(r)){alert('Open a PO with a formal PO number before using VOID. An unnumbered draft is not a VOID record.');return}
 if(isVoid(r)){apply();return}
 var reason=window.prompt('VOID reason for PO #'+r.poNumber+'\nExamples: cancelled after issue, duplicate PO, vendor change, customer change, replaced PO.','Cancelled after issue');if(reason==null)return;reason=str(reason);if(!reason){alert('Enter a short VOID reason so the audit record is clear.');return}
 var received=['Partially Received','Received','Completed'].indexOf(r.status)>=0;
 var manualDraft=(r.mode==='manual'&&r.status==='Draft');
 var msg='VOID PO #'+r.poNumber+'?\n\nSupplier: '+(r.supplier||'—')+'\nSystem status: '+(r.status||'—')+'\nReason: '+reason+'\n\nThe PO number and all existing content will be retained. The PO will leave the active purchasing / pickup workflow and VOID copies will carry a large VOID watermark.';
 if(manualDraft)msg+='\n\nThis is a Manual / Existing Paper PO. A Draft system status does not prevent VOID because the formal PO number already exists.';
 if(received)msg+='\n\nIMPORTANT: material already received will NOT be reversed from Warehouse inventory.';
 msg+='\n\nExisting Inventory Holds are NOT released automatically.';
 if(!window.confirm(msg))return;
 var pos=readPOs(),idx=pos.findIndex(function(x){return x.id===r.id});if(idx<0){alert('PO record could not be found. No changes were made.');return}
 var oldPOs=clone(pos),oldVoids=clone(readVoids()),at=new Date().toISOString(),snapshot=clone(pos[idx]);
 var meta={state:'VOID',recordId:r.id,poNumber:str(r.poNumber),reason:reason,voidedAt:at,previousStatus:r.status||'',supplier:r.supplier||'',jobNumber:r.jobNumber||'',jobId:r.jobId||'',mode:r.mode||'',hadReceivedStatus:received,originalRecord:snapshot};
 pos[idx]=Object.assign({},pos[idx],{status:'Cancelled',voidState:'VOID',voidedAt:at,voidReason:reason,voidPreviousStatus:r.status||''});
 var vs=clone(oldVoids);vs[r.id]=meta;vs['po:'+str(r.poNumber)]=meta;
 try{writeJSON(PO_STORE,pos);writeJSON(VOID_STORE,vs)}catch(e){try{writeJSON(PO_STORE,oldPOs);writeJSON(VOID_STORE,oldVoids)}catch(_){}alert('VOID could not be saved. The original PO was restored.');return}
 syncLinkedPO(r.jobId);
 try{if(typeof window.runluPORender==='function')window.runluPORender();if(typeof window.runluPickupSafeRender==='function')window.runluPickupSafeRender()}catch(_){}
 schedule(120);alert('PO #'+r.poNumber+' is now VOID. Original content and PO number are preserved.'+(received?' Received inventory was not reversed.':''))
}

function subtotal(items){return Math.round((items||[]).reduce(function(s,x){var d=Number(String(x.lineTotal||'').replace(/[$,]/g,'')),q=Number(String(x.qty||'').replace(/[$,]/g,'')),c=Number(String(x.unitCost||'').replace(/[$,]/g,''));return s+(Number.isFinite(d)&&d?d:((Number.isFinite(q)?q:0)*(Number.isFinite(c)?c:0)))},0)*100)/100}
function payload(r,m){var j=activeJob(),items=Array.isArray(r.items)?r.items:[];return {build:'V0.3.84r2',purpose:'PO / Supplier Pickup',poNumber:r.poNumber||'',poStatus:'VOID',voided:true,voidReason:m.reason||'',voidedAt:m.voidedAt||'',previousStatus:m.previousStatus||'',invoiceNumber:j.invoiceNumber||j.jobNumber||r.jobNumber||'',invoiceDate:r.orderDate||new Date().toISOString().slice(0,10),customerName:j.customerName||r.customerName||'',soldToAddress:j.soldToAddress||'',shipToName:j.shipToName||'',shipToAddress:j.shipToAddress||'',email:j.email||'',cell:j.cell||'',phoneHome:j.phoneHome||'',phoneWork:j.phoneWork||'',pickup:r.requestedDate||j.pickup||'',delivery:j.delivery||'',dateRequired:j.dateRequired||r.expectedDate||'',clerk:r.salesRep||j.clerk||'',notes:r.notes||'',items:items.map(function(x){return {qty:x.qty||'',size:x.size||'',style:x.style||'',colour:x.colour||'',sourceType:x.sourceType||'Supplier',sourceRef:x.sourceRef||x.supplierStock||x.supplier||'',supplier:x.supplier||r.supplier||'',unit:x.unit||'',unitCost:x.unitCost||'',lineTotal:x.lineTotal||''}}),subtotal:r.subtotal||subtotal(items),showCosts:false,isDemo:!!j.isDemo}}
function injectWatermark(w,r,m){
 try{
   var d=w.document,inv=d.getElementById('invoice');if(!inv)return false;if(d.getElementById('runluVoidWatermark84r2'))return true;inv.style.position='relative';
   var s=d.createElement('style');s.id='runluVoidCss84r2';s.textContent='#runluVoidWatermark84r2{position:absolute;left:14mm;top:96mm;width:186mm;text-align:center;z-index:9999;pointer-events:none;transform:rotate(-32deg);transform-origin:center;font:900 42mm/1 Arial,sans-serif;letter-spacing:3mm;color:rgba(160,35,35,.18);-webkit-print-color-adjust:exact;print-color-adjust:exact}#runluVoidStamp84r2{position:absolute;right:8mm;top:8mm;z-index:10000;border:2px solid #a33a3a;border-radius:3mm;padding:2.2mm 3mm;background:rgba(255,255,255,.9);color:#8d2929;font:900 4mm/1.2 Arial,sans-serif;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}#runluVoidScreen84r2{margin:8px auto;max-width:900px;padding:9px 12px;border:2px solid #aa4545;border-radius:8px;background:#fff2f2;color:#792626;font:700 13px/1.4 Arial,sans-serif}@media print{#runluVoidWatermark84r2,#runluVoidStamp84r2{display:block!important}#runluVoidScreen84r2{display:none!important}}';d.head.appendChild(s);
   var wm=d.createElement('div');wm.id='runluVoidWatermark84r2';wm.textContent='VOID';inv.appendChild(wm);
   var st=d.createElement('div');st.id='runluVoidStamp84r2';st.innerHTML='VOID<br><span style="font-size:2.7mm">PO #'+esc(r.poNumber||'')+'</span>';inv.appendChild(st);
   var screen=d.createElement('div');screen.id='runluVoidScreen84r2';screen.innerHTML='VOID PO #'+esc(r.poNumber||'')+' · '+esc(m.reason||'')+' · '+esc(stamp(m.voidedAt));var controls=d.querySelector('.controls');if(controls)controls.insertAdjacentElement('beforebegin',screen);
   var p=d.querySelector('.appbar .primary');if(p)p.textContent='Print VOID Copy / Save PDF';d.title='VOID PO #'+str(r.poNumber)+' · Deerfoot Invoice';var tag=d.querySelector('.copyTag');if(tag)tag.textContent='VOID · PO WORKFLOW';return true
 }catch(e){console.error('[RUNLU V084r2] watermark failed',e);return false}
}
function openVoidCopy(r,m){
 try{writeJSON(PREVIEW_KEY,payload(r,m))}catch(e){alert('Could not prepare VOID copy. No PO record was changed.');return}
 var w=window.open('deerfoot-po-invoice-v040.html?v=084r2&t='+Date.now(),'_blank');if(!w){alert('Allow pop-ups to preview the VOID copy.');return}
 var done=function(){var tries=0;(function wait(){if(injectWatermark(w,r,m))return;if(++tries<50)setTimeout(wait,100)})()};w.addEventListener('load',done,{once:true});setTimeout(done,300)
}
function capture(ev){
 var t=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!t)return;
 var r=currentPO();if(!r||!isVoid(r))return;
 var txt=str(t.textContent).toLowerCase(),isPreview=t.id==='poPreviewBtn'||t.id==='poPrintBtn'||txt.indexOf('preview')>=0||txt.indexOf('print')>=0;
 if(isPreview){ev.preventDefault();ev.stopImmediatePropagation();openVoidCopy(r,metaFor(r));return}
 setTimeout(function(){schedule(80)},0)
}
function install(){
 ensureControls();document.addEventListener('click',capture,true);
 var p=by('purchasing');if(p){observer=new MutationObserver(function(){schedule(100)});observer.observe(p,{childList:true,subtree:true})}
 window.addEventListener('storage',function(e){if(e.key===PO_STORE||e.key===VOID_STORE)schedule(100)});
 setInterval(function(){decorateLedger();var r=currentPO();var b=by('poVoidBtnV084R2');if(r&&numberEligible(r)&&!isVoid(r)&&b&&b.style.display==='none')b.style.display='inline-flex'},1500);
 apply();window.RUNLUPOVoidV084R2={version:'0.3.84r2',eligible:function(poNumber){return !!readPOs().find(function(x){return str(x.poNumber)===str(poNumber)})},isVoided:function(poNumber){var r=readPOs().find(function(x){return str(x.poNumber)===str(poNumber)});return isVoid(r)},audit:function(){return clone(readVoids())}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();