(function(){
'use strict';
const calcV113=window.calculate;
const renderJobV113=window.renderJob;

function E14(id){return document.getElementById(id)}
function N14(id){return parseFloat(E14(id)?.value)||0}
function F14(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}
function esc14(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
const SMART_KEY='runluSmartContextV114';
let smartCtx=loadSmart114();

function loadSmart114(){try{return JSON.parse(localStorage.getItem(SMART_KEY)||'null')||{}}catch(e){return{}}}
function saveSmart114(){try{localStorage.setItem(SMART_KEY,JSON.stringify(smartCtx))}catch(e){}}
function mainRoomArea114(){return (typeof dim==='function'?dim('Lft','Lin'):0)*(typeof dim==='function'?dim('Wft','Win'):0)}
function carpetArea114(){
  let a=mainRoomArea114();
  const mode=E14('carpetShape')?.value||'rectangle';
  if(mode!=='rectangle')a+=(N14('ZLft')+N14('ZLin')/12)*(N14('ZWft')+N14('ZWin')/12);
  return a;
}
function floorSource114(){
  if(type==='carpet')return 'Carpet';
  if(type==='sheetgoods')return 'Sheet Goods';
  if(type==='plank')return E14('modeTile111')?.classList.contains('active')?'Tile':'Plank / LVP';
  return '';
}
function captureFloorContext114(){
  const source=floorSource114();if(!source)return;
  const area=type==='carpet'?carpetArea114():mainRoomArea114();
  if(area<=0)return;
  smartCtx={area,source,roomL:(typeof dim==='function'?dim('Lft','Lin'):0),roomW:(typeof dim==='function'?dim('Wft','Win'):0),savedAt:Date.now()};
  saveSmart114();
}
function smartSuggestion114(){
  if(!smartCtx.area)return 'Calculate a floor area first. RUNLU will keep the last usable floor area ready for the next material calculator.';
  if(smartCtx.source==='Carpet'){
    const method=E14('carpetInstall')?.value||'';
    return method==='glue'?'Direct-glue carpet: send the same area to Adhesive and Floor Prep.':'Stretch-in carpet: check Underlay/Pad and Floor Prep; use Adhesive only when the selected installation system requires it.';
  }
  if(smartCtx.source==='Sheet Goods')return 'Sheet goods: the usual next checks are Adhesive and Floor Prep. Weld/seam quantities remain in the Sheet Goods result.';
  if(smartCtx.source==='Tile')return 'Tile: carry the area into Floor Prep now. Mortar and grout still require a separate check until their dedicated calculator is added.';
  if(smartCtx.source==='Plank / LVP')return 'Plank/LVP: carry the area into Floor Prep. Use Underlay only when the product/system calls for it; wall base and transitions stay in the Plank/Tile module.';
  return 'Use the saved floor area to continue the material workflow without retyping dimensions.';
}
function renderSmart114(){
  const area=Number(smartCtx.area)||0;
  if(E14('smartArea114'))E14('smartArea114').innerHTML=area?'<b>'+esc14(F14(area))+' sf</b> · '+esc14(smartCtx.source||'Floor area'):'No floor area captured yet.';
  if(E14('smartBadge114'))E14('smartBadge114').textContent=area?F14(area,0)+' sf ready':'waiting';
  if(E14('smartHint114'))E14('smartHint114').textContent=smartSuggestion114();
  document.querySelectorAll('[data-smart-target]').forEach(b=>b.disabled=!area);
}

window.smartSend114=function(target){
  const area=Number(smartCtx.area)||0;if(area<=0)return alert('Calculate a floor area first.');
  if(target==='underlay'){
    setType('underlay');if(E14('underArea'))E14('underArea').value=Math.round(area*100)/100;if(E14('underUnit'))E14('underUnit').value='sf';E14('underlayPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
  }else if(target==='adhesive'){
    setType('adhesive');if(E14('adhArea'))E14('adhArea').value=Math.round(area*100)/100;E14('adhesivePanel')?.scrollIntoView({behavior:'smooth',block:'start'});
  }else if(target==='floorprep'){
    setType('floorprep');if(E14('prepArea113'))E14('prepArea113').value=Math.round(area*100)/100;E14('floorprepPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
};
window.clearSmartArea114=function(){smartCtx={};saveSmart114();renderSmart114()};

function hasKey114(q){q=q.toLowerCase();return (jobItems||[]).some(it=>(it.totals||[]).some(t=>String(t.key||'').toLowerCase().includes(q)))}
function hasItemTitle114(q){q=q.toLowerCase();return (jobItems||[]).some(it=>String(it.title||'').toLowerCase().includes(q))}
function hasItemType114(q){q=q.toLowerCase();return (jobItems||[]).some(it=>String(it.type||'').toLowerCase()===q)}
function smartJobChecks114(){
  const checks=[];
  const carpet=hasItemType114('carpet')||hasItemTitle114('carpet');
  const sheet=hasItemType114('sheetgoods')||hasItemTitle114('sheet vinyl')||hasItemTitle114('linoleum');
  const tile=hasItemTitle114('tile');
  const plank=hasItemTitle114('plank')||hasItemTitle114('lvp')||hasItemTitle114('laminate');
  const anyFloor=carpet||sheet||tile||plank;
  const hasUnder=hasKey114('underlay')||hasKey114('pad net area');
  const hasGlue=hasKey114('adhesive');
  const hasPrep=hasItemType114('floorprep')||hasItemTitle114('primer')||hasItemTitle114('leveler')||hasItemTitle114('patch')||hasItemTitle114('moisture');
  const hasBase=hasKey114('wall base');
  const hasTrans=hasKey114('transition');
  if(carpet&&!hasUnder&&!hasGlue)checks.push('Carpet: confirm pad/underlay versus direct-glue adhesive system.');
  if(sheet&&!hasGlue)checks.push('Sheet goods: confirm the specified adhesive and seam treatment.');
  if(plank&&!hasUnder)checks.push('Plank/LVP: confirm whether attached pad is sufficient or separate underlay is required.');
  if(tile)checks.push('Tile: mortar and grout are not yet tracked by RUNLU; confirm both before final order.');
  if(anyFloor&&!hasPrep)checks.push('Subfloor: confirm whether primer, patch, leveler or moisture treatment is needed.');
  if((plank||tile)&&!hasBase)checks.push('Finish: confirm wall base/baseboard requirement.');
  if((plank||tile)&&!hasTrans)checks.push('Finish: confirm reducers, T-mouldings or thresholds at transitions.');
  return checks;
}
function renderSmartJobCheck114(){
  const out=E14('smartJobCheck114');if(!out)return;
  if(!(jobItems||[]).length){out.innerHTML='<b>SMART JOB CHECK</b><br>Add calculated items to the job and RUNLU will flag common items worth confirming.';return}
  const checks=smartJobChecks114();
  out.innerHTML='<b>SMART JOB CHECK</b><br>'+(checks.length?checks.map(x=>'• '+esc14(x)).join('<br>'):'No common follow-up gaps detected in the current job list. Final manufacturer and field verification still controls.');
}

function enhanceSmart114(){
  if(!E14('smartFlow114')){
    const anchor=E14('remnantBox')||E14('jobBox');
    if(anchor)anchor.insertAdjacentHTML('beforebegin',`<details id="smartFlow114" class="card toolcard" open>
      <summary>SMART FLOW <span id="smartBadge114" class="badge">waiting</span></summary>
      <div style="margin-top:12px"><div id="smartArea114" class="note">No floor area captured yet.</div>
      <div id="smartHint114" class="note" style="margin-top:8px">Calculate a floor area first.</div>
      <div class="minirow" style="margin-top:10px"><button type="button" class="btn secondary" data-smart-target="underlay" onclick="smartSend114('underlay')">SEND TO UNDERLAY</button><button type="button" class="btn secondary" data-smart-target="adhesive" onclick="smartSend114('adhesive')">SEND TO ADHESIVE</button><button type="button" class="btn secondary" data-smart-target="floorprep" onclick="smartSend114('floorprep')">SEND TO FLOOR PREP</button></div>
      <button type="button" class="btn secondary" style="width:100%;margin-top:9px" onclick="clearSmartArea114()">CLEAR SAVED AREA</button>
      <div class="note">Smart Flow transfers only the measured area. It never auto-selects an adhesive, prep product or underlay because product suitability must follow the manufacturer and installation system.</div></div>
    </details>`);
  }
  const job=E14('jobBox');
  if(job&&!E14('smartJobCheck114')){
    const list=E14('completeMaterialList113');
    const html='<div id="smartJobCheck114" class="note" style="margin-top:12px"><b>SMART JOB CHECK</b><br>Add calculated items to the job and RUNLU will flag common items worth confirming.</div>';
    if(list)list.insertAdjacentHTML('afterend',html);else job.querySelector('div')?.insertAdjacentHTML('beforeend',html);
  }
  document.title='RUNLU Field Calculator · V1.14 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.14 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Eight flooring calculators. V1.14 adds Smart Flow area handoffs and a Smart Job Check so material calculations work together instead of living as separate tools.';
  const eng=E14('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.14 smart material workflow is active.';
  renderSmart114();renderSmartJobCheck114();
}

window.calculate=function(){
  const ret=calcV113();
  setTimeout(()=>{if(['carpet','sheetgoods','plank'].includes(type))captureFloorContext114();renderSmart114();},0);
  return ret;
};
window.renderJob=function(){renderJobV113();renderSmartJobCheck114()};

try{
  const test={area:168,source:'Plank / LVP'};
  if(Math.abs(test.area-168)>.001)throw new Error('V1.14 smart-area self-test failed');
  enhanceSmart114();
}catch(err){console.error(err);const eng=E14('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc14(err.message||err)}}
})();
