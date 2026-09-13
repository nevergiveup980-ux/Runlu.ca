(function(){
'use strict';
const calcV114=window.calculate;
const renderJobV114=window.renderJob;
const COPILOT_KEY='runluSalesCopilotV115';
const SMART_KEY='runluSmartContextV114';
let cp115=loadCP115();

function E15(id){return document.getElementById(id)}
function esc15(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c))}
function F15(x,d=0){return Number(x||0).toLocaleString(undefined,{maximumFractionDigits:d})}
function loadCP115(){try{return JSON.parse(localStorage.getItem(COPILOT_KEY)||'null')||{plan:'',job:'',skip:{},checked:{}}}catch(e){return{plan:'',job:'',skip:{},checked:{}}}}
function saveCP115(){try{localStorage.setItem(COPILOT_KEY,JSON.stringify(cp115))}catch(e){}}
function smartCtx115(){try{return JSON.parse(localStorage.getItem(SMART_KEY)||'null')||{}}catch(e){return{}}}
function task(k,label,target,req=false,kind='calc'){return{k,label,target,req,kind}}
const PLANS115={
  carpet_stretch:{label:'Carpet · Stretch-in',main:'carpet',tasks:[task('main','Carpet quantity + cut plan','carpet',true),task('underlay','Pad / underlay quantity','underlay',true),task('prep','Subfloor prep check','floorprep',false)]},
  carpet_glue:{label:'Carpet · Direct glue',main:'carpet',tasks:[task('main','Carpet quantity + cut plan','carpet',true),task('adhesive','Adhesive quantity','adhesive',true),task('prep','Subfloor prep check','floorprep',false)]},
  sheet:{label:'Sheet Vinyl / Linoleum',main:'sheetgoods',tasks:[task('main','Sheet goods + seam / weld plan','sheetgoods',true),task('adhesive','Adhesive quantity','adhesive',true),task('prep','Subfloor prep check','floorprep',false)]},
  lvp_attached:{label:'Plank / LVP · Attached pad',main:'plank',tasks:[task('main','Plank / LVP + box quantity','plank',true),task('prep','Subfloor prep check','floorprep',false),task('base','Wall base check','plank',false),task('transition','Transitions check','plank',false)]},
  lvp_underlay:{label:'Plank / LVP · Separate underlay',main:'plank',tasks:[task('main','Plank / LVP + box quantity','plank',true),task('underlay','Underlay quantity','underlay',true),task('prep','Subfloor prep check','floorprep',false),task('base','Wall base check','plank',false),task('transition','Transitions check','plank',false)]},
  tile:{label:'Tile',main:'plank',tasks:[task('main','Tile + box quantity','plank',true),task('prep','Subfloor prep check','floorprep',false),task('mortar','Mortar / thinset confirmed','manual',true,'manual'),task('grout','Grout confirmed','manual',true,'manual'),task('base','Wall base / trim check','plank',false),task('transition','Transitions check','plank',false)]}
};

function hasType115(q){q=String(q).toLowerCase();return (jobItems||[]).some(it=>String(it.type||'').toLowerCase()===q)}
function hasTitle115(q){q=String(q).toLowerCase();return (jobItems||[]).some(it=>String(it.title||'').toLowerCase().includes(q))}
function hasKey115(q){q=String(q).toLowerCase();return (jobItems||[]).some(it=>(it.totals||[]).some(t=>String(t.key||'').toLowerCase().includes(q)))}
function done115(k){
  if(cp115.skip?.[k])return true;
  if(k==='main'){
    if(cp115.plan==='carpet_stretch'||cp115.plan==='carpet_glue')return hasType115('carpet')||hasTitle115('carpet');
    if(cp115.plan==='sheet')return hasType115('sheetgoods')||hasTitle115('sheet vinyl')||hasTitle115('linoleum');
    if(cp115.plan==='tile')return hasTitle115('tile');
    if(cp115.plan==='lvp_attached'||cp115.plan==='lvp_underlay')return hasTitle115('plank')||hasTitle115('lvp')||hasTitle115('laminate');
  }
  if(k==='underlay')return hasType115('underlay')||hasTitle115('underlay');
  if(k==='adhesive')return hasType115('adhesive')||hasTitle115('adhesive');
  if(k==='prep')return hasType115('floorprep')||hasTitle115('primer')||hasTitle115('leveler')||hasTitle115('patch')||hasTitle115('moisture');
  if(k==='base')return hasKey115('wall base');
  if(k==='transition')return hasKey115('transition');
  if(k==='mortar'||k==='grout')return !!cp115.checked?.[k];
  return false;
}
function area115(){
  const s=smartCtx115();if(Number(s.area)>0)return Number(s.area);
  if(typeof dim==='function'){const a=dim('Lft','Lin')*dim('Wft','Win');if(a>0)return a}
  return 0;
}
function plan115(){return PLANS115[cp115.plan]||null}
function nextTask115(includeOptional=true){
  const p=plan115();if(!p)return null;
  let x=p.tasks.find(t=>t.req&&!done115(t.k));
  if(x)return x;
  return includeOptional?p.tasks.find(t=>!t.req&&!done115(t.k)):null;
}
function progress115(){
  const p=plan115();if(!p)return{done:0,total:0,requiredDone:0,requiredTotal:0};
  const active=p.tasks.filter(t=>!cp115.skip?.[t.k]);
  const required=active.filter(t=>t.req);
  return{done:active.filter(t=>done115(t.k)).length,total:active.length,requiredDone:required.filter(t=>done115(t.k)).length,requiredTotal:required.length};
}

