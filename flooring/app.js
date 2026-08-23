const STORE='runlu_deerfoot_flooring_jobs_v1', ACTIVE='runlu_deerfoot_flooring_active_job_v1', INV='runlu_flooring_active_invoice_v1';
const NAV=[['command','Command'],['jobs','Jobs'],['purchasing','PO'],['warehouse','Warehouse'],['invoice','Invoice'],['install','Install'],['serviceclaims','Service / Claims'],['accounting','Accounting']];
let jobs=[],activeId=null,editingItems=[];
function demoJob(){return {id:'demo-181482',isDemo:true,jobNumber:'181482',invoiceNumber:'181482',date:'2026-08-20',invoiceDate:'2026-08-20',customerName:'Lee Sutter',soldToAddress:'Calgary, Alberta',shipToName:'Tent Event',shipToAddress:'Supply Only',email:'lee.sutter@example.com',cell:'403-589-7888',phoneHome:'',phoneWork:'',clerk:'N',dateRequired:'2026-08-21',pickup:'Aug 21st',delivery:'or sooner',customerPO:'',supplierPO:'',status:'Confirmed',notes:'Supply only. Tent event.',items:[{qty:'90 SQFT',size:'',style:'Custom Pro Linoleum',colour:'Longmoor Caramel',supplier:'Buckwold',price:18.33,total:1650}],deliveryCharge:0,depositPaid:500,paymentMethod:'interac',installer:'',installDate:'',installStatus:'Not Scheduled',installNotes:''}}
function load(){try{jobs=JSON.parse(localStorage.getItem(STORE)||'[]')}catch(e){jobs=[]}if(!jobs.length){jobs=[demoJob()];saveStore()}activeId=localStorage.getItem(ACTIVE)||jobs[0]?.id||null;if(!jobs.some(j=>j.id===activeId))activeId=jobs[0]?.id||null;renderNav();renderAll()}
function saveStore(){localStorage.setItem(STORE,JSON.stringify(jobs));if(activeId)localStorage.setItem(ACTIVE,activeId)}
function active(){return jobs.find(j=>j.id===activeId)||null}
function money(n){return '$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
function calc(j){const itemSub=(j.items||[]).reduce((s,x)=>s+Number(x.total||0),0),delivery=Number(j.deliveryCharge||0),subtotal=itemSub+delivery,gst=Math.round(subtotal*.05*100)/100,total=subtotal+gst,dep=Number(j.depositPaid||0);return {itemSub,delivery,subtotal,gst,total,balance:Math.max(0,total-dep)}}
function renderNav(){const n=document.getElementById('nav');if(!n)return;n.innerHTML=NAV.map(([id,l])=>`<button data-page="${id}" onclick="go('${id}')">${l}</button>`).join('')}
function go(id){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));if(id==='jobs')loadEditor();if(id==='purchasing')renderPurchasing();if(id==='warehouse')renderWarehouse();if(id==='invoice')prepareInvoice();if(id==='install')loadInstall();if(id==='accounting')loadAccounting();window.scrollTo({top:0,behavior:'smooth'})}
function renderAll(){renderJobs();renderCommand();const first=document.querySelector('nav button[data-page="command"]');if(first)first.classList.add('active')}
function renderCommand(){const open=jobs.filter(j=>!['Closed','Cancelled'].includes(j.status)).length;const mat=jobs.filter(j=>j.status==='Procurement'||!(j.supplierPO||'').trim()).length;const inst=jobs.filter(j=>['Ready','In Progress'].includes(j.status)||['Scheduled','In Progress'].includes(j.installStatus)).length;const bal=jobs.reduce((s,j)=>s+calc(j).balance,0);const stOpenEl=byId('stOpen'),stMaterialEl=byId('stMaterial'),stInstallEl=byId('stInstall'),stBalanceEl=byId('stBalance');if(stOpenEl)stOpenEl.textContent=open;if(stMaterialEl)stMaterialEl.textContent=mat;if(stInstallEl)stInstallEl.textContent=inst;if(stBalanceEl)stBalanceEl.textContent=money(bal).replace('.00','');const j=active(),activeSummaryEl=byId('activeSummary');if(activeSummaryEl)activeSummaryEl.innerHTML=j?`<b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${esc(j.jobNumber||'No #')} · ${esc(j.customerName||'Unnamed customer')}</b><br>${esc(j.status||'Draft')} · Required ${esc(j.dateRequired||'—')} · Balance ${money(calc(j).balance)}`:'No active Job.';const items=[];jobs.filter(j=>!['Closed','Cancelled'].includes(j.status)).slice(0,6).forEach(j=>{if(j.status==='Procurement'||!(j.supplierPO||'').trim())items.push([j,'Material / PO needs attention']);else if(j.dateRequired)items.push([j,'Required '+j.dateRequired]);else if(calc(j).balance>0)items.push([j,'Balance '+money(calc(j).balance)]) });const attentionEl=byId('attention');if(attentionEl)attentionEl.innerHTML=items.length?items.map(([j,t])=>`<div class="attention"><b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${esc(j.jobNumber)} · ${esc(j.customerName)}</b><span>${esc(t)}</span></div>`).join(''):'<div class="muted">No open attention items.</div>'}
function renderJobs(){const el=document.getElementById('jobList');if(!el)return;el.innerHTML=jobs.length?jobs.map(j=>`<div class="jobRow"><div><b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${esc(j.jobNumber||'No #')} · ${esc(j.customerName||'Unnamed customer')}</b><small>${esc(j.status||'Draft')} · ${esc(j.dateRequired||'No required date')} · ${money(calc(j).balance)} due</small></div><button class="action" onclick="selectJob('${j.id}')">Open</button></div>`).join(''):'<div class="muted">No Jobs yet.</div>'}
function selectJob(id){activeId=id;saveStore();renderAll();loadEditor();go('jobs')}
function newJob(){const id='job-'+Date.now(),d=new Date().toISOString().slice(0,10);jobs.unshift({id,isDemo:false,jobNumber:'',invoiceNumber:'',date:d,invoiceDate:d,customerName:'',soldToAddress:'',shipToName:'',shipToAddress:'',email:'',cell:'',clerk:'',dateRequired:'',pickup:'',delivery:'',customerPO:'',supplierPO:'',status:'Draft',notes:'',items:[],deliveryCharge:0,depositPaid:0,paymentMethod:'',installer:'',installDate:'',installStatus:'Not Scheduled',installNotes:''});activeId=id;saveStore();renderAll();loadEditor()}
function byId(id){return document.getElementById(id)}
function loadEditor(){const j=active();if(!j)return;const title=byId('jobEditorTitle');if(title)title.textContent=(j.isDemo?'DEMO · ':'')+'Job / Order '+(j.jobNumber||'New');['jobNumber','invoiceNumber','customerName','clerk','soldToAddress','shipToName','shipToAddress','email','cell','dateRequired','status','pickup','delivery','customerPO','supplierPO','notes'].forEach(k=>{const el=byId(k);if(el)el.value=j[k]||''});editingItems=JSON.parse(JSON.stringify(j.items||[]));renderItemsEditor()}
function renderItemsEditor(){const el=byId('itemsEditor');if(!el)return;el.innerHTML=editingItems.length?editingItems.map((x,i)=>`<div class="itemRow"><div><label>Qty</label><input value="${attr(x.qty)}" oninput="editItem(${i},'qty',this.value)"></div><div><label>Size</label><input value="${attr(x.size)}" oninput="editItem(${i},'size',this.value)"></div><div class="wide"><label>Style</label><input value="${attr(x.style)}" oninput="editItem(${i},'style',this.value)"></div><div><label>Colour</label><input value="${attr(x.colour)}" oninput="editItem(${i},'colour',this.value)"></div><div><label>Supplier</label><input value="${attr(x.supplier)}" oninput="editItem(${i},'supplier',this.value)"></div><div><label>Price</label><input type="number" step=".01" value="${Number(x.price||0)}" oninput="editItem(${i},'price',this.value)"></div><div><label>Line Total</label><input type="number" step=".01" value="${Number(x.total||0)}" oninput="editItem(${i},'total',this.value)"></div><button class="action red" onclick="removeItem(${i})">×</button></div>`).join(''):'<div class="muted">No item lines yet.</div>'}
function addItem(){editingItems.push({qty:'',size:'',style:'',colour:'',supplier:'',price:0,total:0});renderItemsEditor()}
function removeItem(i){editingItems.splice(i,1);renderItemsEditor()}
function editItem(i,k,v){editingItems[i][k]=['price','total'].includes(k)?Number(v||0):v}
function saveJob(){const j=active();if(!j)return;['jobNumber','invoiceNumber','customerName','clerk','soldToAddress','shipToName','shipToAddress','email','cell','dateRequired','status','pickup','delivery','customerPO','supplierPO','notes'].forEach(k=>{const el=byId(k);if(el)j[k]=el.value.trim()});j.items=editingItems;j.invoiceNumber=j.invoiceNumber||j.jobNumber;j.invoiceDate=j.invoiceDate||new Date().toISOString().slice(0,10);j.isDemo=false;saveStore();renderAll();alert('Job saved.')}
function renderPurchasing(){const j=active(),poSummaryEl=byId('poSummary'),poItemsEl=byId('poItems');if(!j){if(poSummaryEl)poSummaryEl.textContent='Select a Job.';return}if(poSummaryEl)poSummaryEl.innerHTML=`<b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${esc(j.jobNumber)} · ${esc(j.customerName)}</b><br>Supplier PO: ${esc(j.supplierPO||'Not assigned')} · Customer PO: ${esc(j.customerPO||'—')} · Status: ${esc(j.status)}`;if(poItemsEl)poItemsEl.innerHTML=(j.items||[]).map(x=>`<div class="jobRow"><div><b>${esc(x.style||'Item')} · ${esc(x.colour||'')}</b><small>${esc(x.qty||'')} · ${esc(x.supplier||'Supplier not set')}</small></div><span class="tag">${money(x.total||0)}</span></div>`).join('')||'<div class="muted">No items.</div>'}
function handoffText(j){if(!j)return 'No active Job.';return ['RUNLU DEERFOOT FLOORING → WAREHOUSE HANDOFF','Job / Order: '+(j.jobNumber||''),'Customer: '+(j.customerName||''),'Supplier PO: '+(j.supplierPO||''),'Required: '+(j.dateRequired||''),'Pickup: '+(j.pickup||''),'Delivery: '+(j.delivery||''),'Items:',...(j.items||[]).map((x,i)=>`${i+1}. ${x.qty||''} | ${x.style||''} | ${x.colour||''} | ${x.supplier||''}`),'Notes: '+(j.notes||'')].join('\n')}
function renderWarehouse(){const j=active(),handoffEl=byId('handoff');if(handoffEl)handoffEl.textContent=handoffText(j);refreshWarehouse()}
function warehouseUrl(){const j=active()||{};const p=new URLSearchParams({from:'flooring',job:j.jobNumber||'',po:j.supplierPO||'',customer:j.customerName||''});return 'https://warehouse.runlu.ca/?'+p.toString()}
function refreshWarehouse(){const f=byId('warehouseFrame');if(f)f.src=warehouseUrl()}
function openWarehouse(){window.open(warehouseUrl(),'_blank')}
async function copyHandoff(){try{await navigator.clipboard.writeText(handoffText(active()));alert('Warehouse handoff copied.')}catch(e){alert('Copy is unavailable in this browser.')}}
function prepareInvoice(){const j=active();if(!j)return;const c=calc(j),payload={...j,subtotal:c.subtotal,gst:c.gst,grandTotal:c.total,balanceDue:c.balance,invoiceDate:j.invoiceDate||j.date||new Date().toISOString().slice(0,10)};localStorage.setItem(INV,JSON.stringify(payload));const f=byId('invoiceFrame');if(f)f.src='deerfoot-invoice.html?job='+encodeURIComponent(j.jobNumber||'')+'&t='+Date.now()}
function loadInstall(){const j=active();if(!j)return;['installer','installDate','installStatus','installNotes'].forEach(k=>{const el=byId(k);if(el)el.value=j[k]||''})}
function saveInstall(){const j=active();if(!j)return;['installer','installDate','installStatus','installNotes'].forEach(k=>{const el=byId(k);if(el)j[k]=el.value});saveStore();renderAll();alert('Installation saved.')}
function loadAccounting(){const j=active();if(!j)return;const d=byId('deliveryCharge'),p=byId('depositPaid'),m=byId('paymentMethod');if(d)d.value=Number(j.deliveryCharge||0);if(p)p.value=Number(j.depositPaid||0);if(m)m.value=j.paymentMethod||'';renderAccounting()}
function renderAccounting(){const j=active();if(!j)return;const c=calc(j),s=byId('aSub'),g=byId('aGst'),t=byId('aTotal'),b=byId('aBalance');if(s)s.textContent=money(c.subtotal);if(g)g.textContent=money(c.gst);if(t)t.textContent=money(c.total);if(b)b.textContent=money(c.balance)}
function saveAccounting(){const j=active();if(!j)return;const d=byId('deliveryCharge'),p=byId('depositPaid'),m=byId('paymentMethod');j.deliveryCharge=Number(d?.value||0);j.depositPaid=Number(p?.value||0);j.paymentMethod=m?.value||'';saveStore();renderAccounting();renderAll();alert('Accounting saved.')}
['deliveryCharge','depositPaid'].forEach(id=>document.addEventListener('input',e=>{if(e.target.id===id){const j=active();if(j){j[id]=Number(e.target.value||0);renderAccounting()}}}));
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function attr(v){return esc(v).replace(/"/g,'&quot;')}
let __runluBaseBooted=false;
function bootBase(){
  if(__runluBaseBooted)return;
  __runluBaseBooted=true;
  try{load()}catch(e){__runluBaseBooted=false;console.error('Flooring OS base boot failed:',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootBase,{once:true});else bootBase();
window.addEventListener('pageshow',()=>{if(!document.querySelector('#nav button')){__runluBaseBooted=false;bootBase()}});

/* V0.2.2 Deerfoot invoice form checks */
(function(){
  const CHECK_IDS=['invoiceDepositPaidCheck','invoiceBalancePaidCheck','invoiceProductViewedCheck'];
  function normalizeChecks(j){
    if(!j)return;
    if(typeof j.depositPaidConfirmed!=='boolean')j.depositPaidConfirmed=Number(j.depositPaid||0)>0;
    if(typeof j.balancePaid!=='boolean'){const c=calc(j);j.balancePaid=c.total>0&&c.balance<=0}
    if(typeof j.productViewedBeforeInstall!=='boolean')j.productViewedBeforeInstall=false;
  }
  function injectCheckControls(){
    const section=document.getElementById('accounting');if(!section||document.getElementById('invoiceFormChecks'))return;
    const card=section.querySelector('.card');if(!card)return;
    const actions=card.querySelector('.actions');
    const box=document.createElement('div');box.id='invoiceFormChecks';box.className='notice';box.style.marginTop='12px';
    box.innerHTML='<b style="display:block;margin-bottom:8px;color:#173d30">Invoice Form Checks</b><div style="display:grid;gap:9px"><label style="display:flex;gap:9px;align-items:center;margin:0;color:#25312b;font-size:13px"><input id="invoiceDepositPaidCheck" type="checkbox" style="width:20px;height:20px"> Mark first PAID box ✓</label><label style="display:flex;gap:9px;align-items:center;margin:0;color:#25312b;font-size:13px"><input id="invoiceBalancePaidCheck" type="checkbox" style="width:20px;height:20px"> Mark second PAID box ✓</label><label style="display:flex;gap:9px;align-items:center;margin:0;color:#25312b;font-size:13px"><input id="invoiceProductViewedCheck" type="checkbox" style="width:20px;height:20px"> Customer viewed product before install ✓</label></div><div class="muted" style="margin-top:8px">Payment Method above remains single-choice and automatically checks FINANCE / CASH / CHEQUE / VISA / MASTER CARD / INTERAC on the printed Deerfoot invoice.</div>';
    if(actions)card.insertBefore(box,actions);else card.appendChild(box);
  }
  function loadCheckControls(){
    injectCheckControls();const j=active();if(!j)return;normalizeChecks(j);
    const a=document.getElementById(CHECK_IDS[0]),b=document.getElementById(CHECK_IDS[1]),c=document.getElementById(CHECK_IDS[2]);
    if(a)a.checked=!!j.depositPaidConfirmed;if(b)b.checked=!!j.balancePaid;if(c)c.checked=!!j.productViewedBeforeInstall;
  }
  function saveCheckControls(){
    const j=active();if(!j)return;normalizeChecks(j);
    const a=document.getElementById(CHECK_IDS[0]),b=document.getElementById(CHECK_IDS[1]),c=document.getElementById(CHECK_IDS[2]);
    if(a)j.depositPaidConfirmed=!!a.checked;if(b)j.balancePaid=!!b.checked;if(c)j.productViewedBeforeInstall=!!c.checked;
  }
  const oldLoadAccounting=loadAccounting;
  loadAccounting=function(){oldLoadAccounting();loadCheckControls()};
  const oldSaveAccounting=saveAccounting;
  saveAccounting=function(){saveCheckControls();oldSaveAccounting()};
  const oldPrepareInvoice=prepareInvoice;
  prepareInvoice=function(){const j=active();if(j){saveCheckControls();normalizeChecks(j);saveStore()}oldPrepareInvoice()};
  const bootChecks=()=>{injectCheckControls();const j=active();if(j){normalizeChecks(j);saveStore()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootChecks,{once:true});else bootChecks();
})();

/* V0.3.17 Showroom isolated restore. Core boots first; Showroom attaches independently. */
(function(){
  function loadShowroomSafe(){
    if(window.__runluShowroomSafeRequested)return;
    window.__runluShowroomSafeRequested=true;
    const css=document.createElement('link');
    css.rel='stylesheet';css.href='showroom-safe-v011.css?v=011';document.head.appendChild(css);
    const s=document.createElement('script');
    s.src='showroom-safe-v011.js?v=011';s.async=true;
    s.onerror=()=>console.error('RUNLU Showroom safe module failed to load.');
    document.body.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadShowroomSafe,{once:true});else loadShowroomSafe();
})();