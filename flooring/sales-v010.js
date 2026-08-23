/* RUNLU Deerfoot Flooring OS · Sales + Pricing V0.2
   Dedicated Sales workspace, rep-based reporting, configurable markup profiles,
   order-level pricing overrides, and history-safe Sales Team changes.
   Current Job data remains browser-local during validation. */
(function(){
  'use strict';
  const SALES_SETTINGS='runlu_deerfoot_sales_pricing_settings_v1';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const REPORT_REPS=['ARLIN','BILL','DANTE','JARROD','JASON','NICHOLE','PAUL G','RYAN','TONY'];
  const PROFILE_DEFS=[
    ['standard','Standard / Regular'],
    ['contractor','Contractor'],
    ['repeat','Repeat Customer'],
    ['referral','Referral / Friend'],
    ['large','Large Order / Volume'],
    ['employee','Employee'],
    ['custom','Custom Override']
  ];
  let selectedRep='ALL';
  let settings=loadSettings();

  function alpha(a,b){return String(a).localeCompare(String(b),undefined,{sensitivity:'base'})}
  function uniqueNames(xs){const out=[];(xs||[]).forEach(v=>{const s=String(v||'').trim();if(s&&s.toUpperCase()!=='DF'&&!out.some(x=>x.toLowerCase()===s.toLowerCase()))out.push(s)});return out}
  function loadSettings(){
    const base={
      reps:[...REPORT_REPS],
      inactiveReps:[],
      profiles:{standard:'',contractor:'',repeat:'',referral:'',large:'',employee:10,custom:''}
    };
    try{
      const saved=JSON.parse(localStorage.getItem(SALES_SETTINGS)||'null');
      if(saved&&typeof saved==='object'){
        if(Array.isArray(saved.reps)&&saved.reps.length)base.reps=saved.reps;
        if(Array.isArray(saved.inactiveReps))base.inactiveReps=saved.inactiveReps;
        if(saved.profiles&&typeof saved.profiles==='object')base.profiles={...base.profiles,...saved.profiles};
      }
    }catch(_){ }
    base.reps=uniqueNames(base.reps).sort(alpha);
    base.inactiveReps=uniqueNames(base.inactiveReps).sort(alpha);
    localStorage.setItem(SALES_SETTINGS,JSON.stringify(base));
    return base;
  }
  function saveSettings(){settings.reps=uniqueNames(settings.reps).sort(alpha);settings.inactiveReps=uniqueNames(settings.inactiveReps).sort(alpha);localStorage.setItem(SALES_SETTINGS,JSON.stringify(settings))}
  function html(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function money2(n){return typeof money==='function'?money(n):'$'+Number(n||0).toFixed(2)}
  function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
  function qtyNumber(v){const m=String(v??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);const n=m?Number(m[0]):NaN;return Number.isFinite(n)&&n>0?n:null}
  function pct(v){const n=Number(v);return Number.isFinite(n)?n:null}
  function profileOptions(selected){return PROFILE_DEFS.map(([id,label])=>`<option value="${id}" ${id===(selected||'standard')?'selected':''}>${label}</option>`).join('')}
  function itemCost(x){
    if(x.costTotal!==undefined&&x.costTotal!==null&&String(x.costTotal)!=='')return num(x.costTotal);
    const q=qtyNumber(x.qty);return q&&num(x.cost)>0?q*num(x.cost):0;
  }
  function jobMetrics(j){
    const c=typeof calc==='function'?calc(j):{subtotal:0,gst:0,total:0,balance:0};
    const revenueItems=(j.items||[]).filter(x=>num(x.total)>0);
    const cost=(j.items||[]).reduce((s,x)=>s+itemCost(x),0);
    const missingCost=revenueItems.filter(x=>itemCost(x)<=0).length;
    const profit=c.subtotal-cost;
    return {netSales:c.subtotal,tax:c.gst,grossSales:c.total,cost,profit,margin:c.subtotal>0?profit/c.subtotal*100:0,missingCost,balance:c.balance};
  }
  function jobRep(j){return String(j?.salesRep||'').trim()||'Unassigned'}
  function poRecords(){try{return JSON.parse(localStorage.getItem(PO_STORE)||'[]')||[]}catch(_){return []}}
  function poForJob(j,all){return all.filter(p=>p.jobId===j.id||(!p.jobId&&p.jobNumber&&p.jobNumber===j.jobNumber)||p.jobNumber===j.jobNumber)}
  function dateOf(j){return String(j?.date||j?.invoiceDate||j?.dateRequired||'').slice(0,10)}
  function todayLocal(){const d=new Date(),off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,10)}
  function monthStart(){const t=todayLocal();return t.slice(0,8)+'01'}
  function inactiveSet(){return new Set((settings.inactiveReps||[]).map(x=>x.toLowerCase()))}

  function ensureSalesSection(){
    if(document.getElementById('sales'))return;
    const command=document.getElementById('command');if(!command)return;
    const section=document.createElement('section');section.id='sales';section.className='page';
    section.innerHTML=`
      <div class="card salesHero">
        <div class="statusLine"><div><h2>Sales</h2><div class="muted">Sales Rep → Customers → Jobs → POs → Written Sales → Cost → Gross Profit.</div></div><span class="tag">V0.2 Sales + Pricing</span></div>
        <div id="salesRepButtons" class="salesRepButtons"></div>
        <div class="salesFilters"><div><label>From</label><input id="salesFrom" type="date" value="${monthStart()}"></div><div><label>To</label><input id="salesTo" type="date" value="${todayLocal()}"></div><button class="action" id="salesThisMonth">Month to Date</button><button class="action" id="salesAllDates">All Dates</button></div>
      </div>
      <div class="salesStats">
        <div class="stat"><b id="salesGross">$0</b><span>Gross / Written Sales</span></div>
        <div class="stat"><b id="salesTax">$0</b><span>Tax</span></div>
        <div class="stat"><b id="salesNet">$0</b><span>Net Sales</span></div>
        <div class="stat"><b id="salesCost">$0</b><span>Known Cost</span></div>
        <div class="stat"><b id="salesProfit">$0</b><span>Gross Profit</span></div>
        <div class="stat"><b id="salesMargin">0%</b><span>Gross Margin</span></div>
      </div>
      <div class="grid2">
        <div class="card"><div class="statusLine"><h3 id="salesDetailTitle">All Sales</h3><span id="salesCompleteness" class="muted"></span></div><div id="salesRepSummary" class="salesMiniSummary"></div><div id="salesJobTable"></div></div>
        <div class="card"><h3>Customers</h3><div class="muted">Customer list is derived from the selected salesperson's Job / Order history.</div><div id="salesCustomerList" class="salesCustomerList"></div></div>
      </div>
      <div class="card"><div class="statusLine"><div><h3>Pricing Profiles</h3><div class="muted">Company defaults are suggestions. A salesperson may override a specific order; the applied rule and reason remain with the item.</div></div><button class="action primary" id="savePricingProfiles">Save Pricing Settings</button></div>
        <div class="pricingProfileGrid" id="pricingProfileGrid"></div>
        <div class="salesPricingNote"><b>Employee:</b> initialized as Cost × 110% = 10% markup from the historical practice described for Deerfoot. It remains editable. Other percentages are intentionally blank until the real company rules are known.</div>
      </div>
      <div class="card" id="salesTeamChangeCard"><div class="statusLine"><div><h3>Sales Team Changes</h3><div class="muted">Add new salespeople or mark departures / transfers Inactive without breaking historical Jobs, POs or sales reports.</div></div><span class="tag">History Preserved</span></div>
        <div class="salesTeamEditor"><input id="salesNewRep" placeholder="Salesperson name / code"><button class="action primary" id="salesAddRep">Add / Reactivate</button></div>
        <div class="salesTeamChangeGrid"><div><h4>Active Salespeople</h4><div id="salesActiveTeam"></div></div><div><h4>Inactive / Former</h4><div id="salesInactiveTeam"></div></div></div>
        <div class="muted" style="margin-top:10px">Inactive removes a person from current sales-entry choices and the top Sales buttons only. Their historical customers, Jobs, POs and totals remain unchanged.</div>
      </div>`;
    command.insertAdjacentElement('afterend',section);
    document.getElementById('salesFrom')?.addEventListener('change',renderSales);
    document.getElementById('salesTo')?.addEventListener('change',renderSales);
    document.getElementById('salesThisMonth')?.addEventListener('click',()=>{by('salesFrom').value=monthStart();by('salesTo').value=todayLocal();renderSales()});
    document.getElementById('salesAllDates')?.addEventListener('click',()=>{by('salesFrom').value='';by('salesTo').value='';renderSales()});
    document.getElementById('savePricingProfiles')?.addEventListener('click',saveProfileInputs);
    document.getElementById('salesAddRep')?.addEventListener('click',addRepFromInput);
    document.getElementById('salesNewRep')?.addEventListener('keydown',e=>{if(e.key==='Enter')addRepFromInput()});
  }
  function by(id){return document.getElementById(id)}

  function collectReps(){
    const found=[];
    const push=v=>{const s=String(v||'').trim();if(s&&s.toUpperCase()!=='DF'&&!found.some(x=>x.toLowerCase()===s.toLowerCase()))found.push(s)};
    settings.reps.forEach(push);settings.inactiveReps.forEach(push);
    try{(jobs||[]).forEach(j=>push(j.salesRep))}catch(_){ }
    poRecords().forEach(p=>push(p.salesRep));
    return found.sort(alpha);
  }
  function activeReps(){const inactive=inactiveSet();return collectReps().filter(r=>!inactive.has(r.toLowerCase())).sort(alpha)}
  function renderRepButtons(){
    const el=by('salesRepButtons');if(!el)return;
    const reps=activeReps();
    const inactiveSelected=selectedRep!=='ALL'&&inactiveSet().has(String(selectedRep).toLowerCase());
    el.innerHTML=[`<button class="salesRepBtn ${selectedRep==='ALL'?'active':''}" data-rep="ALL">All Sales</button>`,...reps.map(r=>`<button class="salesRepBtn ${selectedRep===r?'active':''}" data-rep="${html(r)}">${html(r)}</button>`),...(inactiveSelected?[`<button class="salesRepBtn active" data-rep="${html(selectedRep)}">${html(selectedRep)} · Former</button>`]:[])].join('');
    el.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{selectedRep=btn.dataset.rep||'ALL';renderSales()}));
  }
  function inRange(j){const d=dateOf(j),from=by('salesFrom')?.value||'',to=by('salesTo')?.value||'';if(!d)return !from&&!to;if(from&&d<from)return false;if(to&&d>to)return false;return true}
  function filteredJobs(){try{return (jobs||[]).filter(j=>j.status!=='Cancelled'&&inRange(j)&&(selectedRep==='ALL'||jobRep(j)===selectedRep))}catch(_){return []}}
  function renderSales(){
    ensureSalesSection();syncJobSalesRepDatalist();renderRepButtons();renderProfileInputs();renderTeamManagement();
    const xs=filteredJobs(),allPO=poRecords();
    const totals=xs.reduce((a,j)=>{const m=jobMetrics(j);a.gross+=m.grossSales;a.tax+=m.tax;a.net+=m.netSales;a.cost+=m.cost;a.profit+=m.profit;a.missing+=m.missingCost;a.po+=poForJob(j,allPO).filter(p=>p.status!=='Cancelled').length;return a},{gross:0,tax:0,net:0,cost:0,profit:0,missing:0,po:0});
    by('salesGross').textContent=money2(totals.gross).replace('.00','');
    by('salesTax').textContent=money2(totals.tax).replace('.00','');
    by('salesNet').textContent=money2(totals.net).replace('.00','');
    by('salesCost').textContent=money2(totals.cost).replace('.00','');
    by('salesProfit').textContent=totals.missing?'Pending':money2(totals.profit).replace('.00','');
    by('salesMargin').textContent=totals.missing?'Pending':(totals.net?((totals.profit/totals.net)*100).toFixed(1)+'%':'0%');
    by('salesDetailTitle').textContent=selectedRep==='ALL'?'All Sales':selectedRep+(inactiveSet().has(String(selectedRep).toLowerCase())?' · Former':'');
    by('salesCompleteness').textContent=totals.missing?`${totals.missing} sold item line(s) still need cost`:'Cost data complete for sold item lines';
    const customers=[...new Set(xs.map(j=>String(j.customerName||'').trim()).filter(Boolean))];
    by('salesRepSummary').innerHTML=`<span><b>${xs.length}</b> Jobs</span><span><b>${customers.length}</b> Customers</span><span><b>${totals.po}</b> POs</span><span><b>${money2(xs.reduce((s,j)=>s+jobMetrics(j).balance,0)).replace('.00','')}</b> Balance Due</span>`;
    renderJobTable(xs,allPO);renderCustomerList(xs);
  }
  function renderJobTable(xs,allPO){
    const el=by('salesJobTable');if(!el)return;
    if(!xs.length){el.innerHTML='<div class="muted salesEmpty">No matching sales records for this period.</div>';return}
    el.innerHTML=`<div class="salesTableWrap"><table class="salesTable"><thead><tr><th>Sales Rep</th><th>Customer / Job</th><th>PO</th><th>Net Sales</th><th>Cost</th><th>Gross Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody>${xs.map(j=>{const m=jobMetrics(j),pos=poForJob(j,allPO).filter(p=>p.status!=='Cancelled'),profit=m.missingCost?'Pending':money2(m.profit),margin=m.missingCost?'—':m.margin.toFixed(1)+'%';return `<tr><td><b>${html(jobRep(j))}</b></td><td><button class="salesLink" data-job="${html(j.id)}">${html(j.customerName||'Unnamed')}</button><small>#${html(j.jobNumber||'—')} · ${html(dateOf(j)||'No date')}</small></td><td>${pos.length?pos.map(p=>html(p.poNumber?'#'+p.poNumber:'Draft')).join(', '):'—'}</td><td>${money2(m.netSales)}</td><td>${m.missingCost?money2(m.cost)+'*':money2(m.cost)}</td><td>${profit}</td><td>${margin}</td><td>${html(j.status||'Draft')}</td></tr>`}).join('')}</tbody></table></div>`;
    el.querySelectorAll('.salesLink').forEach(btn=>btn.addEventListener('click',()=>{if(typeof selectJob==='function')selectJob(btn.dataset.job)}));
  }
  function renderCustomerList(xs){
    const el=by('salesCustomerList');if(!el)return;
    const map=new Map();xs.forEach(j=>{const name=String(j.customerName||'Unnamed customer').trim();if(!map.has(name))map.set(name,{jobs:0,sales:0,balance:0});const r=map.get(name),m=jobMetrics(j);r.jobs++;r.sales+=m.netSales;r.balance+=m.balance});
    const rows=[...map.entries()].sort((a,b)=>b[1].sales-a[1].sales);
    el.innerHTML=rows.length?rows.map(([name,r])=>`<div class="salesCustomerRow"><div><b>${html(name)}</b><small>${r.jobs} Job${r.jobs===1?'':'s'}</small></div><div><b>${money2(r.sales)}</b><small>${r.balance>0?money2(r.balance)+' due':'Paid / no balance'}</small></div></div>`).join(''):'<div class="muted salesEmpty">No customers in this selection.</div>';
  }

  function renderProfileInputs(){
    const el=by('pricingProfileGrid');if(!el)return;
    el.innerHTML=PROFILE_DEFS.filter(([id])=>id!=='custom').map(([id,label])=>`<div><label>${label}</label><div class="pricingPct"><input id="priceProfile_${id}" inputmode="decimal" type="number" min="-100" step="0.1" value="${html(settings.profiles[id]??'')}" placeholder="Set %"><span>% markup</span></div>${id==='employee'?'<small>10% markup = Cost × 110%</small>':'<small>Leave blank if no company default is known.</small>'}</div>`).join('');
  }
  function saveProfileInputs(){
    PROFILE_DEFS.filter(([id])=>id!=='custom').forEach(([id])=>{const raw=by('priceProfile_'+id)?.value??'';settings.profiles[id]=raw===''?'':Number(raw)});saveSettings();alert('Pricing profiles saved on this device.');renderItemsEditorSafe();
  }
  function renderTeamManagement(){
    const active=by('salesActiveTeam'),inactive=by('salesInactiveTeam');if(!active||!inactive)return;
    const a=activeReps(),i=[...settings.inactiveReps].sort(alpha);
    active.innerHTML=a.length?a.map(r=>`<div class="salesTeamChangeRow"><b>${html(r)}</b><button class="action" data-inactive="${html(r)}">Mark Inactive</button></div>`).join(''):'<div class="muted">No active salespeople.</div>';
    inactive.innerHTML=i.length?i.map(r=>`<div class="salesTeamChangeRow"><b>${html(r)}</b><div class="actions"><button class="action" data-history="${html(r)}">View History</button><button class="action primary" data-reactivate="${html(r)}">Reactivate</button></div></div>`).join(''):'<div class="muted">No inactive / former salespeople.</div>';
    active.querySelectorAll('[data-inactive]').forEach(b=>b.addEventListener('click',()=>markRepInactive(b.dataset.inactive)));
    inactive.querySelectorAll('[data-reactivate]').forEach(b=>b.addEventListener('click',()=>reactivateRep(b.dataset.reactivate)));
    inactive.querySelectorAll('[data-history]').forEach(b=>b.addEventListener('click',()=>{selectedRep=b.dataset.history;renderSales()}));
  }
  function addRepFromInput(){const input=by('salesNewRep'),name=String(input?.value||'').trim();if(!name)return;if(name.toUpperCase()==='DF'){alert('DF is the Deerfoot company abbreviation, not a salesperson.');return}reactivateRep(name);if(input)input.value=''}
  function reactivateRep(name){const low=String(name).toLowerCase();settings.inactiveReps=settings.inactiveReps.filter(x=>x.toLowerCase()!==low);if(!settings.reps.some(x=>x.toLowerCase()===low))settings.reps.push(name);saveSettings();renderSales();syncJobSalesRepDatalist()}
  function markRepInactive(name){if(!confirm('Mark '+name+' as Inactive? Historical Jobs, POs and sales totals will be preserved.'))return;const low=String(name).toLowerCase();settings.reps=settings.reps.filter(x=>x.toLowerCase()!==low);if(!settings.inactiveReps.some(x=>x.toLowerCase()===low))settings.inactiveReps.push(name);saveSettings();if(selectedRep===name)selectedRep='ALL';renderSales();syncJobSalesRepDatalist()}

  function ensureJobSalesRepField(){
    if(by('salesRep'))return;
    const clerk=by('clerk');if(!clerk)return;
    const div=document.createElement('div');div.innerHTML='<label>Sales Rep</label><input id="salesRep" list="salesRepList" placeholder="Select or type salesperson"><datalist id="salesRepList"></datalist>';
    clerk.parentElement.insertAdjacentElement('afterend',div);syncJobSalesRepDatalist();
  }
  function syncJobSalesRepDatalist(){const dl=by('salesRepList');if(dl)dl.innerHTML=activeReps().map(r=>`<option value="${html(r)}"></option>`).join('')}

  function normalizedItem(x){
    const y=x||{};if(!y.pricingProfile)y.pricingProfile='standard';
    if(y.markupPct===undefined||y.markupPct===null||y.markupPct===''){const d=settings.profiles[y.pricingProfile];if(d!==''&&d!==undefined)y.markupPct=Number(d)}
    if(y.defaultMarkupPct===undefined||y.defaultMarkupPct===null||y.defaultMarkupPct===''){const d=settings.profiles[y.pricingProfile];y.defaultMarkupPct=d===''?'':d}
    if(y.cost===undefined)y.cost='';if(y.costTotal===undefined)y.costTotal='';if(y.overrideReason===undefined)y.overrideReason='';return y;
  }
  function autoCalcLine(i,from){
    const x=normalizedItem(editingItems[i]);if(!x)return;
    const q=qtyNumber(x.qty),cost=num(x.cost),markup=pct(x.markupPct);
    if(cost>0&&markup!==null&&from!=='price'){x.price=Number((cost*(1+markup/100)).toFixed(2))}
    if(q&&cost>0&&from!=='costTotal')x.costTotal=Number((q*cost).toFixed(2));
    if(q&&num(x.price)>0&&from!=='total')x.total=Number((q*num(x.price)).toFixed(2));
    const def=pct(x.defaultMarkupPct),applied=pct(x.markupPct);x.pricingOverride=def!==null&&applied!==null&&Math.abs(def-applied)>.0001;
  }
  function renderItemsEditorSafe(){try{if(typeof renderItemsEditor==='function')renderItemsEditor()}catch(_){}}

  function installPricingEditor(){
    window.renderItemsEditor=function(){
      const el=by('itemsEditor');if(!el)return;
      el.innerHTML=editingItems.length?editingItems.map((raw,i)=>{const x=normalizedItem(raw);return `<div class="itemRow salesPriceItem">
        <div><label>Qty</label><input value="${html(x.qty||'')}" oninput="editItem(${i},'qty',this.value)"></div>
        <div><label>Size</label><input value="${html(x.size||'')}" oninput="editItem(${i},'size',this.value)"></div>
        <div class="wide"><label>Style</label><input value="${html(x.style||'')}" oninput="editItem(${i},'style',this.value)"></div>
        <div><label>Colour</label><input value="${html(x.colour||'')}" oninput="editItem(${i},'colour',this.value)"></div>
        <div><label>Supplier</label><input value="${html(x.supplier||'')}" oninput="editItem(${i},'supplier',this.value)"></div>
        <div><label>Cost / Unit</label><input type="number" step=".01" value="${html(x.cost??'')}" oninput="editPricingItem(${i},'cost',this.value)"></div>
        <div><label>Cost Total</label><input type="number" step=".01" value="${html(x.costTotal??'')}" oninput="editPricingItem(${i},'costTotal',this.value)"></div>
        <div><label>Pricing Profile</label><select onchange="applyPricingProfile(${i},this.value)">${profileOptions(x.pricingProfile)}</select></div>
        <div><label>Markup %</label><input type="number" step=".1" value="${html(x.markupPct??'')}" oninput="editPricingItem(${i},'markupPct',this.value)"></div>
        <div><label>Selling / Unit</label><input type="number" step=".01" value="${num(x.price)}" oninput="editPricingItem(${i},'price',this.value)"></div>
        <div><label>Line Total</label><input type="number" step=".01" value="${num(x.total)}" oninput="editPricingItem(${i},'total',this.value)"></div>
        <div class="wide"><label>Price Override Reason</label><input value="${html(x.overrideReason||'')}" placeholder="e.g. contractor / repeat / large order" oninput="editPricingItem(${i},'overrideReason',this.value)"></div>
        <button class="action red" onclick="removeItem(${i})">×</button>
      </div>`}).join(''):'<div class="muted">No item lines yet.</div>';
    };
    window.editItem=function(i,k,v){const x=normalizedItem(editingItems[i]);if(!x)return;x[k]=v;if(k==='qty'){autoCalcLine(i,'qty');renderItemsEditor()} };
    window.editPricingItem=function(i,k,v){const x=normalizedItem(editingItems[i]);if(!x)return;if(['cost','costTotal','markupPct','price','total'].includes(k))x[k]=v===''?'':Number(v);else x[k]=v;if(k==='price'&&num(x.cost)>0)x.markupPct=Number(((num(x.price)/num(x.cost)-1)*100).toFixed(2));autoCalcLine(i,k);if(!['overrideReason','total','costTotal'].includes(k))renderItemsEditor()};
    window.applyPricingProfile=function(i,id){const x=normalizedItem(editingItems[i]);if(!x)return;x.pricingProfile=id;const d=settings.profiles[id];x.defaultMarkupPct=d===''?'':Number(d);if(id!=='custom'&&d!=='')x.markupPct=Number(d);if(id==='custom')x.overrideReason=x.overrideReason||'Custom pricing';autoCalcLine(i,'profile');renderItemsEditor()};
    const oldAdd=window.addItem;
    window.addItem=function(){if(typeof oldAdd==='function')oldAdd();const x=editingItems[editingItems.length-1];if(x){x.pricingProfile='standard';const d=settings.profiles.standard;x.defaultMarkupPct=d===''?'':Number(d);x.markupPct=d===''?'':Number(d);x.cost='';x.costTotal='';x.overrideReason='';renderItemsEditor()}};
  }

  function installHooks(){
    ensureSalesSection();ensureJobSalesRepField();installPricingEditor();
    const nav=by('nav');if(nav&&!nav.querySelector('[data-page="sales"]')){
      const btn=document.createElement('button');btn.dataset.page='sales';btn.textContent='Sales';btn.onclick=()=>go('sales');const first=nav.querySelector('button');first?first.insertAdjacentElement('afterend',btn):nav.appendChild(btn);
    }
    const oldGo=window.go;window.go=function(id){if(id==='sales'){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='sales'));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='sales'));renderSales();window.scrollTo({top:0,behavior:'smooth'});return}return oldGo(id)};
    const oldLoadEditor=window.loadEditor;window.loadEditor=function(){oldLoadEditor();ensureJobSalesRepField();const j=typeof active==='function'?active():null;if(by('salesRep'))by('salesRep').value=j?.salesRep||'';try{editingItems=(editingItems||[]).map(normalizedItem);renderItemsEditor()}catch(_){}};
    const oldSaveJob=window.saveJob;window.saveJob=function(){const j=typeof active==='function'?active():null;if(j&&by('salesRep'))j.salesRep=by('salesRep').value.trim();oldSaveJob();renderSales()};
    const oldNewPO=window.newPODraft;if(typeof oldNewPO==='function')window.newPODraft=function(){oldNewPO();const j=typeof active==='function'?active():null,el=by('poSalesRep');if(el&&!el.value&&j?.salesRep)el.value=j.salesRep};
    document.title='RUNLU Deerfoot Flooring OS V0.3.7';const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.7 Sales Team + Pricing';
    renderSales();
  }
  window.renderSales=renderSales;
  window.addEventListener('load',()=>setTimeout(installHooks,120));
})();