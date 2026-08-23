/* RUNLU Deerfoot Flooring OS · Sales Drill-down V0.1.1
   Converts Sales summary metrics into browseable detail views: Jobs, Customers, POs and Balance Due.
   Customer list is alphabetical; customer detail shows contact data, ownership, jobs, POs, sales and balance. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  let drillType='customers';
  let selectedCustomer='';
  function by(id){return document.getElementById(id)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function money(n){return '$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function getJobs(){try{return Array.isArray(jobs)?jobs:[]}catch(_){return []}}
  function getPOs(){try{return JSON.parse(localStorage.getItem(PO_STORE)||'[]')||[]}catch(_){return []}}
  function currentRep(){const t=(by('salesDetailTitle')?.textContent||'All Sales').replace(/ · Former$/,'').trim();return t==='All Sales'?'ALL':t}
  function visibleJobs(){
    const rep=currentRep(),from=by('salesFrom')?.value||'',to=by('salesTo')?.value||'';
    return getJobs().filter(j=>{
      if(j.status==='Cancelled')return false;
      const r=String(j.salesRep||'').trim()||'Unassigned';if(rep!=='ALL'&&r!==rep)return false;
      const d=String(j.date||j.invoiceDate||j.dateRequired||'').slice(0,10);if(from&&d&&d<from)return false;if(to&&d&&d>to)return false;if((from||to)&&!d)return false;return true;
    });
  }
  function calcJob(j){try{return typeof calc==='function'?calc(j):{subtotal:0,gst:0,total:0,balance:0}}catch(_){return {subtotal:0,gst:0,total:0,balance:0}}}
  function poForJob(j,p){return p.filter(x=>x.jobId===j.id||x.jobNumber===j.jobNumber)}

  function ensureDrillPage(){
    if(by('salesDrilldown'))return;
    const sales=by('sales');if(!sales)return;
    const section=document.createElement('section');section.id='salesDrilldown';section.className='page';
    section.innerHTML=`<div class="card"><div class="statusLine"><div><h2 id="drillTitle">Sales Details</h2><div id="drillSub" class="muted"></div></div><button class="action" id="drillBack">← Back to Sales</button></div><div id="drillBody" style="margin-top:14px"></div></div>`;
    sales.insertAdjacentElement('afterend',section);
    by('drillBack').onclick=()=>go('sales');
  }
  function openDrill(type){drillType=type;selectedCustomer='';ensureDrillPage();renderDrill();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='salesDrilldown'));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='sales'));window.scrollTo({top:0,behavior:'smooth'})}

  function customerMap(xs){
    const m=new Map();const allPO=getPOs();
    xs.forEach(j=>{const name=String(j.customerName||'Unnamed customer').trim();if(!m.has(name))m.set(name,{name,jobs:[],pos:[],sales:0,balance:0});const r=m.get(name),c=calcJob(j);r.jobs.push(j);r.sales+=Number(c.subtotal||0);r.balance+=Number(c.balance||0);poForJob(j,allPO).forEach(p=>{if(!r.pos.some(x=>x.poNumber===p.poNumber))r.pos.push(p)})});
    return [...m.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
  }
  function contactFrom(c){
    const js=c.jobs;const last=js[js.length-1]||{};let owner='';try{owner=typeof window.flooringCustomerOwner==='function'?window.flooringCustomerOwner(c.name):''}catch(_){ }return {address:last.soldToAddress||'',email:last.email||'',cell:last.cell||'',home:last.phoneHome||'',work:last.phoneWork||'',rep:owner||last.currentSalesRep||last.salesRep||'Unassigned'};
  }
  function renderCustomers(xs,balanceOnly){
    let cs=customerMap(xs);if(balanceOnly)cs=cs.filter(c=>c.balance>0.005);
    if(selectedCustomer){const c=cs.find(x=>x.name===selectedCustomer)||customerMap(xs).find(x=>x.name===selectedCustomer);if(c)return renderCustomerDetail(c)}
    return cs.length?`<div class="muted" style="margin-bottom:10px">${balanceOnly?'Customers with an outstanding balance':'Customers'} · alphabetical A–Z · tap a customer to view the complete record.</div><div style="display:grid;gap:9px">${cs.map(c=>`<button class="action salesCustomerDrill" data-customer="${esc(c.name)}" style="width:100%;display:flex;justify-content:space-between;text-align:left"><span><b>${esc(c.name)}</b><br><small>${c.jobs.length} Job${c.jobs.length===1?'':'s'} · ${c.pos.length} PO${c.pos.length===1?'':'s'}</small></span><span><b>${money(c.sales)}</b><br><small>${c.balance>0?money(c.balance)+' due':'No balance'}</small></span></button>`).join('')}</div>`:'<div class="muted">No customers in this selection.</div>';
  }
  function renderCustomerDetail(c){
    const ct=contactFrom(c);return `<div class="actions" style="margin-bottom:12px"><button class="action" id="customerListBack">← Customer List</button></div><div class="card" style="margin:0 0 12px"><h3>${esc(c.name)}</h3><div class="salesMiniSummary"><span><b>${c.jobs.length}</b> Jobs</span><span><b>${c.pos.length}</b> POs</span><span><b>${money(c.sales)}</b> Net Sales</span><span><b>${money(c.balance)}</b> Balance Due</span></div><div class="formgrid" style="margin-top:12px"><div><label>Current Sales Rep</label><div>${esc(ct.rep)}</div></div><div><label>Email</label><div>${esc(ct.email||'—')}</div></div><div><label>Cell</label><div>${esc(ct.cell||'—')}</div></div><div><label>Home / Work</label><div>${esc([ct.home,ct.work].filter(Boolean).join(' / ')||'—')}</div></div><div class="full"><label>Address</label><div>${esc(ct.address||'—')}</div></div></div></div><div class="card" style="margin:0 0 12px"><h3>Jobs / Orders</h3>${c.jobs.map(j=>{const m=calcJob(j);return `<button class="action customerJobOpen" data-job="${esc(j.id)}" style="width:100%;margin:5px 0;display:flex;justify-content:space-between;text-align:left"><span><b>#${esc(j.jobNumber||'—')}</b><br><small>${esc(j.status||'Draft')} · ${esc(j.dateRequired||j.date||'No date')}</small></span><span>${money(m.subtotal)}<br><small>${money(m.balance)} due</small></span></button>`}).join('')}</div><div class="card" style="margin:0"><h3>PO / Supplier Orders</h3>${c.pos.length?c.pos.map(p=>`<div class="jobRow"><div><b>#${esc(p.poNumber||'Draft')}</b><small>${esc(p.supplier||'Supplier not set')} · ${esc(p.status||'Draft')}</small></div></div>`).join(''):'<div class="muted">No linked POs.</div>'}</div>`;
  }
  function renderJobs(xs){return xs.length?`<div style="display:grid;gap:9px">${xs.slice().sort((a,b)=>String(a.customerName||'').localeCompare(String(b.customerName||''))).map(j=>{const m=calcJob(j);return `<button class="action drillJobOpen" data-job="${esc(j.id)}" style="width:100%;display:flex;justify-content:space-between;text-align:left"><span><b>${esc(j.customerName||'Unnamed')} · #${esc(j.jobNumber||'—')}</b><br><small>${esc(j.status||'Draft')} · ${esc(j.salesRep||'Unassigned')}</small></span><span><b>${money(m.subtotal)}</b><br><small>${money(m.balance)} due</small></span></button>`}).join('')}</div>`:'<div class="muted">No Jobs in this selection.</div>'}
  function renderPOs(xs){const all=getPOs(),ids=new Set(xs.map(j=>j.id)),nums=new Set(xs.map(j=>j.jobNumber));const ps=all.filter(p=>ids.has(p.jobId)||nums.has(p.jobNumber));return ps.length?`<div style="display:grid;gap:9px">${ps.slice().sort((a,b)=>String(a.poNumber||'').localeCompare(String(b.poNumber||''),undefined,{numeric:true})).map(p=>`<div class="jobRow"><div><b>#${esc(p.poNumber||'Draft')} · ${esc(p.supplier||'Supplier')}</b><small>Job #${esc(p.jobNumber||'—')} · ${esc(p.status||'Draft')} · Sales Rep ${esc(p.salesRep||'—')}</small></div></div>`).join('')}</div>`:'<div class="muted">No POs in this selection.</div>'}
  function renderDrill(){
    ensureDrillPage();const xs=visibleJobs(),rep=currentRep();const title={jobs:'Jobs / Orders',customers:'Customers',pos:'PO / Supplier Orders',balance:'Balance Due'}[drillType]||'Sales Details';by('drillTitle').textContent=(rep==='ALL'?'All Sales':rep)+' · '+title;by('drillSub').textContent='Uses the same salesperson and date filters as the Sales summary.';
    by('drillBody').innerHTML=drillType==='jobs'?renderJobs(xs):drillType==='pos'?renderPOs(xs):renderCustomers(xs,drillType==='balance');
    by('drillBody').querySelectorAll('.salesCustomerDrill').forEach(b=>b.onclick=()=>{selectedCustomer=b.dataset.customer;renderDrill()});
    by('customerListBack')?.addEventListener('click',()=>{selectedCustomer='';renderDrill()});
    by('drillBody').querySelectorAll('.drillJobOpen,.customerJobOpen').forEach(b=>b.onclick=()=>{if(typeof selectJob==='function')selectJob(b.dataset.job)});
  }
  function makeMetricButtons(){
    const box=by('salesRepSummary');if(box){[...box.children].forEach((el,i)=>{const types=['jobs','customers','pos','balance'];if(!types[i])return;el.style.cursor='pointer';el.setAttribute('role','button');el.setAttribute('tabindex','0');el.title='Tap for details';el.onclick=()=>openDrill(types[i]);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDrill(types[i])}}})}
    const customerCard=by('salesCustomerList')?.closest('.card');if(customerCard&&!customerCard.dataset.drill){customerCard.dataset.drill='1';customerCard.style.cursor='pointer';customerCard.title='Tap to open customer list';customerCard.addEventListener('click',e=>{if(e.target.closest('button,a,input,select'))return;openDrill('customers')})}
  }
  function install(){
    if(window.__runluSalesDrilldownV011)return;window.__runluSalesDrilldownV011=true;
    ensureDrillPage();makeMetricButtons();const old=window.renderSales;if(typeof old==='function'&&!old.__drillWrapped){const w=function(){const r=old.apply(this,arguments);setTimeout(makeMetricButtons,0);return r};w.__drillWrapped=true;window.renderSales=w}document.title='RUNLU Deerfoot Flooring OS V0.3.11';const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.11 Sales Drill-down';
  }
  function boot(){setTimeout(install,90);setTimeout(makeMetricButtons,250)}
  if(document.readyState==='loading')window.addEventListener('load',boot);else boot();
})();