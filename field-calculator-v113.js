(function(){
'use strict';
const calcV112=window.calculate;
const stateV112=window.state;
const applyStateV112=window.applyState;
const clearV112=window.clearInputs;
const nextV112=window.nextJob;
const setTypeV112=window.setType;
const renderJobV112=window.renderJob;

function E13(id){return document.getElementById(id)}
function N13(id){return parseFloat(E13(id)?.value)||0}
function C13(x){return Math.ceil(x-1e-10)}
function F13(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}
function esc13(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c))}

function enhancePrep113(){
  if(E13('floorprepPanel'))return;
  const tabs=document.querySelector('.tabs');
  const adhesiveBtn=tabs?.querySelector('[data-type="adhesive"]');
  if(adhesiveBtn)adhesiveBtn.insertAdjacentHTML('afterend','<button type="button" data-type="floorprep" onclick="setType(\'floorprep\')">FLOOR PREP<span>primer · leveler · patch · moisture</span></button>');
  const stairs=E13('stairsPanel');
  if(stairs){
    stairs.insertAdjacentHTML('beforebegin',`<section id="floorprepPanel" class="card hidden">
      <h3>MATERIAL · FLOOR PREP</h3>
      <div class="note">Use the exact manufacturer coverage for the selected product and substrate. RUNLU converts the stated coverage into a practical whole-container order quantity.</div>
      <div class="row"><div class="field"><label>Prep type</label><select id="prepType113" onchange="updatePrepFields113()"><option value="primer">Primer / bonding primer</option><option value="leveler">Self-leveler / topping</option><option value="patch">Patch / skim coat</option><option value="moisture">Moisture barrier / coating</option></select></div><div class="field"><label>Area (sf)</label><input id="prepArea113" type="number" inputmode="decimal" min="0" placeholder="500"></div></div>
      <div class="minirow"><button type="button" class="btn secondary" onclick="useRoomAreaForPrep113()">USE CURRENT ROOM AREA</button><button type="button" class="btn secondary" onclick="setPrepExtra113(5)">5% EXTRA</button><button type="button" class="btn secondary" onclick="setPrepExtra113(10)">10% EXTRA</button></div>
      <div class="row" style="margin-top:10px"><div class="field"><label>Extra / contingency (%)</label><input id="prepExtra113" type="number" value="10" min="0" step="1"></div><div class="field"><label>Package label</label><select id="prepUnit113"><option value="BAG">BAG</option><option value="PAIL">PAIL</option><option value="KIT">KIT</option><option value="GAL">GAL</option><option value="UNIT">UNIT</option></select></div></div>

      <div id="prepCoatingFields113">
        <div class="row"><div class="field"><label>Coverage / package / coat (sf)</label><input id="prepCoverage113" type="number" min="0" step="0.1" placeholder="Manufacturer coverage"></div><div class="field"><label>Coats</label><input id="prepCoats113" type="number" value="1" min="0.1" step="0.1"></div></div>
        <div class="note">Primer and moisture-coating mode: required packages = area × coats × contingency ÷ manufacturer coverage per package per coat.</div>
      </div>

      <div id="prepDepthFields113" class="hidden">
        <div class="row"><div class="field"><label>Manufacturer coverage (sf / package)</label><input id="prepDepthCoverage113" type="number" min="0" step="0.1" placeholder="Coverage at reference depth"></div><div class="field"><label>Reference depth (in)</label><input id="prepRefDepth113" type="number" value="0.125" min="0" step="0.03125"></div></div>
        <div class="row"><div class="field"><label>Average target depth (in)</label><input id="prepTargetDepth113" type="number" value="0.125" min="0" step="0.03125"></div><div class="field"><label>Depth-adjusted coverage</label><input id="prepAdjustedCoverage113" type="text" readonly value="—"></div></div>
        <div class="note">Leveler / patch mode scales the manufacturer's stated coverage by depth: adjusted coverage = stated coverage × reference depth ÷ target depth. Use an average depth for irregular substrates; deep fills, aggregate extension and featheredge work require product-specific judgment.</div>
      </div>

      <details class="subdetails"><summary>PREP JOB NOTES</summary>
        <div class="field"><label>Product / note · optional</label><input id="prepName113" type="text" placeholder="e.g. Primer T / self-leveler / moisture kit"></div>
        <div class="note">Save a Material Preset after entering a real product's coverage so the same package data can be reused without retyping it.</div>
      </details>
    </section>`);
  }
  updatePrepFields113();
}

