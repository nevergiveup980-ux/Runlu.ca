/* RUNLU Flooring OS Universal · U1 Sales / Jobs foundation
   Ported from proven workflow concepts, without Deerfoot names or staff defaults. */
(function(){
'use strict';
const JOB_STORE='runlu_flooring_universal_u1_jobs';
const TEAM_STORE='runlu_flooring_universal_u1_sales_team';
const WORKSPACE_STORE='runlu_flooring_universal_u0_workspace';
const $=id=>document.getElementById(id);
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch(_){return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const workspace=()=>read(WORKSPACE_STORE,null);
const tenant=()=>workspace()?.company?.organizationId||'';
const locationId=()=>workspace()?.location?.locationId||'';
const jobs=()=>read(JOB_STORE,[]).filter(j=>j.organizationId===tenant());
const team=()=>read(TEAM_STORE,[]).filter(r=>r.organizationId===tenant());
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function saveJobs(xs){const all=read(JOB_STORE,[]).filter(j=>j.organizationId!==tenant());write(JOB_STORE,[...all,...xs])}
function id(){return 'job-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function render(){
 const w=workspace(), host=$('universalSales'); if(!host)return;
 if(!w){host.innerHTML='<p>Create a company workspace first.</p>';return}
 const xs=jobs().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 host.innerHTML='<div class="card"><div class="statusLine"><div><h2>Sales / Jobs</h2><p class="muted">Tenant-owned Job records · '+esc(w.company.displayName||w.company.legalName)+'</p></div></div><div class="grid"><label>Customer<input id="uSalesCustomer" placeholder="Customer name"></label><label>Job / Order #<input id="uSalesNumber" placeholder="Optional"></label><label>Sales Rep<input id="uSalesRep" list="uSalesRepList" placeholder="Salesperson"><datalist id="uSalesRepList">'+team().map(r=>'<option value="'+esc(r.name)+'">').join('')+'</datalist></label><label>Status<select id="uSalesStatus"><option>Draft</option><option>In Progress</option><option>Completed</option><option>Archived</option></select></label></div><p><button class="primary" id="uSalesAdd">Create Job / Order</button></p></div><div class="card"><h3>Jobs / Orders</h3><div id="uSalesRows">'+(xs.length?xs.map(j=>'<div class="uJob"><div><b>'+esc(j.customerName||'Unnamed customer')+'</b><span>#'+esc(j.jobNumber||'—')+' · '+esc(j.salesRep||'Unassigned')+'</span></div><span>'+esc(j.status)+'</span></div>').join(''):'<p class="muted">No jobs yet for this company.</p>')+'</div></div>';
 $('uSalesAdd')?.addEventListener('click',()=>{
   const customer=$('uSalesCustomer').value.trim(); if(!customer)return alert('Enter a customer name.');
   const xs=jobs(); xs.push({id:id(),organizationId:tenant(),locationId:locationId(),customerName:customer,jobNumber:$('uSalesNumber').value.trim(),salesRep:$('uSalesRep').value.trim(),status:$('uSalesStatus').value,createdAt:new Date().toISOString()}); saveJobs(xs); render();
 });
}
window.RUNLUUniversalSales=Object.freeze({render,jobs});
})();