function ensureCPStyle115(){if(E15('cpStyle115'))return;const s=document.createElement('style');s.id='cpStyle115';s.textContent=`
.cp115-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px}.cp115-progress{font-size:10px;color:var(--muted)}
.cp115-task{display:grid;grid-template-columns:28px 1fr auto;gap:8px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}.cp115-task:first-child{border-top:0}
.cp115-icon{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;border:1px solid var(--line)}
.cp115-icon.done{background:#102519;border-color:#295f3b}.cp115-icon.todo{background:#101923}.cp115-icon.skip{background:#1b1b1b;color:var(--muted)}
.cp115-task b{font-size:11px}.cp115-task small{display:block;color:var(--muted);font-size:9px;margin-top:2px}.cp115-actions{display:flex;gap:5px;align-items:center}.cp115-actions button{padding:7px 8px;font-size:9px;min-width:auto}
.cp115-next{margin-top:10px;border:1px solid #2b6385;background:#102131;border-radius:11px;padding:10px;font-size:10px;line-height:1.45}
`;document.head.appendChild(s)}

function renderCP115(){
  const out=E15('copilotBody115'),badge=E15('copilotBadge115');if(!out)return;
  const p=plan115();
  if(!p){
    if(badge)badge.textContent='not started';
    out.innerHTML=`<div class="note">Choose an installation system. RUNLU will build a short material workflow, carry the measured area forward, and track what has been added to the job.</div>
      <div class="field" style="margin-top:10px"><label>Flooring system</label><select id="copilotPlan115"><option value="carpet_stretch">Carpet · Stretch-in</option><option value="carpet_glue">Carpet · Direct glue</option><option value="sheet">Sheet Vinyl / Linoleum</option><option value="lvp_attached">Plank / LVP · Attached pad</option><option value="lvp_underlay">Plank / LVP · Separate underlay</option><option value="tile">Tile</option></select></div>
      <div class="field"><label>Job name · optional</label><input id="copilotJob115" type="text" placeholder="e.g. Smith Residence"></div>
      <button type="button" class="btn primary" style="width:100%" onclick="startCopilot115()">START SMART JOB</button>`;
    return;
  }
  const pr=progress115(),a=area115(),next=nextTask115(true);if(badge)badge.textContent=pr.requiredDone+'/'+pr.requiredTotal+' required';
  const rows=p.tasks.map(t=>{
    const sk=!!cp115.skip?.[t.k],dn=done115(t.k),manual=t.kind==='manual';
    const icon=sk?'—':dn?'✓':t.req?'!':'·';
    const cls=sk?'skip':dn?'done':'todo';
    let action='';
    if(manual){action=`<button type="button" class="btn secondary" onclick="checkCopilot115('${t.k}')">${dn?'UNDO':'MARK CHECKED'}</button>`}
    else action=`<button type="button" class="btn secondary" onclick="openCopilotTask115('${t.k}')">OPEN</button>`;
    if(!t.req)action+=`<button type="button" class="btn secondary" onclick="skipCopilot115('${t.k}')">${sk?'RESTORE':'N/A'}</button>`;
    return `<div class="cp115-task"><span class="cp115-icon ${cls}">${icon}</span><div><b>${esc15(t.label)}</b><small>${t.req?'Required':'Recommended / confirm if applicable'}${sk?' · marked N/A':''}</small></div><div class="cp115-actions">${action}</div></div>`;
  }).join('');
  out.innerHTML=`<div class="cp115-head"><div><b>${esc15(p.label)}</b><div class="cp115-progress">${esc15(cp115.job||'Current job')} · ${a>0?F15(a,2)+' sf ready':'area waiting'}</div></div><div class="cp115-progress">${pr.done}/${pr.total} checks</div></div>${rows}
    <div class="cp115-next"><b>NEXT:</b> ${next?esc15(next.label):'Required workflow complete. Review the Complete Job Material List and Smart Job Check before ordering.'}</div>
    <div class="minirow" style="margin-top:10px"><button type="button" class="btn primary" onclick="nextCopilot115()">OPEN NEXT STEP</button><button type="button" class="btn secondary" onclick="copyCopilot115()">COPY CHECKLIST</button><button type="button" class="btn secondary" onclick="resetCopilot115()">RESET</button></div>`;
}

