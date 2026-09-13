(function(){
'use strict';
const calcV115=window.calculate;
const setTypeV115=window.setType;
const nextV115=window.nextJob;
const stateV115=window.state;
const applyStateV115=window.applyState;
const clearV115=window.clearInputs;
const renderJobV115=window.renderJob;
const addToJobV115=window.addCurrentToJob;

function E16(id){return document.getElementById(id)}
function N16(id){return parseFloat(E16(id)?.value)||0}
function C16(x){return Math.ceil(x-1e-10)}
function F16(x,d=2){return Number(x||0).toLocaleString(undefined,{maximumFractionDigits:d})}
function esc16(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function smart16(){try{return JSON.parse(localStorage.getItem('runluSmartContextV114')||'null')||{}}catch(e){return{}}}
function roomArea16(){return (typeof dim==='function'?dim('Lft','Lin'):0)*(typeof dim==='function'?dim('Wft','Win'):0)}
function pkgPlural16(unit,q){unit=(unit||'BAG').toUpperCase();return q===1?unit:unit+'S'}

function enhanceTileSetting116(){
  if(E16('tilesettingPanel'))return;
  const tabs=document.querySelector('.tabs');
  const plankBtn=tabs?.querySelector('[data-type="plank"]');
  if(plankBtn)plankBtn.insertAdjacentHTML('afterend','<button type="button" data-type="tilesetting" onclick="setType(\'tilesetting\')">MORTAR / GROUT<span>thinset · trowel · joints · safe order</span></button>');
  const under=E16('underlayPanel');
  if(under){under.insertAdjacentHTML('beforebegin',`<section id="tilesettingPanel" class="card hidden">
    <h3>MATERIAL · TILE SETTING</h3>
    <div class="note">For mortar/thinset and grout. Enter the exact manufacturer coverage for the product, trowel, tile and joint conditions. RUNLU uses the low end of a coverage range for the conservative Safe Order.</div>
    <div class="field"><label>Calculator</label><div class="chips" id="tileSetMode116"><button id="mortarMode116" type="button" class="active" onclick="setTileSetMode116('mortar',this)">MORTAR / THINSET</button><button id="groutMode116" type="button" onclick="setTileSetMode116('grout',this)">GROUT</button></div></div>
    <div class="row"><div class="field"><label>Area (sf)</label><input id="tileSetArea116" type="number" inputmode="decimal" min="0" placeholder="250"></div><div class="field"><label>Extra / contingency (%)</label><input id="tileSetExtra116" type="number" value="10" min="0" step="1"></div></div>
    <div class="minirow"><button type="button" class="btn secondary" onclick="useSmartTileArea116()">USE SMART AREA</button><button type="button" class="btn secondary" onclick="useRoomTileArea116()">USE CURRENT ROOM</button><button type="button" class="btn secondary" onclick="setTileSetExtra116(10)">10% EXTRA</button></div>

    <div id="mortarFields116" style="margin-top:12px">
      <div class="field"><label>Product / mortar name · optional</label><input id="mortarName116" type="text" placeholder="e.g. Large & Heavy Tile Mortar"></div>
      <div class="row"><div class="field"><label>Trowel / application</label><select id="mortarTrowel116"><option>1/4 × 1/4 × 1/4 in square-notch</option><option>1/4 × 3/8 × 1/4 in square-notch</option><option>1/2 × 1/2 × 1/2 in square-notch</option><option>Other / manufacturer specified</option></select></div><div class="field"><label>Package</label><select id="mortarUnit116"><option>BAG</option><option>PAIL</option><option>UNIT</option></select></div></div>
      <div class="row"><div class="field"><label>Low coverage / package (sf)</label><input id="mortarLow116" type="number" min="0" step="0.1" placeholder="Manufacturer low end"></div><div class="field"><label>High coverage / package (sf)</label><input id="mortarHigh116" type="number" min="0" step="0.1" placeholder="Manufacturer high end"></div></div>
      <div class="note">Coverage varies with trowel, substrate flatness, tile back pattern, transfer and technique. Safe Order uses the entered low coverage.</div>
    </div>

    <div id="groutFields116" class="hidden" style="margin-top:12px">
      <div class="field"><label>Product / grout name · optional</label><input id="groutName116" type="text" placeholder="e.g. FA grout / epoxy grout"></div>
      <div class="row"><div class="field"><label>Tile length (in)</label><input id="groutTileL116" type="number" value="24" min="0" step="0.01"></div><div class="field"><label>Tile width (in)</label><input id="groutTileW116" type="number" value="12" min="0" step="0.01"></div></div>
      <div class="row"><div class="field"><label>Joint width (in)</label><input id="groutJoint116" type="number" value="0.125" min="0" step="0.03125"></div><div class="field"><label>Joint depth / tile thickness (in)</label><input id="groutDepth116" type="number" value="0.375" min="0" step="0.03125"></div></div>
      <div class="row"><div class="field"><label>Low coverage / package (sf)</label><input id="groutLow116" type="number" min="0" step="0.1" placeholder="For this tile/joint setup"></div><div class="field"><label>High coverage / package (sf)</label><input id="groutHigh116" type="number" min="0" step="0.1" placeholder="For this tile/joint setup"></div></div>
      <div class="field"><label>Package</label><select id="groutUnit116"><option>BAG</option><option>PAIL</option><option>KIT</option><option>UNIT</option></select></div>
      <div id="groutGeometry116" class="note">Enter tile and joint dimensions to document the coverage setup.</div>
      <div class="note">Use coverage from the exact grout product or manufacturer calculator for the tile size, joint width and depth. Safe Order uses the low coverage; field waste and cleaning loss are handled by the contingency input.</div>
    </div>

    <details class="subdetails"><summary>WHY SAFE ORDER?</summary><div class="note">For setting materials, a single theoretical number can be optimistic. RUNLU keeps the manufacturer coverage range visible and bases the conservative order on the low end. This is planning help, not a substitute for product instructions or installer judgment.</div></details>
  </section>`)}
  updateGroutGeometry116();
}

let tileSetMode116='mortar';
window.setTileSetMode116=function(mode,btn){
  tileSetMode116=mode==='grout'?'grout':'mortar';
  document.querySelectorAll('#tileSetMode116 button').forEach(b=>b.classList.remove('active'));
  (btn||E16(tileSetMode116==='mortar'?'mortarMode116':'groutMode116'))?.classList.add('active');
  E16('mortarFields116')?.classList.toggle('hidden',tileSetMode116!=='mortar');
  E16('groutFields116')?.classList.toggle('hidden',tileSetMode116!=='grout');
  E16('result')?.classList.add('hidden');
};
window.setTileSetExtra116=function(v){if(E16('tileSetExtra116'))E16('tileSetExtra116').value=v};
window.useSmartTileArea116=function(){const s=smart16(),a=Number(s.area)||0;if(a<=0)return alert('Calculate the main flooring area first.');E16('tileSetArea116').value=Math.round(a*100)/100};
window.useRoomTileArea116=function(){const a=roomArea16();if(a<=0)return alert('Enter room dimensions first.');E16('tileSetArea116').value=Math.round(a*100)/100};
window.updateGroutGeometry116=function(){
  const L=N16('groutTileL116'),W=N16('groutTileW116'),j=N16('groutJoint116'),d=N16('groutDepth116'),out=E16('groutGeometry116');if(!out)return;
  if(L<=0||W<=0||j<=0||d<=0){out.textContent='Enter tile and joint dimensions to document the coverage setup.';return}
  const index=j*d*(1/L+1/W);
  out.innerHTML='Joint geometry index: <b>'+esc16(F16(index,6))+'</b> · smaller tiles / wider or deeper joints use more grout. Coverage must still come from the grout manufacturer for this setup.';
};
['input','change'].forEach(evt=>document.addEventListener(evt,e=>{if(['groutTileL116','groutTileW116','groutJoint116','groutDepth116'].includes(e.target?.id))updateGroutGeometry116()}));

function calcSetting116(){
  try{
    const area=N16('tileSetArea116'),extra=Math.max(0,N16('tileSetExtra116'));if(area<=0)return alert('Enter the tile-setting area.');
    const req=area*(1+extra/100);let low=0,high=0,unit='',name='',label='',details=[];
    if(tileSetMode116==='mortar'){
      low=N16('mortarLow116');high=N16('mortarHigh116')||low;unit=E16('mortarUnit116')?.value||'BAG';name=(E16('mortarName116')?.value||'').trim();label='Mortar / Thinset';
      if(low<=0)return alert('Enter the manufacturer low coverage per mortar package.');if(high<low)high=low;
      details=[['Trowel',E16('mortarTrowel116')?.value||'Manufacturer specified']];
    }else{
      low=N16('groutLow116');high=N16('groutHigh116')||low;unit=E16('groutUnit116')?.value||'BAG';name=(E16('groutName116')?.value||'').trim();label='Grout';
      if(low<=0)return alert('Enter the manufacturer low coverage per grout package for this tile/joint setup.');if(high<low)high=low;
      const L=N16('groutTileL116'),W=N16('groutTileW116'),j=N16('groutJoint116'),d=N16('groutDepth116');
      if(L<=0||W<=0||j<=0||d<=0)return alert('Enter tile size, joint width and joint depth.');
      details=[['Tile size',F16(L)+' × '+F16(W)+' in'],['Joint',F16(j,3)+' in wide × '+F16(d,3)+' in deep']];
    }
    const safe=C16(req/low),best=C16(req/high),capacity=safe*low;
    const items=[['Net area',F16(area)+' sf'],['With contingency',F16(req)+' sf'],['Extra',F16(extra,1)+'%'],['Coverage range',F16(low)+'–'+F16(high)+' sf / '+unit],['SAFE ORDER',safe+' '+pkgPlural16(unit,safe)],['Best-case order',best+' '+pkgPlural16(unit,best)],['Safe nominal capacity',F16(capacity)+' sf']].concat(details);
    const note='<b>Safe Order</b> uses the low end of the manufacturer coverage range. '+(safe>best?'The range changes the whole-package order, so verify actual field conditions before reducing quantity.':'The entered range rounds to the same whole-package quantity for this area.');
    show(label,String(safe),pkgPlural16(unit,safe),items,note);
    const key=label+(name?' · '+name:'');
    setCurrentResult({type:'tilesetting',title:label,primary:safe+' '+pkgPlural16(unit,safe)+(name?' · '+name:''),defaultName:key,totals:[{key,value:safe,unit:unit.toLowerCase()+'s'},{key:label+' coverage area',value:area,unit:'sf'}]});
    saveLast();
  }catch(err){console.error(err);const eng=E16('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc16(err.message||err)}alert('Calculation error: '+(err.message||err));}
}

window.sendTileToSetting116=function(mode){
  const s=smart16(),a=Number(s.area)||roomArea16();setType('tilesetting');setTileSetMode116(mode,E16(mode==='grout'?'groutMode116':'mortarMode116'));if(a>0)E16('tileSetArea116').value=Math.round(a*100)/100;E16('tilesettingPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
};
function addTileHandoff116(){
  if(type!=='plank'||!E16('modeTile111')?.classList.contains('active'))return;
  const result=E16('result');if(!result||result.classList.contains('hidden')||E16('tileHandoff116'))return;
  result.insertAdjacentHTML('beforeend','<div id="tileHandoff116" class="minirow" style="margin-top:10px"><button type="button" class="btn secondary" onclick="sendTileToSetting116(\'mortar\')">SEND TO MORTAR</button><button type="button" class="btn secondary" onclick="sendTileToSetting116(\'grout\')">SEND TO GROUT</button></div>');
}
function markCopilot116(key,needle){
  if(typeof window.checkCopilot115!=='function')return;
  const row=[...document.querySelectorAll('#copilotBody115 .cp115-task')].find(r=>(r.textContent||'').toLowerCase().includes(needle));
  if(row&&!row.querySelector('.cp115-icon.done'))window.checkCopilot115(key);
}
function patchSmartJob116(){
  const box=E16('smartJobCheck114');if(!box)return;
  const mortar=(jobItems||[]).some(it=>(it.totals||[]).some(t=>String(t.key||'').toLowerCase().includes('mortar / thinset')));
  const grout=(jobItems||[]).some(it=>(it.totals||[]).some(t=>String(t.key||'').toLowerCase().startsWith('grout')));
  let html=box.innerHTML;
  const old='• Tile: mortar and grout are not yet tracked by RUNLU; confirm both before final order.<br>';
  if(html.includes(old)){
    const repl=mortar&&grout?'':mortar?'• Tile: grout is still missing from the current job.<br>':grout?'• Tile: mortar / thinset is still missing from the current job.<br>':'• Tile: add mortar / thinset and grout before final order.<br>';
    html=html.replace(old,repl);box.innerHTML=html;
  }
  if((mortar||grout)&&!E16('tileSettingStatus116'))box.insertAdjacentHTML('beforeend','<br><span id="tileSettingStatus116">Tile setting: <b>'+ (mortar?'Mortar ✓':'Mortar —') +' · '+(grout?'Grout ✓':'Grout —')+'</b></span>');
  else if(E16('tileSettingStatus116'))E16('tileSettingStatus116').innerHTML='Tile setting: <b>'+ (mortar?'Mortar ✓':'Mortar —') +' · '+(grout?'Grout ✓':'Grout —')+'</b>';
}

window.setType=function(t){
  if(t!=='tilesetting'){
    setTypeV115(t);E16('tilesettingPanel')?.classList.add('hidden');return;
  }
  type='tilesetting';document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.type===t));
  ['carpet','rolllength','sheetgoods','plank','tilesetting','underlay','adhesive','floorprep','stairs'].forEach(x=>E16(x+'Panel')?.classList.toggle('hidden',x!==t));
  E16('roomCard')?.classList.add('hidden');E16('result')?.classList.add('hidden');E16('resultActions')?.classList.add('hidden');currentResult=null;
  if(E16('nextBtn'))E16('nextBtn').textContent='+ NEW MORTAR / GROUT CALC';
  const s=smart16();if(!N16('tileSetArea116')&&Number(s.area)>0&&s.source==='Tile')E16('tileSetArea116').value=Math.round(Number(s.area)*100)/100;
  updatePresetList();
};
window.calculate=function(){const r=type==='tilesetting'?calcSetting116():calcV115();setTimeout(addTileHandoff116,0);return r};
window.nextJob=function(){if(type!=='tilesetting')return nextV115();E16('result')?.classList.add('hidden');resetResultActions();currentResult=null;E16('tileSetArea116')?.focus()};
window.renderJob=function(){renderJobV115();patchSmartJob116()};
window.addCurrentToJob=function(){const title=currentResult?.title||'';addToJobV115();setTimeout(()=>{if(title==='Mortar / Thinset')markCopilot116('mortar','mortar / thinset');if(title==='Grout')markCopilot116('grout','grout confirmed');patchSmartJob116()},0)};

window.state=function(){const s=stateV115();return Object.assign(s,{tileSetMode116,tileSetArea116:E16('tileSetArea116')?.value||'',tileSetExtra116:E16('tileSetExtra116')?.value||'10',mortarName116:E16('mortarName116')?.value||'',mortarTrowel116:E16('mortarTrowel116')?.value||'',mortarUnit116:E16('mortarUnit116')?.value||'BAG',mortarLow116:E16('mortarLow116')?.value||'',mortarHigh116:E16('mortarHigh116')?.value||'',groutName116:E16('groutName116')?.value||'',groutTileL116:E16('groutTileL116')?.value||'24',groutTileW116:E16('groutTileW116')?.value||'12',groutJoint116:E16('groutJoint116')?.value||'0.125',groutDepth116:E16('groutDepth116')?.value||'0.375',groutLow116:E16('groutLow116')?.value||'',groutHigh116:E16('groutHigh116')?.value||'',groutUnit116:E16('groutUnit116')?.value||'BAG'});};
window.applyState=function(s,restoreType=true){applyStateV115(s,restoreType);const d={tileSetArea116:'',tileSetExtra116:'10',mortarName116:'',mortarTrowel116:'1/4 × 1/4 × 1/4 in square-notch',mortarUnit116:'BAG',mortarLow116:'',mortarHigh116:'',groutName116:'',groutTileL116:'24',groutTileW116:'12',groutJoint116:'0.125',groutDepth116:'0.375',groutLow116:'',groutHigh116:'',groutUnit116:'BAG'};Object.keys(d).forEach(k=>{if(E16(k))E16(k).value=s&&s[k]!==undefined?s[k]:d[k]});setTileSetMode116(s&&s.tileSetMode116?s.tileSetMode116:'mortar');updateGroutGeometry116();};
window.clearInputs=function(){clearV115();if(E16('tileSetArea116'))E16('tileSetArea116').value='';if(E16('tileSetExtra116'))E16('tileSetExtra116').value='10';['mortarName116','mortarLow116','mortarHigh116','groutName116','groutLow116','groutHigh116'].forEach(id=>{if(E16(id))E16(id).value=''});if(E16('groutTileL116'))E16('groutTileL116').value='24';if(E16('groutTileW116'))E16('groutTileW116').value='12';if(E16('groutJoint116'))E16('groutJoint116').value='0.125';if(E16('groutDepth116'))E16('groutDepth116').value='0.375';setTileSetMode116('mortar');updateGroutGeometry116();};

function enhanceV116(){
  enhanceTileSetting116();document.title='RUNLU Field Calculator · V1.16 Tile System';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.16 · TILE SYSTEM';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Nine flooring calculators. V1.16 adds mortar/thinset and grout Safe Order planning, tile handoffs and stronger Sales Copilot coverage.';
  const eng=E16('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.16 Tile System + Sales Copilot are active.';
  patchSmartJob116();
}

try{
  const area=250*1.10,low=50,high=65;if(C16(area/low)!==6||C16(area/high)!==5)throw new Error('V1.16 safe-order self-test failed');
  enhanceV116();
}catch(err){console.error(err);const eng=E16('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc16(err.message||err)}}
})();