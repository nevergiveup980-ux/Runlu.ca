/* RUNLU Deerfoot Flooring OS · Showroom V0.1
   Deerfoot-first, local-storage prototype. No warehouse production DB writes. */
(function(){
  const SHOW_STORE='runlu_deerfoot_showroom_samples_v1';
  const EST='runlu_deerfoot_estimate_v01';
  const ZONES=['Carpet','Hardwood','Vinyl / LVP','Laminate','Tile','Sample Desk'];
  let showroomSamples=[];
  let editingSampleId=null;
  let checkoutSampleId=null;

  const DEMO_SAMPLES=[
    {id:'DF-DEMO-001',isDemo:true,type:'Carpet',supplier:'Demo Supplier',style:'Soft Texture',colour:'Sand',location:'Carpet',status:'On Display',price:'',notes:'Demo showroom record. Replace with a real Deerfoot sample.'},
    {id:'DF-DEMO-002',isDemo:true,type:'Carpet',supplier:'Demo Supplier',style:'Pattern Loop',colour:'Stone',location:'Carpet',status:'On Display',price:'',notes:'Demo showroom record.'},
    {id:'DF-DEMO-003',isDemo:true,type:'Hardwood',supplier:'Demo Supplier',style:'Oak Select',colour:'Natural',location:'Hardwood',status:'On Display',price:'',notes:'Demo showroom record.'},
    {id:'DF-DEMO-004',isDemo:true,type:'Vinyl / LVP',supplier:'Demo Supplier',style:'Wide Plank',colour:'Driftwood',location:'Vinyl / LVP',status:'Checked Out',price:'',checkedOutTo:'Demo Customer',checkedOutPhone:'',dueDate:'',notes:'Demo checkout record.'},
    {id:'DF-DEMO-005',isDemo:true,type:'Laminate',supplier:'Demo Supplier',style:'Classic Plank',colour:'Walnut',location:'Laminate',status:'On Display',price:'',notes:'Demo showroom record.'},
    {id:'DF-DEMO-006',isDemo:true,type:'Tile',supplier:'Demo Supplier',style:'Porcelain',colour:'Warm Grey',location:'Tile',status:'Replace',price:'',notes:'Demo attention record.'}
  ];

  function e(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function a(v){return e(v).replace(/"/g,'&quot;')}
  function by(id){return document.getElementById(id)}
  function saveShowroom(){localStorage.setItem(SHOW_STORE,JSON.stringify(showroomSamples))}
  function loadShowroomData(){try{showroomSamples=JSON.parse(localStorage.getItem(SHOW_STORE)||'[]')}catch(_){showroomSamples=[]}if(!showroomSamples.length){showroomSamples=JSON.parse(JSON.stringify(DEMO_SAMPLES));saveShowroom()}}
  function statusClass(s){return s==='Checked Out'?'out':(['Missing','Discontinued','Replace'].includes(s)?'attn':'')}
  function stats(){
    const on=showroomSamples.filter(x=>x.status==='On Display').length;
    const out=showroomSamples.filter(x=>x.status==='Checked Out').length;
    const attn=showroomSamples.filter(x=>['Missing','Discontinued','Replace'].includes(x.status)).length;
    if(by('showOnDisplay'))by('showOnDisplay').textContent=on;
    if(by('showCheckedOut'))by('showCheckedOut').textContent=out;
    if(by('showAttention'))by('showAttention').textContent=attn;
    if(by('showTotal'))by('showTotal').textContent=showroomSamples.length;
  }
  function renderZones(){
    const el=by('showroomMap');if(!el)return;
    el.innerHTML=ZONES.map(z=>{const xs=showroomSamples.filter(x=>x.location===z);const out=xs.filter(x=>x.status==='Checked Out').length;return `<button class="zoneCard" onclick="showroomFilterZone('${a(z)}')"><strong>${e(z)}</strong><small>${out?out+' checked out':'Tap to filter samples'}</small><div class="zoneCount">${xs.length}</div></button>`}).join('');
  }
  function filtered(){
    const q=(by('showSearch')?.value||'').trim().toLowerCase(),st=by('showStatusFilter')?.value||'',zone=by('showZoneFilter')?.value||'';
    return showroomSamples.filter(x=>(!st||x.status===st)&&(!zone||x.location===zone)&&(!q||[x.id,x.type,x.supplier,x.style,x.colour,x.location,x.checkedOutTo].some(v=>String(v||'').toLowerCase().includes(q))));
  }
  function renderSamples(){
    stats();renderZones();const el=by('showroomSampleList');if(!el)return;const xs=filtered();
    el.innerHTML=xs.length?xs.map(x=>`<div class="sampleRow"><div><b>${x.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${e(x.style||'Unnamed sample')} · ${e(x.colour||'')}</b><small>${e(x.id)} · ${e(x.type||'')} · ${e(x.supplier||'Supplier not set')}</small></div><div><b>${e(x.location||'No location')}</b><small>${x.status==='Checked Out'?'With '+e(x.checkedOutTo||'customer'):'Showroom location'}</small></div><div><span class="sampleStatus ${statusClass(x.status)}">${e(x.status||'On Display')}</span>${x.dueDate?`<small>Due ${e(x.dueDate)}</small>`:''}</div><div><small>${x.price?('$'+e(x.price)):'Price not set'}</small></div><div class="sampleActions"><button class="action" onclick="editShowroomSample('${a(x.id)}')">Edit</button><button class="action" onclick="selectCheckoutSample('${a(x.id)}')">${x.status==='Checked Out'?'Return':'Checkout'}</button><button class="action blue" onclick="estimateFromSample('${a(x.id)}')">Estimate</button></div></div>`).join(''):'<div class="muted">No showroom samples match this filter.</div>';
  }
  window.showroomFilterZone=function(z){if(by('showZoneFilter'))by('showZoneFilter').value=z;renderSamples()}
  window.renderShowroom=renderSamples;

  function clearEditor(){editingSampleId=null;['showSampleId','showType','showSupplier','showStyle','showColour','showLocation','showPrice','showNotes'].forEach(id=>{const el=by(id);if(el)el.value=''});if(by('showSampleStatus'))by('showSampleStatus').value='On Display';if(by('showEditorTitle'))by('showEditorTitle').textContent='Add Showroom Sample'}
  window.newShowroomSample=function(){clearEditor();by('showSampleId')?.focus()}
  window.editShowroomSample=function(id){const x=showroomSamples.find(s=>s.id===id);if(!x)return;editingSampleId=id;const vals={showSampleId:x.id,showType:x.type,showSupplier:x.supplier,showStyle:x.style,showColour:x.colour,showLocation:x.location,showSampleStatus:x.status,showPrice:x.price,showNotes:x.notes};Object.entries(vals).forEach(([k,v])=>{if(by(k))by(k).value=v||''});if(by('showEditorTitle'))by('showEditorTitle').textContent=(x.isDemo?'DEMO · ':'')+'Edit '+x.id;by('showSampleId')?.scrollIntoView({behavior:'smooth',block:'center'})}
  window.saveShowroomSample=function(){
    const id=(by('showSampleId')?.value||'').trim()||('S-'+Date.now());
    const rec={id,type:(by('showType')?.value||'').trim(),supplier:(by('showSupplier')?.value||'').trim(),style:(by('showStyle')?.value||'').trim(),colour:(by('showColour')?.value||'').trim(),location:by('showLocation')?.value||'Sample Desk',status:by('showSampleStatus')?.value||'On Display',price:(by('showPrice')?.value||'').trim(),notes:(by('showNotes')?.value||'').trim()};
    if(editingSampleId){const i=showroomSamples.findIndex(x=>x.id===editingSampleId);if(i>=0){rec.isDemo=!!showroomSamples[i].isDemo;rec.checkedOutTo=showroomSamples[i].checkedOutTo||'';rec.checkedOutPhone=showroomSamples[i].checkedOutPhone||'';rec.dueDate=showroomSamples[i].dueDate||'';showroomSamples[i]=rec}}else{if(showroomSamples.some(x=>x.id===id)){alert('That Sample ID already exists.');return}rec.isDemo=false;showroomSamples.unshift(rec)}
    saveShowroom();clearEditor();renderSamples();alert('Showroom sample saved on this device.');
  }

  window.selectCheckoutSample=function(id){const x=showroomSamples.find(s=>s.id===id);if(!x)return;checkoutSampleId=id;if(by('checkoutSelected'))by('checkoutSelected').innerHTML=`<b>${x.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${e(x.style)} · ${e(x.colour)}</b><br>${e(x.id)} · ${e(x.location)} · ${e(x.status)}`;if(by('checkoutCustomer'))by('checkoutCustomer').value=x.checkedOutTo||'';if(by('checkoutPhone'))by('checkoutPhone').value=x.checkedOutPhone||'';if(by('checkoutDue'))by('checkoutDue').value=x.dueDate||'';if(by('checkoutAction'))by('checkoutAction').textContent=x.status==='Checked Out'?'Return Sample':'Checkout Sample';by('checkoutSelected')?.scrollIntoView({behavior:'smooth',block:'center'})}
  window.checkoutOrReturn=function(){const x=showroomSamples.find(s=>s.id===checkoutSampleId);if(!x){alert('Choose a sample first.');return}if(x.status==='Checked Out'){x.status='On Display';x.checkedOutTo='';x.checkedOutPhone='';x.dueDate=''}else{const customer=(by('checkoutCustomer')?.value||'').trim();if(!customer){alert('Enter the customer name for checkout.');return}x.status='Checked Out';x.checkedOutTo=customer;x.checkedOutPhone=(by('checkoutPhone')?.value||'').trim();x.dueDate=by('checkoutDue')?.value||''}saveShowroom();renderSamples();selectCheckoutSample(x.id)}

  window.estimateFromSample=function(id){const x=showroomSamples.find(s=>s.id===id);if(!x)return;const draft={p0_0:'A',p0_1:'',p0_2:'Showroom',p0_3:x.style||'',p0_4:x.colour||'',p0_5:x.price||'',p0_6:'',notes:`Showroom sample ${x.id}${x.supplier?' · '+x.supplier:''}${x.location?' · '+x.location:''}`,showroomSampleId:x.id,showroomSupplier:x.supplier||'',showroomLocation:x.location||''};localStorage.setItem(EST,JSON.stringify(draft));const f=by('estimateFrame');if(f)f.src='estimate-assessment.html?sample='+encodeURIComponent(x.id)+'&t='+Date.now();go('estimate')}
  window.openEstimateFull=function(){window.open('estimate-assessment.html','_blank')}

  function prepareSelects(){
    const z=by('showZoneFilter'),loc=by('showLocation');if(z)z.innerHTML='<option value="">All zones</option>'+ZONES.map(x=>`<option>${e(x)}</option>`).join('');if(loc)loc.innerHTML=ZONES.map(x=>`<option>${e(x)}</option>`).join('');
  }

  try{if(!NAV.some(x=>x[0]==='showroom'))NAV.splice(1,0,['showroom','Showroom'],['estimate','Estimate'])}catch(_){ }
  const baseGo=go;
  go=function(id){baseGo(id);if(id==='showroom')renderSamples();if(id==='estimate'){const f=by('estimateFrame');if(f&&!f.src)f.src='estimate-assessment.html'}};

  window.addEventListener('message',ev=>{if(ev.origin!==location.origin)return;if(ev.data?.type==='runlu-estimate-job-created'){load();go('jobs')}});
  window.addEventListener('load',()=>{loadShowroomData();prepareSelects();renderSamples();['showSearch','showStatusFilter','showZoneFilter'].forEach(id=>by(id)?.addEventListener(id==='showSearch'?'input':'change',renderSamples))});
})();