window.updatePrepFields113=function(){
  const mode=E13('prepType113')?.value||'primer';
  const depth=mode==='leveler'||mode==='patch';
  E13('prepCoatingFields113')?.classList.toggle('hidden',depth);
  E13('prepDepthFields113')?.classList.toggle('hidden',!depth);
  const unit=E13('prepUnit113');
  if(unit){
    if(mode==='leveler'||mode==='patch')unit.value='BAG';
    else if(mode==='moisture')unit.value='KIT';
    else unit.value='PAIL';
  }
  updateAdjustedCoverage113();
};
window.setPrepExtra113=function(v){if(E13('prepExtra113'))E13('prepExtra113').value=v};
window.useRoomAreaForPrep113=function(){
  const a=(typeof dim==='function'?dim('Lft','Lin'):0)*(typeof dim==='function'?dim('Wft','Win'):0);
  if(a<=0)return alert('Enter room dimensions first, then use this button.');
  E13('prepArea113').value=Math.round(a*100)/100;
};
window.updateAdjustedCoverage113=function(){
  const cov=N13('prepDepthCoverage113'),ref=N13('prepRefDepth113'),target=N13('prepTargetDepth113');
  const out=E13('prepAdjustedCoverage113');
  if(!out)return;
  out.value=(cov>0&&ref>0&&target>0)?F13(cov*ref/target)+' sf / package':'—';
};
['input','change'].forEach(evt=>document.addEventListener(evt,e=>{if(['prepDepthCoverage113','prepRefDepth113','prepTargetDepth113'].includes(e.target?.id))updateAdjustedCoverage113()}));

function prepLabel113(mode){return mode==='leveler'?'Self-Leveler':mode==='patch'?'Patch / Skim':mode==='moisture'?'Moisture Barrier':'Primer'}
function calcPrep113(){
  try{
    const mode=E13('prepType113')?.value||'primer',area=N13('prepArea113'),extra=Math.max(0,N13('prepExtra113')),unit=E13('prepUnit113')?.value||'UNIT';
    if(area<=0)return alert('Enter the floor-prep area.');
    const adjustedArea=area*(1+extra/100),name=(E13('prepName113')?.value||'').trim(),label=prepLabel113(mode);
    let qty=0,items=[['Net area',F13(area)+' sf'],['With contingency',F13(adjustedArea)+' sf'],['Extra',F13(extra,1)+'%']],note='',coverage=0;
    if(mode==='leveler'||mode==='patch'){
      const stated=N13('prepDepthCoverage113'),ref=N13('prepRefDepth113'),target=N13('prepTargetDepth113');
      if(stated<=0||ref<=0||target<=0)return alert('Enter manufacturer coverage, reference depth and average target depth.');
      coverage=stated*ref/target;
      qty=C13(adjustedArea/coverage);
      items.push(['Stated coverage',F13(stated)+' sf @ '+F13(ref,3)+' in'],['Target depth',F13(target,3)+' in'],['Adjusted coverage',F13(coverage)+' sf / '+unit],['Order',String(qty)+' '+unit+(qty===1?'':'S')],['Nominal capacity',F13(qty*coverage)+' sf @ target depth']);
      note='<b>Depth model:</b> quantity scales linearly from the manufacturer reference coverage. Confirm maximum lift, minimum thickness, aggregate-extension rules and substrate preparation before ordering.';
    }else{
      coverage=N13('prepCoverage113');const coats=N13('prepCoats113');
      if(coverage<=0||coats<=0)return alert('Enter manufacturer coverage per package per coat and number of coats.');
      qty=C13(adjustedArea*coats/coverage);
      items.push(['Coats',F13(coats,1)],['Coverage',F13(coverage)+' sf / '+unit+' / coat'],['Total coat-area',F13(adjustedArea*coats)+' sf'],['Order',String(qty)+' '+unit+(qty===1?'':'S')],['Nominal coat capacity',F13(qty*coverage)+' sf']);
      note='<b>Coating model:</b> quantity uses the entered manufacturer coverage for each coat. Porosity, substrate profile and application method can materially change real-world coverage.';
    }
    show(label,String(qty),unit+(qty===1?'':'S'),items,note);
    const key=(name?label+' · '+name:label);
    setCurrentResult({type:'floorprep',title:label,primary:qty+' '+unit+(qty===1?'':'S')+(name?' · '+name:''),defaultName:key,totals:[{key,value:qty,unit:unit.toLowerCase()+'s'},{key:label+' coverage area',value:area,unit:'sf'}]});
    saveLast();
  }catch(err){console.error(err);const eng=E13('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc13(err.message||err)}alert('Calculation error: '+(err.message||err));
  }
}

function enhanceMaterialList113(){
  const box=E13('jobBox');if(!box||E13('completeMaterialList113'))return;
  const note=box.querySelector('.note:last-child');
  const html=`<div id="completeMaterialList113" class="note" style="margin-top:12px">No material list yet.</div>
  <button id="copyMaterialList113" type="button" class="btn secondary" style="width:100%;margin-top:10px" onclick="copyCompleteMaterialList113()">COPY COMPLETE MATERIAL LIST</button>`;
  if(note)note.insertAdjacentHTML('beforebegin',html);else box.insertAdjacentHTML('beforeend',html);
}
function mergedTotals113(){
  const m={};
  (jobItems||[]).forEach(it=>(it.totals||[]).forEach(t=>{const k=t.key+'|'+t.unit;if(!m[k])m[k]={key:t.key,unit:t.unit,value:0};m[k].value+=Number(t.value)||0}));
  return Object.values(m);
}
function formatQty113(t){
  const whole=['boxes','rolls','pails','buckets','tubes','pieces','bags','kits','units','gals'];
  return F13(t.value,whole.includes(String(t.unit).toLowerCase())?0:2)+' '+t.unit;
}
function renderCompleteMaterialList113(){
  const out=E13('completeMaterialList113');if(!out)return;
  const vals=mergedTotals113();
  if(!vals.length){out.textContent='No material list yet. Add calculated results to the job.';return}
  out.innerHTML='<b>COMPLETE JOB MATERIAL LIST</b><br>'+vals.map(t=>esc13(t.key)+': <b>'+esc13(formatQty113(t))+'</b>').join('<br>');
}
window.copyCompleteMaterialList113=async function(){
  const vals=mergedTotals113();if(!vals.length)return alert('Add calculated results to the job first.');
  const job=(E13('jobName')?.value||'').trim();
  const lines=['RUNLU COMPLETE JOB MATERIAL LIST'];if(job)lines.push('Job: '+job);lines.push('');
  vals.forEach(t=>lines.push(t.key+': '+formatQty113(t)));
  lines.push('','Planning quantities only — confirm product instructions, field conditions and final order requirements.');
  const text=lines.join('\n');
  try{await navigator.clipboard.writeText(text);alert('Complete material list copied.')}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Complete material list copied.');}
};

window.renderJob=function(){renderJobV112();renderCompleteMaterialList113()};

window.setType=function(t){
  if(t!=='floorprep'){
    setTypeV112(t);
    E13('floorprepPanel')?.classList.add('hidden');
    return;
  }
  type='floorprep';
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.type===t));
  ['carpet','rolllength','sheetgoods','plank','underlay','adhesive','stairs','floorprep'].forEach(x=>E13(x+'Panel')?.classList.toggle('hidden',x!==t));
  E13('roomCard')?.classList.add('hidden');
  E13('result')?.classList.add('hidden');E13('resultActions')?.classList.add('hidden');currentResult=null;
  if(E13('nextBtn'))E13('nextBtn').textContent='+ NEW PREP CALC';
  updatePresetList();
};

