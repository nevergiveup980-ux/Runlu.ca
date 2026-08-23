/* RUNLU Deerfoot Flooring OS · Sales Team Changes V0.1.1
   - DF is Deerfoot, not a salesperson: remove it from the sales roster.
   - Keep salesperson buttons alphabetically sorted.
   - Staff changes use Active / Inactive rather than deleting history.
   - Historical Jobs/POs remain attached to former salespeople. */
(function(){
  'use strict';
  const SETTINGS='runlu_deerfoot_sales_pricing_settings_v1';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const DEFAULT_REPS=['ARLIN','BILL','DANTE','JARROD','JASON','NICHOLE','PAUL G','RYAN','TONY'];

  function unique(xs){const out=[];xs.forEach(v=>{v=String(v||'').trim();if(v&&!out.some(x=>x.toLowerCase()===v.toLowerCase()))out.push(v)});return out}
  function alpha(a,b){return String(a).localeCompare(String(b),undefined,{sensitivity:'base'})}
  function readSettings(){
    let s=null;
    try{s=JSON.parse(localStorage.getItem(SETTINGS)||'null')}catch(_){s=null}
    if(!s||typeof s!=='object')s={};
    if(!Array.isArray(s.reps)||!s.reps.length)s.reps=[...DEFAULT_REPS];
    s.reps=s.reps.map(x=>String(x||'').trim()).filter(x=>x&&x.toUpperCase()!=='DF');
    if(!Array.isArray(s.inactiveReps))s.inactiveReps=[];
    s.inactiveReps=s.inactiveReps.map(x=>String(x||'').trim()).filter(x=>x&&x.toUpperCase()!=='DF');
    if(!s.profiles||typeof s.profiles!=='object')s.profiles={standard:'',contractor:'',repeat:'',referral:'',large:'',employee:10,custom:''};
    s.reps=unique(s.reps).sort(alpha);
    s.inactiveReps=unique(s.inactiveReps).sort(alpha);
    localStorage.setItem(SETTINGS,JSON.stringify(s));
    return s;
  }
  function esc2(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function allKnownReps(){
    const s=readSettings(),out=[...s.reps,...s.inactiveReps];
    const push=v=>{v=String(v||'').trim();if(v&&v.toUpperCase()!=='DF'&&!out.some(x=>x.toLowerCase()===v.toLowerCase()))out.push(v)};
    try{if(typeof jobs!=='undefined')(jobs||[]).forEach(j=>push(j.salesRep))}catch(_){ }
    try{(JSON.parse(localStorage.getItem(PO_STORE)||'[]')||[]).forEach(p=>push(p.salesRep))}catch(_){ }
    return unique(out).sort(alpha);
  }
  function isInactive(name){const s=readSettings();return s.inactiveReps.some(x=>x.toLowerCase()===String(name||'').toLowerCase())}

  /* Run before sales-v010 initializes so the roster no longer seeds DF. */
  readSettings();

  function sortAndFilterTopButtons(){
    const box=document.getElementById('salesRepButtons');if(!box)return;
    const buttons=[...box.querySelectorAll('.salesRepBtn')];if(!buttons.length)return;
    const all=buttons.find(b=>(b.dataset.rep||'')==='ALL');
    const rest=buttons.filter(b=>b!==all).sort((a,b)=>alpha(a.textContent.trim(),b.textContent.trim()));
    rest.forEach(b=>{
      const name=(b.dataset.rep||b.textContent||'').trim();
      b.style.display=(name.toUpperCase()==='DF'||isInactive(name))?'none':'';
      box.appendChild(b);
    });
    if(all)box.insertBefore(all,box.firstChild);
  }

  function filterJobSalesRepList(){
    const dl=document.getElementById('salesRepList');if(!dl)return;
    [...dl.querySelectorAll('option')].forEach(o=>{const n=(o.value||'').trim();if(n.toUpperCase()==='DF'||isInactive(n))o.remove()});
  }

  function findOldTeamCard(){const chips=document.getElementById('salesTeamChips');return chips?.closest('.card')||null}
  function ensureTeamChangeCard(){
    if(document.getElementById('salesTeamChangeCard'))return;
    const old=findOldTeamCard();if(!old)return;
    old.style.display='none';
    const card=document.createElement('div');card.id='salesTeamChangeCard';card.className='card salesTeamChangeCard';
    card.innerHTML=`
      <div class="statusLine"><div><h3>Sales Team Changes</h3><div class="muted">Add new salespeople, mark departures or transfers Inactive, and preserve all historical sales under the original salesperson.</div></div><span class="tag">History Preserved</span></div>
      <div class="salesTeamChangeAdd"><input id="salesTeamChangeName" placeholder="Salesperson name / code"><button class="action primary" id="salesTeamChangeAddBtn">Add / Reactivate</button></div>
      <div class="salesTeamChangeGrid"><div><h4>Active Salespeople</h4><div id="salesTeamActiveList"></div></div><div><h4>Inactive / Former</h4><div id="salesTeamInactiveList"></div></div></div>
      <div class="muted salesTeamChangeNote">Inactive does not delete the person or move old Jobs/POs. It only removes that salesperson from current-entry choices and the main Sales buttons. Historical reports remain available.</div>`;
    old.insertAdjacentElement('afterend',card);
    document.getElementById('salesTeamChangeAddBtn')?.addEventListener('click',addOrReactivate);
    document.getElementById('salesTeamChangeName')?.addEventListener('keydown',e=>{if(e.key==='Enter')addOrReactivate()});
    renderTeamChangeCard();
  }

  function activeReps(){const s=readSettings(),inactive=new Set(s.inactiveReps.map(x=>x.toLowerCase()));return allKnownReps().filter(n=>!inactive.has(n.toLowerCase())&&n.toUpperCase()!=='DF').sort(alpha)}
  function inactiveReps(){const s=readSettings();return s.inactiveReps.filter(n=>n.toUpperCase()!=='DF').sort(alpha)}
  function renderTeamChangeCard(){
    const a=document.getElementById('salesTeamActiveList'),i=document.getElementById('salesTeamInactiveList');if(!a||!i)return;
    const active=activeReps(),inactive=inactiveReps();
    a.innerHTML=active.length?active.map(n=>`<div class="salesTeamChangeRow"><b>${esc2(n)}</b><button class="action" data-inactivate="${esc2(n)}">Mark Inactive</button></div>`).join(''):'<div class="muted">No active salespeople.</div>';
    i.innerHTML=inactive.length?inactive.map(n=>`<div class="salesTeamChangeRow"><b>${esc2(n)}</b><div class="actions"><button class="action" data-history="${esc2(n)}">View History</button><button class="action primary" data-reactivate="${esc2(n)}">Reactivate</button></div></div>`).join(''):'<div class="muted">No inactive / former salespeople.</div>';
    a.querySelectorAll('[data-inactivate]').forEach(b=>b.addEventListener('click',()=>markInactive(b.dataset.inactivate)));
    i.querySelectorAll('[data-reactivate]').forEach(b=>b.addEventListener('click',()=>reactivate(b.dataset.reactivate)));
    i.querySelectorAll('[data-history]').forEach(b=>b.addEventListener('click',()=>viewHistory(b.dataset.history)));
  }

  function addOrReactivate(){const input=document.getElementById('salesTeamChangeName'),name=String(input?.value||'').trim();if(!name)return;if(name.toUpperCase()==='DF'){alert('DF is the Deerfoot company abbreviation, not a salesperson.');return}reactivate(name);if(input)input.value=''}
  function reactivate(name){
    const s=readSettings(),low=String(name).toLowerCase();
    s.inactiveReps=s.inactiveReps.filter(x=>x.toLowerCase()!==low);
    if(!s.reps.some(x=>x.toLowerCase()===low))s.reps.push(name);
    s.reps=unique(s.reps).sort(alpha);localStorage.setItem(SETTINGS,JSON.stringify(s));refreshAfterTeamChange();
  }
  function markInactive(name){
    if(!confirm('Mark '+name+' as Inactive? Historical Jobs, POs and sales totals will be preserved.'))return;
    const s=readSettings(),low=String(name).toLowerCase();
    s.reps=s.reps.filter(x=>x.toLowerCase()!==low);
    if(!s.inactiveReps.some(x=>x.toLowerCase()===low))s.inactiveReps.push(name);
    s.inactiveReps=unique(s.inactiveReps).sort(alpha);localStorage.setItem(SETTINGS,JSON.stringify(s));refreshAfterTeamChange();
  }
  function viewHistory(name){
    const btn=[...document.querySelectorAll('#salesRepButtons .salesRepBtn')].find(b=>String(b.dataset.rep||'').toLowerCase()===String(name).toLowerCase());
    if(btn){btn.click();return}
    alert('Historical records for '+name+' will appear when Jobs or POs exist for that salesperson.');
  }
  function refreshAfterTeamChange(){
    try{if(typeof renderSales==='function')renderSales()}catch(_){ }
    setTimeout(()=>{sortAndFilterTopButtons();filterJobSalesRepList();ensureTeamChangeCard();renderTeamChangeCard()},30);
  }

  function enhance(){
    ensureTeamChangeCard();sortAndFilterTopButtons();filterJobSalesRepList();renderTeamChangeCard();
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.7 Sales Team + Pricing';
    document.title='RUNLU Deerfoot Flooring OS V0.3.7';
    const target=document.getElementById('sales')||document.body;
    const obs=new MutationObserver(()=>{sortAndFilterTopButtons();filterJobSalesRepList();if(!document.getElementById('salesTeamChangeCard'))ensureTeamChangeCard()});
    obs.observe(target,{childList:true,subtree:true});
  }
  window.addEventListener('load',()=>setTimeout(enhance,240));
})();