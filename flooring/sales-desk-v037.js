/* RUNLU Deerfoot Flooring OS · Sales Desk / Filing Cabinet V0.3.37
   One shared data set, many salesperson views. No customer/job/PO/invoice duplication.
   Reads the existing Job + Service/Claim stores and groups them by Sales Rep.
   Only Follow-up items are new records, stored once in a dedicated Sales follow-up store.
*/
(function(){
  'use strict';
  if(window.__runluSalesDesk037)return;
  window.__runluSalesDesk037=true;

  const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
  const CLAIM_STORE='runlu_deerfoot_service_claims_v1';
  const FOLLOW_STORE='runlu_deerfoot_sales_followups_v1';
  const VERSION='V0.3.37 Sales Desk / Filing Cabinet';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const attr=v=>esc(v).replace(/"/g,'&quot;');
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
  const money=v=>'$'+num(v).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
  let currentRep='';
  let currentTab='overview';

  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(_){return fallback}}
  function jobs(){const v=read(JOB_STORE,[]);return Array.isArray(v)?v:[]}
  function claims(){const v=read(CLAIM_STORE,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
  function followups(){const v=read(FOLLOW_STORE,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
  function saveFollowups(v){localStorage.setItem(FOLLOW_STORE,JSON.stringify(v))}
  function repOf(j){return String(j?.salesRep||'').trim()||'Unassigned'}
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function dateOf(j){return String(j?.date||j?.invoiceDate||j?.dateRequired||'').slice(0,10)}
  function itemCost(x){if(x?.costTotal!==undefined&&x.costTotal!==null&&String(x.costTotal)!=='')return num(x.costTotal);const q=parseFloat(String(x?.qty||'').replace(/,/g,''))||0;return q*num(x?.cost)}
  function metrics(j){const itemSales=(j.items||[]).reduce((s,x)=>s+num(x.total),0),delivery=num(j.deliveryCharge),net=itemSales+delivery,gst=Math.round(net*.05*100)/100,total=net+gst,cost=(j.items||[]).reduce((s,x)=>s+itemCost(x),0),paid=num(j.depositPaid),balance=Math.max(0,total-paid),profit=net-cost;return {net,gst,total,cost,profit,margin:net?profit/net*100:0,balance}}
  function repJobs(rep){return jobs().filter(j=>repOf(j).toLowerCase()===String(rep).toLowerCase()&&j.status!=='Cancelled')}
  function isOpen(j){return !['Completed','Closed','Cancelled'].includes(String(j.status||''))}
  function normalizeCustomer(v){return String(v||'Unnamed customer').trim().toLowerCase()}
  function customerGroups(xs){
    const map=new Map();
    xs.forEach(j=>{const k=normalizeCustomer(j.customerName);if(!map.has(k))map.set(k,{name:j.customerName||'Unnamed customer',jobs:[],email:'',cell:'',phone:'',address:''});const c=map.get(k);c.jobs.push(j);c.email=c.email||j.email||'';c.cell=c.cell||j.cell||'';c.phone=c.phoneHome||j.phoneHome||'';c.address=c.address||j.soldToAddress||j.shipToAddress||''});
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
  }
  function claimRows(xs){const db=claims(),ids=new Set(xs.map(jobKey));return Object.entries(db).filter(([k,r])=>ids.has(k)||xs.some(j=>String(r?.jobNumber||'')===String(j.jobNumber||''))).map(([k,r])=>({key:k,...r,job:xs.find(j=>jobKey(j)===k||String(j.jobNumber||'')===String(r?.jobNumber||''))||null}))}
  function repFollowups(rep){const db=followups();return Array.isArray(db[rep])?db[rep]:[]}

  function injectStyle(){
    if($('salesDeskStyle037'))return;
    const s=document.createElement('style');s.id='salesDeskStyle037';s.textContent=`
      .sd037Launch{margin-left:6px}.sd037Hero{background:linear-gradient(135deg,#122f25,#226047);color:#fff}.sd037Hero .muted{color:#d7e5df}.sd037Head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.sd037Head h2{font-size:28px;margin:0 0 5px}.sd037Search{margin-top:12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.sd037Search input{background:#fff;color:#111}.sd037Tabs{display:flex;gap:7px;overflow-x:auto;padding:10px 0 3px;scrollbar-width:none}.sd037Tabs::-webkit-scrollbar{display:none}.sd037Tab{white-space:nowrap;border:1px solid var(--line);background:#fff;border-radius:999px;padding:9px 13px;font-weight:800}.sd037Tab.active{background:#173d30;color:#fff;border-color:#173d30}
      .sd037Stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:12px 0}.sd037Stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px}.sd037Stat b{display:block;font-size:22px}.sd037Stat span{color:var(--muted);font-size:11px}.sd037Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sd037Drawer{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px}.sd037Drawer h3{margin:0 0 9px}.sd037Row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--line)}.sd037Row:first-child{border-top:0}.sd037Row small{display:block;color:var(--muted);margin-top:3px;line-height:1.4}.sd037Money{text-align:right;white-space:nowrap}.sd037Money b{display:block}.sd037Actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.sd037Mini{border:0;background:#edf3ef;border-radius:9px;padding:7px 10px;font-weight:800}.sd037Mini.primary{background:#173d30;color:#fff}.sd037Mini.blue{background:#e8f0ff;color:#19539b}.sd037Badge{display:inline-flex;border-radius:999px;padding:4px 8px;background:#edf3ef;font-size:10px;font-weight:900}.sd037Badge.warn{background:#fff1d7;color:#815100}.sd037Badge.done{background:#e3f5e8;color:#176332}.sd037Empty{color:var(--muted);padding:15px 0}.sd037TableWrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.sd037Table{width:100%;border-collapse:collapse;min-width:740px}.sd037Table th,.sd037Table td{border-bottom:1px solid var(--line);padding:9px;text-align:left;vertical-align:top}.sd037Table th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.sd037FollowForm{display:grid;grid-template-columns:1.2fr .7fr .7fr auto;gap:8px;align-items:end;margin-bottom:12px}.sd037CustomerMeta{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-top:5px}.sd037Attention{border-left:4px solid #e2a719;padding-left:10px}.sd037Case{border-left:4px solid #2766c3;padding-left:10px}
      @media(max-width:1100px){.sd037Stats{grid-template-columns:repeat(3,minmax(0,1fr))}.sd037Grid{grid-template-columns:1fr}}
      @media(max-width:700px){.sd037Head{display:block}.sd037Stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sd037Search{grid-template-columns:1fr}.sd037Row{grid-template-columns:1fr}.sd037Money{text-align:left}.sd037Actions{justify-content:flex-start}.sd037FollowForm{grid-template-columns:1fr 1fr}.sd037FollowForm .wide{grid-column:1/-1}.sd037FollowForm button{grid-column:1/-1}.sd037Drawer{padding:13px}.sd037Stat b{font-size:19px}}
    `;document.head.appendChild(s);
  }

  function ensureLaunch(){
    const sales=$('sales');if(!sales)return false;
    const hero=sales.querySelector('.sales033Hero');if(!hero)return false;
    let b=$('salesDeskLaunch037');if(!b){b=document.createElement('button');b.type='button';b.id='salesDeskLaunch037';b.className='action sd037Launch';b.textContent='Open Sales Desk';b.addEventListener('click',()=>{const rep=$('sales033Rep')?.value||'';if(!rep||rep==='ALL'){alert('Choose a Sales Rep first, then open the Desk.');return}openDesk(rep)});const actions=hero.querySelector('.actions');actions?.appendChild(b)}
    updateLaunch();
    return true;
  }
  function updateLaunch(){const b=$('salesDeskLaunch037'),rep=$('sales033Rep')?.value||'';if(!b)return;b.disabled=!rep||rep==='ALL';b.textContent=rep&&rep!=='ALL'?'Open '+rep+' Desk':'Open Sales Desk'}

  function ensureDeskPage(){
    let sec=$('salesdesk');if(sec)return sec;
    sec=document.createElement('section');sec.id='salesdesk';sec.className='page';sec.innerHTML=`
      <div class="card sd037Hero"><div class="sd037Head"><div><button id="sd037Back" class="action">← Back to Sales</button><h2 id="sd037Title">Sales Desk</h2><div id="sd037Subtitle" class="muted">One database · salesperson view</div></div><span class="tag">Desk / Filing Cabinet</span></div><div class="sd037Search"><input id="sd037Search" placeholder="Search this desk: customer, job, PO, invoice, product"><button id="sd037NewJob" class="action primary">+ New Job for this Sales Rep</button></div></div>
      <div id="sd037Stats" class="sd037Stats"></div>
      <div id="sd037Tabs" class="sd037Tabs"></div>
      <div id="sd037Body"></div>`;
    const sales=$('sales');sales?.insertAdjacentElement('afterend',sec)||document.querySelector('main')?.appendChild(sec);
    $('sd037Back').addEventListener('click',()=>{if(typeof window.go==='function')window.go('sales')});
    $('sd037Search').addEventListener('input',renderDesk);
    $('sd037NewJob').addEventListener('click',newJobForRep);
    return sec;
  }

  function setActiveJob(j){if(!j)return;localStorage.setItem(ACTIVE_STORE,j.id||j.jobNumber||'')}
  function openJob(j){setActiveJob(j);if(typeof window.selectJob==='function'&&j.id)window.selectJob(j.id);else if(typeof window.go==='function')window.go('jobs')}
  function openModule(j,page){setActiveJob(j);if(typeof window.renderAll==='function')try{window.renderAll()}catch(_){};if(page==='invoice'&&typeof window.prepareInvoice==='function')try{window.prepareInvoice()}catch(_){};if(typeof window.go==='function')window.go(page)}
  function newJobForRep(){
    if(typeof window.newJob!=='function'){alert('New Job is unavailable.');return}
    window.newJob();const xs=jobs(),id=localStorage.getItem(ACTIVE_STORE),j=xs.find(x=>x.id===id)||xs[0];if(j){j.salesRep=currentRep;localStorage.setItem(JOB_STORE,JSON.stringify(xs));if(typeof window.loadEditor==='function')try{window.loadEditor()}catch(_){}}
    if(typeof window.go==='function')window.go('jobs');
  }

  function openDesk(rep){currentRep=String(rep||'').trim();if(!currentRep||currentRep==='ALL')return;currentTab='overview';ensureDeskPage();if(typeof window.go==='function')window.go('salesdesk');else{$('salesdesk').classList.add('active')};renderDesk()}
  function filteredRepJobs(){const q=String($('sd037Search')?.value||'').trim().toLowerCase(),xs=repJobs(currentRep);if(!q)return xs;return xs.filter(j=>[j.customerName,j.jobNumber,j.invoiceNumber,j.supplierPO,j.customerPO,j.email,j.cell,j.soldToAddress,j.shipToAddress,j.installer,...(j.items||[]).flatMap(x=>[x.style,x.colour,x.supplier,x.sku,x.productId])].some(v=>String(v||'').toLowerCase().includes(q)))}

  function renderStats(xs){
    const all=repJobs(currentRep),customers=customerGroups(all),open=all.filter(isOpen).length,drafts=all.filter(j=>String(j.status||'')==='Draft').length,po=all.filter(j=>String(j.supplierPO||'').trim()).length,installs=all.filter(j=>j.installDate||!['','Not Scheduled'].includes(String(j.installStatus||''))).length,cases=claimRows(all).filter(r=>!['Resolved','Closed'].includes(String(r.status||''))).length,balance=all.reduce((s,j)=>s+metrics(j).balance,0);
    $('sd037Stats').innerHTML=[['Customers',customers.length],['Open Jobs',open],['Drafts / Quotes',drafts],['PO Linked',po],['Open Claims',cases],['Balance Due',money(balance)]].map(([l,v])=>`<div class="sd037Stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('');
  }
  const TABS=[['overview','Overview'],['customers','Customers'],['jobs','Jobs / Orders'],['po','PO'],['invoices','Invoices / Payments'],['install','Install'],['claims','Service / Claims'],['followups','Follow-ups']];
  function renderTabs(){const el=$('sd037Tabs');if(!el)return;el.innerHTML=TABS.map(([k,l])=>`<button class="sd037Tab ${k===currentTab?'active':''}" data-sdtab="${k}">${l}</button>`).join('');el.querySelectorAll('[data-sdtab]').forEach(b=>b.addEventListener('click',()=>{currentTab=b.dataset.sdtab;renderDesk()}))}

  function overviewHtml(xs){
    const all=repJobs(currentRep),open=all.filter(isOpen),attention=open.filter(j=>!String(j.supplierPO||'').trim()||metrics(j).balance>0||String(j.status||'')==='Procurement').slice(0,8),soon=all.filter(j=>j.dateRequired||j.installDate).sort((a,b)=>String(a.dateRequired||a.installDate||'').localeCompare(String(b.dateRequired||b.installDate||''))).slice(0,8),fu=repFollowups(currentRep).filter(x=>!x.done).sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))).slice(0,6);
    return `<div class="sd037Grid"><div class="sd037Drawer"><h3>Needs Attention</h3>${attention.length?attention.map(j=>{const m=metrics(j);const why=[];if(!j.supplierPO)why.push('PO not linked');if(j.status==='Procurement')why.push('Procurement');if(m.balance>0)why.push(money(m.balance)+' due');return rowJob(j,why.join(' · '),'jobs')}).join(''):'<div class="sd037Empty">No immediate attention items.</div>'}</div><div class="sd037Drawer"><h3>Upcoming / Schedule</h3>${soon.length?soon.map(j=>rowJob(j,(j.installDate?'Install '+j.installDate:'Required '+j.dateRequired)+(j.installer?' · '+j.installer:''),'install')).join(''):'<div class="sd037Empty">No dated jobs yet.</div>'}</div><div class="sd037Drawer"><h3>Open Follow-ups</h3>${fu.length?fu.map(f=>`<div class="sd037Row"><div><b>${esc(f.customer||f.subject||'Follow-up')}</b><small>${esc(f.type||'Follow-up')} · ${esc(f.due||'No due date')}<br>${esc(f.note||'')}</small></div><button class="sd037Mini" data-fudone="${esc(f.id)}">Done</button></div>`).join(''):'<div class="sd037Empty">No open follow-ups.</div>'}</div><div class="sd037Drawer"><h3>Sales Snapshot</h3>${salesSnapshot(all)}</div></div>`;
  }
  function salesSnapshot(xs){let net=0,cost=0,profit=0;xs.forEach(j=>{const m=metrics(j);net+=m.net;cost+=m.cost;profit+=m.profit});const margin=net?profit/net*100:0;return `<div class="sd037Stats" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:0"><div class="sd037Stat"><b>${money(net)}</b><span>Net Sales</span></div><div class="sd037Stat"><b>${money(cost)}</b><span>Known Cost</span></div><div class="sd037Stat"><b>${money(profit)}</b><span>Gross Profit</span></div><div class="sd037Stat"><b>${margin.toFixed(1)}%</b><span>Margin</span></div></div>`}
  function rowJob(j,sub,target){const m=metrics(j);return `<div class="sd037Row"><div><b>${j.isDemo?'<span class="sales033Demo">DEMO</span>':''}${esc(j.customerName||'Unnamed customer')} · #${esc(j.jobNumber||'—')}</b><small>${esc(sub||j.status||'')} · ${esc(dateOf(j)||'No date')}</small></div><div class="sd037Actions"><button class="sd037Mini primary" data-openjob="${attr(j.id||j.jobNumber)}" data-target="${attr(target||'jobs')}">Open</button></div></div>`}

  function customersHtml(xs){const groups=customerGroups(xs);return `<div class="sd037Drawer"><h3>${esc(currentRep)} Customers</h3>${groups.length?groups.map(c=>{const open=c.jobs.filter(isOpen).length,total=c.jobs.reduce((s,j)=>s+metrics(j).net,0);return `<div class="sd037Row"><div><b>${esc(c.name)}</b><div class="sd037CustomerMeta"><span>${esc(c.cell||c.phone||'No phone')}</span><span>${esc(c.email||'No email')}</span></div><small>${esc(c.address||'No address')}<br>${c.jobs.length} job(s) · ${open} open</small></div><div class="sd037Money"><b>${money(total)}</b><small>Net sales</small><button class="sd037Mini" data-customer="${attr(c.name)}">Jobs</button></div></div>`}).join(''):'<div class="sd037Empty">No customers assigned to this salesperson yet.</div>'}</div>`}
  function jobsHtml(xs){return `<div class="sd037Drawer"><h3>Jobs / Orders</h3>${xs.length?`<div class="sd037TableWrap"><table class="sd037Table"><thead><tr><th>Customer / Job</th><th>Status</th><th>Date</th><th>Net</th><th>Balance</th><th></th></tr></thead><tbody>${xs.map(j=>{const m=metrics(j);return `<tr><td><b>${esc(j.customerName||'Unnamed')}</b><small>#${esc(j.jobNumber||'—')}</small></td><td>${esc(j.status||'Draft')}</td><td>${esc(dateOf(j)||'—')}</td><td>${money(m.net)}</td><td>${money(m.balance)}</td><td><button class="sd037Mini primary" data-openjob="${attr(j.id||j.jobNumber)}" data-target="jobs">Open</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="sd037Empty">No matching Jobs / Orders.</div>'}</div>`}
  function poHtml(xs){const rows=xs.filter(j=>String(j.supplierPO||'').trim());return `<div class="sd037Drawer"><h3>PO / Supplier Orders</h3>${rows.length?rows.map(j=>{const suppliers=[...new Set((j.items||[]).map(x=>x.supplier).filter(Boolean))].join(', ');return `<div class="sd037Row"><div><b>PO ${esc(j.supplierPO)}</b><small>${esc(j.customerName||'')} · Job #${esc(j.jobNumber||'—')}<br>${esc(suppliers||'Supplier not set')}</small></div><div class="sd037Actions"><button class="sd037Mini primary" data-openjob="${attr(j.id||j.jobNumber)}" data-target="purchasing">Open PO</button></div></div>`}).join(''):'<div class="sd037Empty">No linked PO records for this salesperson.</div>'}</div>`}
  function invoiceHtml(xs){const rows=xs.filter(j=>String(j.invoiceNumber||'').trim());return `<div class="sd037Drawer"><h3>Invoices / Payments</h3>${rows.length?rows.map(j=>{const m=metrics(j);return `<div class="sd037Row"><div><b>Invoice #${esc(j.invoiceNumber)}</b><small>${esc(j.customerName||'')} · Job #${esc(j.jobNumber||'—')}<br>${m.balance>0?'<span class="sd037Badge warn">Balance '+money(m.balance)+'</span>':'<span class="sd037Badge done">Paid / $0 balance</span>'}</small></div><div class="sd037Actions"><button class="sd037Mini blue" data-openjob="${attr(j.id||j.jobNumber)}" data-target="invoice">Invoice</button><button class="sd037Mini" data-openjob="${attr(j.id||j.jobNumber)}" data-target="accounting">Accounting</button></div></div>`}).join(''):'<div class="sd037Empty">No invoices yet.</div>'}</div>`}
  function installHtml(xs){const rows=xs.filter(j=>j.installDate||j.installer||!['','Not Scheduled'].includes(String(j.installStatus||'')));return `<div class="sd037Drawer"><h3>Installation / Schedule</h3>${rows.length?rows.map(j=>`<div class="sd037Row"><div><b>${esc(j.customerName||'')} · #${esc(j.jobNumber||'—')}</b><small>${esc(j.installDate||'No install date')} · ${esc(j.installStatus||'Not Scheduled')}<br>Installer: ${esc(j.installer||'Unassigned')}</small></div><button class="sd037Mini primary" data-openjob="${attr(j.id||j.jobNumber)}" data-target="install">Open Install</button></div>`).join(''):'<div class="sd037Empty">No installation records yet.</div>'}</div>`}
  function claimsHtml(xs){const rows=claimRows(xs);return `<div class="sd037Drawer"><h3>Service / Claims</h3>${rows.length?rows.map(r=>`<div class="sd037Row"><div class="sd037Case"><b>${esc(r.claimNumber||r.type||'Service / Claim')}</b><small>${esc(r.job?.customerName||r.customerName||'')} · Job #${esc(r.job?.jobNumber||r.jobNumber||'—')}<br>${esc(r.status||'Open')} · ${esc(r.openedDate||'')}</small></div>${r.job?`<button class="sd037Mini primary" data-openjob="${attr(r.job.id||r.job.jobNumber)}" data-target="serviceclaims">Open Case</button>`:''}</div>`).join(''):'<div class="sd037Empty">No Service / Claim records for this salesperson.</div>'}</div>`}
  function followupsHtml(){const rows=repFollowups(currentRep);return `<div class="sd037Drawer"><h3>Follow-ups / Desk Notes</h3><div class="sd037FollowForm"><div class="wide"><label>Customer / Subject</label><input id="sd037FuSubject" placeholder="Customer or subject"></div><div><label>Type</label><select id="sd037FuType"><option>Call</option><option>Email</option><option>Quote</option><option>Order</option><option>Payment</option><option>Install</option><option>Claim</option><option>Other</option></select></div><div><label>Due</label><input id="sd037FuDue" type="date"></div><button id="sd037FuAdd" class="action primary">Add Follow-up</button><div class="wide"><label>Note</label><input id="sd037FuNote" placeholder="What needs to happen next?"></div></div>${rows.length?rows.sort((a,b)=>(Number(a.done)-Number(b.done))||String(a.due||'').localeCompare(String(b.due||''))).map(f=>`<div class="sd037Row"><div><b>${f.done?'✓ ':''}${esc(f.subject||'Follow-up')}</b><small>${esc(f.type||'Follow-up')} · ${esc(f.due||'No due date')}<br>${esc(f.note||'')}</small></div><div class="sd037Actions"><button class="sd037Mini ${f.done?'':'primary'}" data-fudone="${esc(f.id)}">${f.done?'Reopen':'Done'}</button><button class="sd037Mini" data-fudelete="${esc(f.id)}">Delete</button></div></div>`).join(''):'<div class="sd037Empty">This desk has no follow-ups yet.</div>'}</div>`}

  function renderDesk(){
    if(!currentRep)return;ensureDeskPage();const xs=filteredRepJobs();$('sd037Title').textContent=currentRep+' — Sales Desk';$('sd037Subtitle').textContent='Customers · Jobs · PO · Invoices · Install · Claims · Follow-ups · one shared data set';renderStats(xs);renderTabs();const body=$('sd037Body');if(!body)return;
    body.innerHTML=currentTab==='customers'?customersHtml(xs):currentTab==='jobs'?jobsHtml(xs):currentTab==='po'?poHtml(xs):currentTab==='invoices'?invoiceHtml(xs):currentTab==='install'?installHtml(xs):currentTab==='claims'?claimsHtml(xs):currentTab==='followups'?followupsHtml():overviewHtml(xs);
    wireBody();markVersion();
  }
  function findJob(id){return jobs().find(j=>String(j.id||j.jobNumber)===String(id))}
  function wireBody(){
    const body=$('sd037Body');if(!body)return;
    body.querySelectorAll('[data-openjob]').forEach(b=>b.addEventListener('click',()=>{const j=findJob(b.dataset.openjob);if(!j)return;openModule(j,b.dataset.target||'jobs')}));
    body.querySelectorAll('[data-customer]').forEach(b=>b.addEventListener('click',()=>{$('sd037Search').value=b.dataset.customer||'';currentTab='jobs';renderDesk()}));
    body.querySelectorAll('[data-fudone]').forEach(b=>b.addEventListener('click',()=>toggleFollow(b.dataset.fudone)));
    body.querySelectorAll('[data-fudelete]').forEach(b=>b.addEventListener('click',()=>deleteFollow(b.dataset.fudelete)));
    $('sd037FuAdd')?.addEventListener('click',addFollow);
  }
  function addFollow(){const subject=String($('sd037FuSubject')?.value||'').trim(),note=String($('sd037FuNote')?.value||'').trim();if(!subject&&!note){alert('Add a customer / subject or note.');return}const db=followups(),rows=Array.isArray(db[currentRep])?db[currentRep]:[];rows.push({id:'fu-'+Date.now(),subject,type:$('sd037FuType')?.value||'Call',due:$('sd037FuDue')?.value||'',note,done:false,createdAt:new Date().toISOString()});db[currentRep]=rows;saveFollowups(db);renderDesk()}
  function toggleFollow(id){const db=followups(),rows=Array.isArray(db[currentRep])?db[currentRep]:[],r=rows.find(x=>x.id===id);if(r)r.done=!r.done;db[currentRep]=rows;saveFollowups(db);renderDesk()}
  function deleteFollow(id){const db=followups(),rows=Array.isArray(db[currentRep])?db[currentRep]:[];db[currentRep]=rows.filter(x=>x.id!==id);saveFollowups(db);renderDesk()}

  function markVersion(){const p=document.querySelector('header .pill');if(p)p.textContent=VERSION;document.title='RUNLU Deerfoot Flooring OS V0.3.37'}
  function boot(){injectStyle();ensureDeskPage();if(ensureLaunch()){const sel=$('sales033Rep');if(sel&&!sel.dataset.sd037){sel.dataset.sd037='1';sel.addEventListener('change',updateLaunch)}}markVersion()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  [250,750,1600].forEach(ms=>setTimeout(boot,ms));
  window.addEventListener('pageshow',boot);
  document.addEventListener('click',e=>{const p=e.target?.closest?.('button')?.dataset?.page;if(p==='sales')setTimeout(()=>{ensureLaunch();updateLaunch();markVersion()},0)},true);
  window.openRunluSalesDesk=openDesk;
})();