window.calculate=function(){if(type==='floorprep')return calcPrep113();return calcV112()};
window.nextJob=function(){if(type!=='floorprep')return nextV112();E13('result')?.classList.add('hidden');resetResultActions();currentResult=null;if(E13('prepArea113'))E13('prepArea113').value='';E13('prepArea113')?.focus()};

window.state=function(){
  const s=stateV112();
  return Object.assign(s,{prepType113:E13('prepType113')?.value||'primer',prepArea113:E13('prepArea113')?.value||'',prepExtra113:E13('prepExtra113')?.value||'10',prepUnit113:E13('prepUnit113')?.value||'PAIL',prepCoverage113:E13('prepCoverage113')?.value||'',prepCoats113:E13('prepCoats113')?.value||'1',prepDepthCoverage113:E13('prepDepthCoverage113')?.value||'',prepRefDepth113:E13('prepRefDepth113')?.value||'0.125',prepTargetDepth113:E13('prepTargetDepth113')?.value||'0.125',prepName113:E13('prepName113')?.value||''});
};
window.applyState=function(s,restoreType=true){
  applyStateV112(s,restoreType);
  const defs={prepType113:'primer',prepArea113:'',prepExtra113:'10',prepUnit113:'PAIL',prepCoverage113:'',prepCoats113:'1',prepDepthCoverage113:'',prepRefDepth113:'0.125',prepTargetDepth113:'0.125',prepName113:''};
  Object.keys(defs).forEach(k=>{if(E13(k))E13(k).value=s&&s[k]!==undefined?s[k]:defs[k]});updatePrepFields113();
};
window.clearInputs=function(){clearV112();if(E13('prepType113'))E13('prepType113').value='primer';if(E13('prepArea113'))E13('prepArea113').value='';if(E13('prepExtra113'))E13('prepExtra113').value='10';if(E13('prepCoverage113'))E13('prepCoverage113').value='';if(E13('prepCoats113'))E13('prepCoats113').value='1';if(E13('prepDepthCoverage113'))E13('prepDepthCoverage113').value='';if(E13('prepRefDepth113'))E13('prepRefDepth113').value='0.125';if(E13('prepTargetDepth113'))E13('prepTargetDepth113').value='0.125';if(E13('prepName113'))E13('prepName113').value='';updatePrepFields113()};

function enhanceV113(){
  enhancePrep113();enhanceMaterialList113();renderCompleteMaterialList113();
  document.title='RUNLU Field Calculator · V1.13 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.13 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Eight flooring calculators. No login. V1.13 adds floor-prep quantity planning and a copy-ready complete job material list.';
  const eng=E13('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.13 floor prep + complete material list are active.';
}

try{
  const levelerCoverage=50*0.125/0.25;
  if(Math.abs(levelerCoverage-25)>.0001||C13(500*1.10/levelerCoverage)!==22)throw new Error('V1.13 floor-prep self-test failed');
  enhanceV113();
}catch(err){console.error(err);const eng=E13('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc13(err.message||err)}}
})();