window.startCopilot115=function(){
  const sel=E15('copilotPlan115')?.value||'carpet_stretch',job=(E15('copilotJob115')?.value||'').trim();
  cp115={plan:sel,job,skip:{},checked:{}};saveCP115();if(job&&E15('jobName'))E15('jobName').value=job;renderCP115();openCopilotTask115('main');
};
window.resetCopilot115=function(){if(cp115.plan&&!confirm('Reset the Smart Job workflow? Job items will stay in the material list.'))return;cp115={plan:'',job:'',skip:{},checked:{}};saveCP115();renderCP115()};
window.skipCopilot115=function(k){cp115.skip=cp115.skip||{};cp115.skip[k]=!cp115.skip[k];saveCP115();renderCP115()};
window.checkCopilot115=function(k){cp115.checked=cp115.checked||{};cp115.checked[k]=!cp115.checked[k];saveCP115();renderCP115()};
window.nextCopilot115=function(){const t=nextTask115(true);if(!t)return alert('Required workflow is complete. Review the material list and Smart Job Check.');if(t.kind==='manual'){E15('salesCopilot115')?.scrollIntoView({behavior:'smooth',block:'start'});return alert('Confirm the specified '+t.label.toLowerCase()+', then tap MARK CHECKED.');}openCopilotTask115(t.k)};
window.openCopilotTask115=function(k){
  const p=plan115();if(!p)return;
  const a=area115();
  if(k==='main'){
    if(cp115.plan==='carpet_stretch'||cp115.plan==='carpet_glue'){setType('carpet');if(E15('carpetInstall'))E15('carpetInstall').value=cp115.plan==='carpet_glue'?'glue':'stretch';E15('carpetPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(cp115.plan==='sheet'){setType('sheetgoods');E15('sheetgoodsPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(cp115.plan==='tile'){setType('plank');if(window.setFloorMode111)window.setFloorMode111('tile',E15('modeTile111'));E15('plankPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    setType('plank');if(window.setFloorMode111)window.setFloorMode111('plank',E15('modePlank111'));E15('plankPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  if(['underlay','adhesive','prep'].includes(k)&&a<=0)return alert('Calculate the main flooring area first so RUNLU can carry the area forward.');
  if(k==='underlay'){setType('underlay');if(E15('underArea'))E15('underArea').value=Math.round(a*100)/100;if(E15('underUnit'))E15('underUnit').value='sf';E15('underlayPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(k==='adhesive'){setType('adhesive');if(E15('adhArea'))E15('adhArea').value=Math.round(a*100)/100;E15('adhesivePanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(k==='prep'){setType('floorprep');if(E15('prepArea113'))E15('prepArea113').value=Math.round(a*100)/100;E15('floorprepPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(k==='base'||k==='transition'){
    setType('plank');if(window.setFloorMode111)window.setFloorMode111(cp115.plan==='tile'?'tile':'plank',E15(cp115.plan==='tile'?'modeTile111':'modePlank111'));
    if(k==='base'&&E15('baseInclude111'))E15('baseInclude111').checked=true;
    const details=[...document.querySelectorAll('#plankPanel details')].find(d=>(d.querySelector('summary')?.textContent||'').includes('WALL BASE / TRANSITIONS'));if(details)details.open=true;
    E15('plankPanel')?.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
};
window.copyCopilot115=async function(){
  const p=plan115();if(!p)return alert('Start a Smart Job first.');
  const a=area115(),lines=['RUNLU FLOORING SALES COPILOT',p.label];if(cp115.job)lines.push('Job: '+cp115.job);if(a>0)lines.push('Area ready: '+F15(a,2)+' sf');lines.push('');
  p.tasks.forEach(t=>lines.push((done115(t.k)?'[x] ':'[ ] ')+t.label+(cp115.skip?.[t.k]?' (N/A)':'')));
  lines.push('','Planning checklist only — confirm manufacturer requirements and field conditions before final order.');
  const text=lines.join('\n');try{await navigator.clipboard.writeText(text);alert('Copilot checklist copied.')}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Copilot checklist copied.')}
};

function enhanceCP115(){
  ensureCPStyle115();
  if(!E15('salesCopilot115')){
    const anchor=E15('smartFlow114')||E15('remnantBox')||E15('jobBox');
    if(anchor)anchor.insertAdjacentHTML('beforebegin',`<details id="salesCopilot115" class="card toolcard" open><summary>FLOORING SALES COPILOT <span id="copilotBadge115" class="badge">not started</span></summary><div id="copilotBody115" style="margin-top:12px"></div></details>`);
  }
  document.title='RUNLU Field Calculator · V1.15 Sales Copilot';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.15 · SALES COPILOT';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Eight flooring calculators. V1.15 adds a guided Flooring Sales Copilot that builds a material workflow, carries area forward and tracks required versus recommended checks.';
  const eng=E15('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.15 Sales Copilot + Smart Flow are active.';
  renderCP115();
}

window.calculate=function(){const r=calcV114();setTimeout(renderCP115,0);return r};
window.renderJob=function(){renderJobV114();renderCP115()};

try{enhanceCP115()}catch(err){console.error(err);const eng=E15('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc15(err.message||err)}}
})();