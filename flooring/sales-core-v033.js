/* RUNLU Deerfoot Flooring OS · Sales Core V0.3.33
   Stable Sales workspace restored without loading the legacy Sales bundle at startup.
   Reads/writes only the existing browser-local Job and sales-team stores during validation.
*/
(function(){
  'use strict';
  if(window.__runluSalesCore033)return;
  window.__runluSalesCore033=true;

  const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
  const SALES_STORE='runlu_deerfoot_sales_pricing_settings_v1';
  const VERSION='V0.3.33 Sales Core Restored';
  const DEFAULT_REPS=['ARLIN','BILL','DANTE','JARROD','JASON','NICHOLE','PAUL G','RYAN','TONY'];
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
  const money=v=>'$'+num(v).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
  const alpha=(a,b)=>String(a).localeCompare(String(b),undefined,{sensitivity:'base'});

  function today(){const d=new Date(),off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,10)}
  function monthStart(){return today().slice(0,8)+'01'}
  function readJobs(){try{const x=JSON.parse(localStorage.getItem(JOB_STORE)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
  function writeJobs(xs){localStorage.setItem(JOB_STORE,JSON.stringify(xs))}
  function activeId(){return localStorage.getItem(ACTIVE_STORE)||''}
  function dateOf(j){return String(j?.date||j?.invoiceDate||j?.dateRequired||'').slice(0,10)}
  function qty(v){const m=String(v??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);const n=m?Number(m[0]):0;return Number.isFinite(n)&&n>0?n:0}
  function itemCost(x){if(x?.costTotal!==undefined&&x.costTotal!==null&&String(x.costTotal)!=='')return num(x.costTotal);const q=qty(x?.qty),c=num(x?.cost);return q&&c?q*c:0}
  function metrics(j){
    const itemSales=(j.items||[]).reduce((s,x)=>s+num(x.total),0),delivery=num(j.deliveryCharge),net=itemSales+delivery,tax=Math.round(net*.05*100)/100,gross=net+tax,cost=(j.items||[]).reduce((s,x)=>s+itemCost(x),0),sold=(j.items||[]).filter(x=>num(x.total)>0),missing=sold.filter(x=>itemCost(x)<=0).length,profit=net-cost,balance=Math.max(0,gross-num(j.depositPaid));
    return {net,tax,gross,cost,profit,margin:net?profit/net*100:0,missing,balance};
  }
  function repOf(j){return String(j?.salesRep||'').trim()||'Unassigned'}

  function cleanNames(xs){const out=[];(xs||[]).forEach(v=>{const s=String(v||'').trim();if(s&&s.toUpperCase()!=='DF'&&!out.some(x=>x.toLowerCase()===s.toLowerCase()))out.push(s)});return out.sort(alpha)}
  function readTeam(){
    let saved={};try{saved=JSON.parse(localStorage.getItem(SALES_STORE)||'{}')||{}}catch(_){ }
    const reps=cleanNames(Array.isArray(saved.reps)&&saved.reps.length?saved.reps:DEFAULT_REPS),inactive=cleanNames(saved.inactiveReps||[]);
    return {...saved,reps,inactiveReps:inactive,profiles:saved.profiles||{standard:'',contractor:'',repeat:'',referral:'',large:'',employee:10,custom:''}};
  }
  function writeTeam(s){localStorage.setItem(SALES_STORE,JSON.stringify(s))}
  function allKnownReps(){const team=readTeam(),found=[...team.reps,...team.inactiveReps];readJobs().forEach(j=>{const r=String(j.salesRep||'').trim();if(r&&!found.some(x=>x.toLowerCase()===r.toLowerCase()))found.push(r)});return cleanNames(found)}
  function activeReps(){const t=readTeam(),off=new Set(t.inactiveReps.map(x=>x.toLowerCase()));return allKnownReps().filter(x=>!off.has(x.toLowerCase()))}

  function injectStyle(){
    if($('salesCoreStyle033'))return;
    const s=document.createElement('style');s.id='salesCoreStyle033';s.textContent=`
      .sales033Hero{background:linear-gradient(135deg,#173d30,#285f4b);color:#fff}.sales033Hero .muted{color:rgba(255,255,255,.76)}
      .sales033Filters{display:grid;grid-template-columns:1fr 1fr 1.2fr auto auto;gap:9px;align-items:end;margin-top:12px}.sales033Filters label{color:inherit}.sales033Stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:11px 0}.sales033Stats .stat b{font-size:20px}
      .sales033Grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:11px}.sales033TableWrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.sales033Table{width:100%;border-collapse:collapse;min-width:760px;font-size:12px}.sales033Table th,.sales033Table td{padding:9px 8px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}.sales033Table th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.sales033Link{border:0;background:transparent;padding:0;color:var(--blue);font-weight:800;text-align:left}.sales033Table small{display:block;color:var(--muted);margin-top:3px}.sales033Demo{font-size:9px;background:#fff1d4;color:#7c5100;border-radius:999px;padding:3px 5px;font-weight:900;margin-right:4px}
      .sales033RepGrid{display:grid;gap:8px}.sales033RepRow,.sales033CustomerRow,.sales033TeamRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}.sales033RepRow:first-child,.sales033CustomerRow:first-child,.sales033TeamRow:first-child{border-top:0}.sales033RepRow small,.sales033CustomerRow small{display:block;color:var(--muted);margin-top:2px}.sales033TeamGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sales033TeamAdd{display:flex;gap:8px;margin:10px 0}.sales033TeamAdd input{flex:1}.sales033Empty{padding:15px 0;color:var(--muted)}
      @media(max-width:1100px){.sales033Stats{grid-template-columns:repeat(3,minmax(0,1fr))}.sales033Grid{grid-template-columns:1fr}}
      @media(max-width:700px){.sales033Filters{grid-template-columns:1fr 1fr}.sales033Filters .sales033RepFilter{grid-column:1/-1}.sales033Stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sales033TeamGrid{grid-template-columns:1fr}.sales033TeamAdd{flex-direction:column}.sales033RepRow,.sales033CustomerRow{grid-template-columns:1fr}.sales033RepRow>div:last-child,.sales033CustomerRow>div:last-child{text-align:left!important}}
    `;document.head.appendChild(s);
  }

  function markVersion(){const p=document.querySelector('header .pill');if(p)p.textContent=VERSION;document.title='RUNLU Deerfoot Flooring OS V0.3.33'}

  function ensureNav(){
    const nav=$('nav');if(!nav)return;
    let b=nav.querySelector('[data-page="sales"]');
    if(!b){b=document.createElement('button');b.type='button';b.dataset.page='sales';b.textContent='Sales';const cmd=nav.querySelector('[data-page="command"]');cmd?.insertAdjacentElement('afterend',b)||nav.prepend(b)}
  }
  function ensureCommandModule(){
    const grid=$('command')?.querySelector('.grid3');if(!grid||$('salesModule033'))return;
    const b=document.createElement('button');b.id='salesModule033';b.className='module';b.innerHTML='<span class="ico">📈</span><strong>Sales</strong><small>Sales reps, customers, Jobs, written sales, cost, gross profit and margin.</small>';b.addEventListener('click',openSales);
    const jobsBtn=[...grid.querySelectorAll('.module')].find(x=>x.textContent.includes('Jobs & Orders'));jobsBtn?grid.insertBefore(b,jobsBtn):grid.prepend(b);
  }

  function ensurePage(){
    let sec=$('sales');if(sec&&sec.dataset.salesCore033)return sec;
    if(sec&&!sec.dataset.salesCore033)return sec;
    sec=document.createElement('section');sec.id='sales';sec.className='page';sec.dataset.salesCore033='1';sec.innerHTML=`
      <div class="card sales033Hero"><div class="statusLine"><div><h2>Sales</h2><div class="muted">Sales Rep → Customer → Job / Order → PO → Written Sales → Cost → Gross Profit.</div></div><span class="tag">Core Module</span></div>
        <div class="sales033Filters"><div><label>From</label><input id="sales033From" type="date" value="${monthStart()}"></div><div><label>To</label><input id="sales033To" type="date" value="${today()}"></div><div class="sales033RepFilter"><label>Sales Rep</label><select id="sales033Rep"></select></div><button class="action" id="sales033Month">Month to Date</button><button class="action" id="sales033All">All Dates</button></div>
        <div class="actions"><button class="action primary" id="sales033NewJob">+ New Job / Order</button><button class="action" id="sales033Refresh">Refresh Sales</button></div>
      </div>
      <div class="sales033Stats"><div class="stat"><b id="sales033Gross">$0</b><span>Gross / Written Sales</span></div><div class="stat"><b id="sales033Tax">$0</b><span>Tax</span></div><div class="stat"><b id="sales033Net">$0</b><span>Net Sales</span></div><div class="stat"><b id="sales033Cost">$0</b><span>Known Cost</span></div><div class="stat"><b id="sales033Profit">$0</b><span>Gross Profit</span></div><div class="stat"><b id="sales033Margin">0%</b><span>Gross Margin</span></div></div>
      <div class="sales033Grid"><div class="card"><div class="statusLine"><div><h3>Sales Jobs / Orders</h3><div id="sales033Completeness" class="muted"></div></div></div><div id="sales033Jobs"></div></div><div><div class="card"><h3>Salesperson Summary</h3><div id="sales033RepSummary" class="sales033RepGrid"></div></div><div class="card"><h3>Customers</h3><div id="sales033Customers"></div></div></div></div>
      <div class="card"><div class="statusLine"><div><h3>Sales Team</h3><div class="muted">Add, reactivate or mark a salesperson inactive without changing historical Jobs and totals.</div></div><span class="tag">History Preserved</span></div><div class="sales033TeamAdd"><input id="sales033NewRep" placeholder="Salesperson name / code"><button class="action primary" id="sales033AddRep">Add / Reactivate</button></div><div class="sales033TeamGrid"><div><h4>Active Salespeople</h4><div id="sales033ActiveTeam"></div></div><div><h4>Inactive / Former</h4><div id="sales033InactiveTeam"></div></div></div></div>`;
    const command=$('command');command?.insertAdjacentElement('afterend',sec)||document.querySelector('main')?.appendChild(sec);
    $('sales033From')?.addEventListener('change',renderSales);$('sales033To')?.addEventListener('change',renderSales);$('sales033Rep')?.addEventListener('change',renderSales);
    $('sales033Month')?.addEventListener('click',()=>{$('sales033From').value=monthStart();$('sales033To').value=today();renderSales()});
    $('sales033All')?.addEventListener('click',()=>{$('sales033From').value='';$('sales033To').value='';renderSales()});
    $('sales033Refresh')?.addEventListener('click',renderSales);$('sales033NewJob')?.addEventListener('click',()=>{if(typeof window.newJob==='function')window.newJob();if(typeof window.go==='function')window.go('jobs')});
    $('sales033AddRep')?.addEventListener('click',addRep);$('sales033NewRep')?.addEventListener('keydown',e=>{if(e.key==='Enter')addRep()});
    return sec;
  }

  function filterJobs(){
    const from=$('sales033From')?.value||'',to=$('sales033To')?.value||'',rep=$('sales033Rep')?.value||'ALL';return readJobs().filter(j=>j.status!=='Cancelled').filter(j=>{const d=dateOf(j);if(from&&(!d||d<from))return false;if(to&&(!d||d>to))return false;if(rep!=='ALL'&&repOf(j)!==rep)return false;return true});
  }
  function renderRepFilter(){const el=$('sales033Rep');if(!el)return;const current=el.value||'ALL',all=allKnownReps();el.innerHTML='<option value="ALL">All Sales</option>'+all.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');el.value=all.includes(current)||current==='ALL'?current:'ALL'}
  function renderSales(){
    ensurePage();ensureJobSalesRepField();renderRepFilter();const xs=filterJobs();let gross=0,tax=0,net=0,cost=0,profit=0,missing=0;xs.forEach(j=>{const m=metrics(j);gross+=m.gross;tax+=m.tax;net+=m.net;cost+=m.cost;profit+=m.profit;missing+=m.missing});
    $('sales033Gross').textContent=money(gross).replace('.00','');$('sales033Tax').textContent=money(tax).replace('.00','');$('sales033Net').textContent=money(net).replace('.00','');$('sales033Cost').textContent=money(cost).replace('.00','');$('sales033Profit').textContent=missing?'Pending':money(profit).replace('.00','');$('sales033Margin').textContent=missing?'Pending':(net?(profit/net*100).toFixed(1)+'%':'0%');$('sales033Completeness').textContent=missing?missing+' sold item line(s) still need Cost / Unit':'Cost data complete for sold item lines';
    renderJobs(xs);renderRepSummary(xs);renderCustomers(xs);renderTeam();markVersion();
  }
  function renderJobs(xs){
    const el=$('sales033Jobs');if(!el)return;if(!xs.length){el.innerHTML='<div class="sales033Empty">No matching sales records for this period.</div>';return}
    el.innerHTML=`<div class="sales033TableWrap"><table class="sales033Table"><thead><tr><th>Sales Rep</th><th>Customer / Job</th><th>Date</th><th>Net Sales</th><th>Cost</th><th>Gross Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody>${xs.map(j=>{const m=metrics(j);return `<tr><td><b>${esc(repOf(j))}</b></td><td><button class="sales033Link" data-job="${esc(j.id||'')}">${j.isDemo?'<span class="sales033Demo">DEMO</span>':''}${esc(j.customerName||'Unnamed customer')}</button><small>#${esc(j.jobNumber||'—')}</small></td><td>${esc(dateOf(j)||'—')}</td><td>${money(m.net)}</td><td>${m.missing?money(m.cost)+'*':money(m.cost)}</td><td>${m.missing?'Pending':money(m.profit)}</td><td>${m.missing?'—':m.margin.toFixed(1)+'%'}</td><td>${esc(j.status||'Draft')}</td></tr>`}).join('')}</tbody></table></div>`;
    el.querySelectorAll('[data-job]').forEach(b=>b.addEventListener('click',()=>openJob(b.dataset.job)));
  }
  function renderRepSummary(xs){
    const el=$('sales033RepSummary');if(!el)return;const map=new Map();xs.forEach(j=>{const r=repOf(j),m=metrics(j);if(!map.has(r))map.set(r,{jobs:0,net:0,cost:0,profit:0,missing:0});const z=map.get(r);z.jobs++;z.net+=m.net;z.cost+=m.cost;z.profit+=m.profit;z.missing+=m.missing});const rows=[...map.entries()].sort((a,b)=>b[1].net-a[1].net);el.innerHTML=rows.length?rows.map(([r,z])=>`<div class="sales033RepRow"><div><b>${esc(r)}</b><small>${z.jobs} Job${z.jobs===1?'':'s'} · ${z.missing?z.missing+' cost line(s) pending':'cost complete'}</small></div><div style="text-align:right"><b>${money(z.net)}</b><small>${z.missing?'Profit pending':money(z.profit)+' GP'}</small></div></div>`).join(''):'<div class="sales033Empty">No salesperson totals.</div>';
  }
  function renderCustomers(xs){
    const el=$('sales033Customers');if(!el)return;const map=new Map();xs.forEach(j=>{const n=String(j.customerName||'Unnamed customer').trim(),m=metrics(j);if(!map.has(n))map.set(n,{jobs:0,net:0,balance:0});const z=map.get(n);z.jobs++;z.net+=m.net;z.balance+=m.balance});const rows=[...map.entries()].sort((a,b)=>b[1].net-a[1].net);el.innerHTML=rows.length?rows.map(([n,z])=>`<div class="sales033CustomerRow"><div><b>${esc(n)}</b><small>${z.jobs} Job${z.jobs===1?'':'s'}</small></div><div style="text-align:right"><b>${money(z.net)}</b><small>${z.balance?money(z.balance)+' due':'Paid / no balance'}</small></div></div>`).join(''):'<div class="sales033Empty">No customers in this selection.</div>';
  }
  function renderTeam(){
    const t=readTeam(),active=activeReps(),off=[...t.inactiveReps].sort(alpha),a=$('sales033ActiveTeam'),i=$('sales033InactiveTeam');if(a)a.innerHTML=active.length?active.map(r=>`<div class="sales033TeamRow"><b>${esc(r)}</b><button class="action" data-off="${esc(r)}">Mark Inactive</button></div>`).join(''):'<div class="muted">No active salespeople.</div>';if(i)i.innerHTML=off.length?off.map(r=>`<div class="sales033TeamRow"><b>${esc(r)}</b><button class="action primary" data-on="${esc(r)}">Reactivate</button></div>`).join(''):'<div class="muted">No inactive / former salespeople.</div>';a?.querySelectorAll('[data-off]').forEach(b=>b.addEventListener('click',()=>setInactive(b.dataset.off,true)));i?.querySelectorAll('[data-on]').forEach(b=>b.addEventListener('click',()=>setInactive(b.dataset.on,false)));refreshSalesRepList();
  }
  function addRep(){const input=$('sales033NewRep'),name=String(input?.value||'').trim();if(!name)return;if(name.toUpperCase()==='DF'){alert('DF is the Deerfoot company abbreviation, not a salesperson.');return}const t=readTeam(),low=name.toLowerCase();t.inactiveReps=t.inactiveReps.filter(x=>x.toLowerCase()!==low);if(!t.reps.some(x=>x.toLowerCase()===low))t.reps.push(name);t.reps=cleanNames(t.reps);writeTeam(t);if(input)input.value='';renderSales()}
  function setInactive(name,off){const t=readTeam(),low=String(name).toLowerCase();if(off){if(!confirm('Mark '+name+' as Inactive? Historical Jobs and sales totals will remain unchanged.'))return;t.reps=t.reps.filter(x=>x.toLowerCase()!==low);if(!t.inactiveReps.some(x=>x.toLowerCase()===low))t.inactiveReps.push(name)}else{t.inactiveReps=t.inactiveReps.filter(x=>x.toLowerCase()!==low);if(!t.reps.some(x=>x.toLowerCase()===low))t.reps.push(name)}t.reps=cleanNames(t.reps);t.inactiveReps=cleanNames(t.inactiveReps);writeTeam(t);renderSales()}

  function openJob(id){if(typeof window.selectJob==='function'){window.selectJob(id);return}localStorage.setItem(ACTIVE_STORE,id);if(typeof window.go==='function')window.go('jobs')}
  function ensureJobSalesRepField(){
    if($('salesRep')){refreshSalesRepList();fillJobSalesRep();return}
    const clerk=$('clerk');if(!clerk)return;const wrap=document.createElement('div');wrap.innerHTML='<label>Sales Rep</label><input id="salesRep" list="salesRepList033" placeholder="Select or type salesperson"><datalist id="salesRepList033"></datalist>';clerk.parentElement?.insertAdjacentElement('afterend',wrap);$('salesRep')?.addEventListener('change',saveJobSalesRep);$('salesRep')?.addEventListener('blur',saveJobSalesRep);refreshSalesRepList();fillJobSalesRep();
  }
  function refreshSalesRepList(){const dl=$('salesRepList033')||$('salesRepList');if(dl)dl.innerHTML=activeReps().map(r=>`<option value="${esc(r)}"></option>`).join('')}
  function fillJobSalesRep(){const input=$('salesRep');if(!input)return;let j=null;try{if(typeof window.active==='function')j=window.active()}catch(_){ }if(!j){const id=activeId();j=readJobs().find(x=>x.id===id)}input.value=j?.salesRep||''}
  function saveJobSalesRep(){const input=$('salesRep');if(!input)return;const value=input.value.trim();let done=false;try{if(typeof window.active==='function'){const j=window.active();if(j){j.salesRep=value;if(typeof window.saveStore==='function')window.saveStore();done=true}}}catch(_){ }if(!done){const id=activeId(),xs=readJobs(),j=xs.find(x=>x.id===id);if(j){j.salesRep=value;writeJobs(xs)}}}

  function openSales(){ensurePage();renderSales();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='sales'));document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='sales'));try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}}

  function bindRouting(){
    document.addEventListener('click',ev=>{const b=ev.target?.closest?.('#nav button[data-page="sales"]');if(b){ev.preventDefault();ev.stopPropagation();if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();openSales();return}const jobBtn=ev.target?.closest?.('#nav button[data-page="jobs"]');if(jobBtn)setTimeout(()=>{ensureJobSalesRepField();fillJobSalesRep()},30)},true);
  }
  function boot(){injectStyle();ensureNav();ensureCommandModule();ensurePage();ensureJobSalesRepField();bindRouting();markVersion();window.runluOpenSales=openSales;window.renderSalesCore033=renderSales}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',()=>{ensureNav();ensureCommandModule();ensureJobSalesRepField();markVersion()});
})();
