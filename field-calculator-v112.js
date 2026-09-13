(function(){
'use strict';
const calcV111=window.calculate;
const stateV111=window.state;
const applyStateV111=window.applyState;
const clearV111=window.clearInputs;
const nextV111=window.nextJob;
const setTypeV111=window.setType;

function E12(id){return document.getElementById(id)}
function N12(id){return parseFloat(E12(id)?.value)||0}
function C12(x){return Math.ceil(x-1e-10)}
function F12(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}
function esc12(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c))}
function dim12(ftId,inId){return N12(ftId)+N12(inId)/12}
function ftin12(x){let ft=Math.floor(Math.max(0,x)+1e-9),i=Math.round((x-ft)*48)/4;if(i>=12){ft++;i=0}return ft+"' "+F12(i,2)+'"'}

function enhanceSheet112(){
  if(E12('sheetgoodsPanel'))return;
  const tabs=document.querySelector('.tabs');
  const rollBtn=tabs?.querySelector('[data-type="rolllength"]');
  if(rollBtn)rollBtn.insertAdjacentHTML('afterend','<button type="button" data-type="sheetgoods" onclick="setType(\'sheetgoods\')">SHEET GOODS<span>vinyl · lino · seams · weld</span></button>');

  const plank=E12('plankPanel');
  if(plank){
    plank.insertAdjacentHTML('beforebegin',`<section id="sheetgoodsPanel" class="card hidden">
      <h3>MATERIAL · SHEET VINYL / LINOLEUM</h3>
      <div class="note">Roll-goods planning for resilient sheet flooring. Calculates sheets, roll length, seams, weld length and stock balance. Product installation instructions control final sheet direction, edge trimming, adhesive and seam treatment.</div>
      <div class="row"><div class="field"><label>Material family</label><select id="sheetMaterial112" onchange="sheetMaterialHint112()"><option value="commercial">Commercial sheet vinyl</option><option value="residential">Residential sheet vinyl</option><option value="linoleum">Linoleum / Marmoleum</option><option value="other">Other resilient sheet</option></select></div><div class="field"><label>Roll width</label><select id="sheetWidth112" onchange="toggleSheetWidth112()"><option value="6.56168">2 m · 6 ft 6.7 in</option><option value="12">12 ft</option><option value="custom">Custom</option></select></div></div>
      <div class="row"><div class="field"><label>Custom roll width (ft)</label><input id="sheetWidthCustom112" type="number" value="6.56168" min="0" step="0.01" disabled></div><div class="field"><label>Install direction</label><select id="sheetRun112"><option value="auto">AUTO · lower roll length</option><option value="length">Along room length</option><option value="width">Along room width</option></select></div></div>
      <div class="row"><div class="field"><label>Available roll length (ft) · optional</label><input id="sheetAvailFt112" type="number" min="0" placeholder="90"></div><div class="field"><label>Available inches</label><input id="sheetAvailIn112" type="number" min="0" max="11.99" placeholder="0"></div></div>
      <div id="sheetMaterialHint112" class="note"></div>

      <details class="subdetails"><summary>SHEET CUT / PATTERN RULES</summary>
        <div class="row"><div class="field"><label>End trim allowance / end (in)</label><input id="sheetEndTrim112" type="number" value="3" min="0" step="0.25"></div><div class="field"><label>Seam-edge trim / sheet side (in)</label><input id="sheetEdgeTrim112" type="number" value="0" min="0" step="0.125"></div></div>
        <div class="row"><div class="field"><label>Pattern match</label><select id="sheetMatch112"><option value="none">No repeat / random</option><option value="set">Set / straight match</option><option value="drop">Drop / offset match</option></select></div><div class="field"><label>Length pattern repeat (in)</label><input id="sheetRepeat112" type="number" value="0" min="0" step="0.25"></div></div>
        <div class="row"><div class="field"><label>Reserve / additional sheet</label><select id="sheetReserve112"><option value="0">0 repeat</option><option value="0.5">0.5 repeat</option><option value="1" selected>1.0 repeat · conservative</option><option value="1.5">1.5 repeats</option></select></div><div class="field"><label>Sheet orientation rule</label><select id="sheetOrientation112"><option value="manufacturer">Follow product data</option><option value="same">All sheets same direction</option><option value="reverse">Reverse adjacent sheets</option></select></div></div>
        <div class="field"><label>Order rounding</label><select id="sheetRound112"><option value="0">No extra roll rounding</option><option value="0.5">Round up to next 0.5 ft</option><option value="1">Round up to next 1 ft</option></select></div>
        <div class="note">The default 3 in end allowance is a practical commercial-sheet planning allowance, not a universal rule. Edge trim and pattern handling vary by product; use the exact manufacturer data when known.</div>
      </details>

      <details class="subdetails"><summary>SEAM / WELD ASSIST</summary>
        <div class="row"><div class="field"><label>Seam treatment</label><select id="sheetSeamMethod112"><option value="none">Net-fit / no weld estimate</option><option value="heat">Heat weld rod</option><option value="cold">Cold weld / seam sealer</option></select></div><div class="field"><label>Seam extra (%)</label><input id="sheetSeamExtra112" type="number" value="10" min="0" step="1"></div></div>
        <div class="row"><div class="field"><label>Weld rod roll length (ft)</label><input id="sheetRodRoll112" type="number" value="165" min="0" step="1"></div><div class="field"><label>Adhesive transfer</label><button type="button" class="btn secondary" style="width:100%" onclick="useSheetAreaInAdhesive112()">USE FLOOR AREA IN ADHESIVE</button></div></div>
        <div class="note">Heat-weld rod is estimated from seam length plus the entered extra. 165 ft / 50 m is a common rod-roll size, but product packaging varies. Cold-weld quantity is shown as seam length only.</div>
      </details>
    </section>`);
  }
  sheetMaterialHint112();
  toggleSheetWidth112();
}

window.toggleSheetWidth112=function(){if(E12('sheetWidthCustom112'))E12('sheetWidthCustom112').disabled=E12('sheetWidth112')?.value!=='custom'};
window.sheetMaterialHint112=function(){
  const v=E12('sheetMaterial112')?.value||'commercial',box=E12('sheetMaterialHint112');if(!box)return;
  if(v==='linoleum')box.innerHTML='<b>Linoleum note:</b> many linoleum sheet systems require all sheets to run in the same direction. Welding may be optional unless project/code conditions require it. Verify the specific product instructions.';
  else if(v==='commercial')box.innerHTML='<b>Commercial vinyl note:</b> many products use alternating/reversed adjacent sheets and may require heat or cold welding. Product-specific instructions control.';
  else if(v==='residential')box.innerHTML='<b>Residential vinyl note:</b> multi-sheet rooms may need a seam treatment; follow the product seam and pattern instructions.';
  else box.textContent='Use the exact roll width, direction, seam and pattern rules from the product data when available.';
};

function sheetWidth112(){const v=E12('sheetWidth112')?.value||'6.56168';return v==='custom'?N12('sheetWidthCustom112'):(parseFloat(v)||0)}
function sheetPlan112(run,across,width,edgeTrim,endTrim,match,repeat,reserve){
  const usable=width-2*Math.max(0,edgeTrim)/12;if(usable<=0)return null;
  const sheets=C12(across/usable),raw=run+2*Math.max(0,endTrim)/12;
  let first=raw,extra=raw;
  if(match!=='none'&&repeat>0){first=C12(raw*12/repeat)*repeat/12;extra=first+Math.max(0,reserve)*repeat/12;}
  const lf=first+Math.max(0,sheets-1)*extra;
  const seamCount=Math.max(0,sheets-1),seamBase=seamCount*run;
  const lastFill=Math.max(0,across-(sheets-1)*usable);
  return{sheets,raw,first,extra,lf,seamCount,seamBase,usable,lastFill,run,across};
}
function chooseSheetPlan112(L,W,width,R){
  const A=sheetPlan112(L,W,width,R.edge,R.end,R.match,R.repeat,R.reserve),B=sheetPlan112(W,L,width,R.edge,R.end,R.match,R.repeat,R.reserve),pref=E12('sheetRun112')?.value||'auto';
  if(pref==='length')return{p:A,label:'Along room length',alt:B};
  if(pref==='width')return{p:B,label:'Along room width',alt:A};
  if(A&&B){const p=Math.abs(A.lf-B.lf)<1e-9?(A.seamCount<=B.seamCount?A:B):(A.lf<B.lf?A:B);return{p,label:p===A?'Along room length':'Along room width',alt:p===A?B:A};}
  const p=A||B;return{p,label:p===A?'Along room length':'Along room width',alt:null};
}
function sheetCutList112(p,orientationRule){
  const arr=[];for(let i=0;i<p.sheets;i++)arr.push({n:i+1,len:i===0?p.first:p.extra,orientation:orientationRule==='reverse'?(i%2===0?'A / forward':'B / reversed'):orientationRule==='same'?'same direction':'follow product data'});return arr;
}
function sheetCutHtml112(p,width,orientationRule,roundExtra){
  const cuts=sheetCutList112(p,orientationRule);
  const rows=cuts.map(c=>'<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)"><span>Sheet '+c.n+' · '+esc12(c.orientation)+'</span><b>'+esc12(ftin12(c.len))+'</b></div>').join('');
  return '<div style="margin-top:12px;padding:11px;border:1px solid var(--line);border-radius:12px;background:#0b1219"><b>SHEET CUT LIST</b><div class="note">Roll width '+esc12(F12(width))+' ft · usable width '+esc12(F12(p.usable))+' ft · last fill ≈ '+esc12(F12(p.lastFill))+' ft</div>'+rows+(roundExtra>0?'<div class="note">Order-rounding reserve: <b>'+esc12(F12(roundExtra))+' lf</b>.</div>':'')+'</div>';
}

window.useSheetAreaInAdhesive112=function(){
  const a=window.__runluSheetNetArea112;if(!a)return alert('Calculate a sheet-goods job first.');
  setType('adhesive');E12('adhArea').value=Math.round(a*100)/100;E12('adhesivePanel')?.scrollIntoView({behavior:'smooth',block:'start'});
};

function calcSheet112(){
  try{
    const L=dim12('Lft','Lin'),W=dim12('Wft','Win'),width=sheetWidth112();if(L<=0||W<=0)return alert('Enter room dimensions.');if(width<=0)return alert('Enter a valid roll width.');
    const R={end:N12('sheetEndTrim112'),edge:N12('sheetEdgeTrim112'),match:E12('sheetMatch112')?.value||'none',repeat:N12('sheetRepeat112'),reserve:N12('sheetReserve112')};
    if(R.match!=='none'&&R.repeat<=0)return alert('Enter the pattern repeat, or choose No repeat / random.');
    const chosen=chooseSheetPlan112(L,W,width,R),p=chosen.p;if(!p)return alert('Unable to build a sheet layout with the current width and trim settings.');
    const inc=N12('sheetRound112'),plannedLf=p.lf,orderLf=inc>0?C12(plannedLf/inc)*inc:plannedLf,roundExtra=Math.max(0,orderLf-plannedLf),orderSf=orderLf*width,orderSy=orderSf/9,net=L*W,wastePct=Math.max(0,(orderSf-net)/net*100);
    const seamMethod=E12('sheetSeamMethod112')?.value||'none',seamExtra=N12('sheetSeamExtra112'),seamReq=p.seamBase*(1+seamExtra/100),rodRoll=N12('sheetRodRoll112'),rodQty=seamMethod==='heat'&&seamReq>0&&rodRoll>0?C12(seamReq/rodRoll):0;
    const av=dim12('sheetAvailFt112','sheetAvailIn112'),remain=av>0&&av>=plannedLf?av-plannedLf:0;
    const family=E12('sheetMaterial112')?.selectedOptions?.[0]?.textContent||'Sheet goods',orientationRule=E12('sheetOrientation112')?.value||'manufacturer';
    const matchLabel=R.match==='set'?'SET / STRAIGHT':R.match==='drop'?'DROP / OFFSET':'NO REPEAT / RANDOM';
    const seamLabel=seamMethod==='heat'?'Heat weld rod':seamMethod==='cold'?'Cold weld / seam sealer':'Net fit / no weld';
    const items=[['Material',family],['Layout',chosen.label],['Sheets',String(p.sheets)],['Roll width',F12(width)+' ft'],['Usable width',F12(p.usable)+' ft'],['First cut',ftin12(p.first)],['Additional cut',p.sheets>1?ftin12(p.extra):'—'],['Seams',String(p.seamCount)],['Seam length',F12(p.seamBase)+' lf'],['Order length',ftin12(orderLf)],['Order area',F12(orderSy)+' sy'],['Net floor',F12(net/9)+' sy'],['Planning waste',F12(wastePct,1)+'%'],['Pattern',matchLabel],['Seam treatment',seamLabel]];
    if(seamMethod==='heat'){items.push(['Weld rod need',F12(seamReq)+' lf'],['Weld rod rolls',rodQty>0?String(rodQty):'Enter roll size']);}
    else if(seamMethod==='cold')items.push(['Cold-weld seam length',F12(seamReq)+' lf']);
    if(chosen.alt)items.push(['Other direction',ftin12(chosen.alt.lf)+' · '+chosen.alt.sheets+' sheet'+(chosen.alt.sheets===1?'':'s')]);
    if(av>0)items.push(['Roll available',ftin12(av)],['After listed cuts',av>=plannedLf?ftin12(remain):'SHORT '+ftin12(plannedLf-av)]);
    const orientText=orientationRule==='same'?'all sheets same direction':orientationRule==='reverse'?'reverse adjacent sheets':'follow product/manufacturer direction data';
    let note='<b>Sheet direction:</b> '+esc12(orientText)+'. End trim, seam-edge trimming, pattern reserve and seam treatment are planning inputs; verify the exact product instructions before cutting. '+(R.match==='drop'?'<b>Offset/drop patterns can require product-specific cut sequencing.</b> ':'')+sheetCutHtml112(p,width,orientationRule,roundExtra)+'<button type="button" class="btn secondary" style="width:100%;margin-top:10px" onclick="useSheetAreaInAdhesive112()">USE FLOOR AREA IN ADHESIVE</button>';
    show('Sheet Vinyl / Linoleum',ftin12(orderLf),'roll length',items,note);
    const totals=[{key:'Sheet goods',value:orderLf,unit:'lf'},{key:'Sheet goods material',value:orderSy,unit:'sy'}];
    if(seamMethod==='heat'&&rodQty>0)totals.push({key:'Weld rod',value:rodQty,unit:'rolls'});if(p.seamBase>0)totals.push({key:'Sheet seams',value:seamReq,unit:'lf'});
    setCurrentResult({type:'sheetgoods',title:'Sheet Vinyl / Linoleum',primary:ftin12(orderLf)+' · '+F12(orderSy)+' sy',defaultName:'Sheet goods room',totals});
    window.__runluSheetNetArea112=net;saveLast();
  }catch(err){console.error(err);const eng=E12('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc12(err.message||err)}alert('Calculation error: '+(err.message||err));
  }
}

window.setType=function(t){
  setTypeV111(t);
  const panel=E12('sheetgoodsPanel');if(panel)panel.classList.toggle('hidden',t!=='sheetgoods');
  if(t==='sheetgoods'){
    E12('roomCard')?.classList.remove('hidden');
    E12('nextBtn').textContent='+ NEW SHEET CALC';
    E12('result')?.classList.add('hidden');
    E12('resultActions')?.classList.add('hidden');
    if(typeof updatePresetList==='function')updatePresetList();
  }
};

window.calculate=function(){if(type==='sheetgoods')return calcSheet112();return calcV111();};
window.nextJob=function(){
  if(type!=='sheetgoods')return nextV111();
  E12('result')?.classList.add('hidden');E12('resultActions')?.classList.add('hidden');currentResult=null;['Lft','Lin','Wft','Win'].forEach(id=>{if(E12(id))E12(id).value=''});window.__runluSheetNetArea112=0;E12('Lft')?.focus();
};
window.state=function(){
  const s=stateV111();
  return Object.assign(s,{sheetMaterial112:E12('sheetMaterial112')?.value||'commercial',sheetWidth112:E12('sheetWidth112')?.value||'6.56168',sheetWidthCustom112:E12('sheetWidthCustom112')?.value||'6.56168',sheetRun112:E12('sheetRun112')?.value||'auto',sheetEndTrim112:E12('sheetEndTrim112')?.value||'3',sheetEdgeTrim112:E12('sheetEdgeTrim112')?.value||'0',sheetMatch112:E12('sheetMatch112')?.value||'none',sheetRepeat112:E12('sheetRepeat112')?.value||'0',sheetReserve112:E12('sheetReserve112')?.value||'1',sheetOrientation112:E12('sheetOrientation112')?.value||'manufacturer',sheetRound112:E12('sheetRound112')?.value||'0',sheetSeamMethod112:E12('sheetSeamMethod112')?.value||'none',sheetSeamExtra112:E12('sheetSeamExtra112')?.value||'10',sheetRodRoll112:E12('sheetRodRoll112')?.value||'165'});
};
window.applyState=function(s,restoreType=true){
  applyStateV111(s,restoreType);
  const d={sheetMaterial112:'commercial',sheetWidth112:'6.56168',sheetWidthCustom112:'6.56168',sheetRun112:'auto',sheetEndTrim112:'3',sheetEdgeTrim112:'0',sheetMatch112:'none',sheetRepeat112:'0',sheetReserve112:'1',sheetOrientation112:'manufacturer',sheetRound112:'0',sheetSeamMethod112:'none',sheetSeamExtra112:'10',sheetRodRoll112:'165'};
  Object.keys(d).forEach(k=>{if(E12(k))E12(k).value=s&&s[k]!==undefined?s[k]:d[k]});toggleSheetWidth112();sheetMaterialHint112();
};
window.clearInputs=function(){
  clearV111();
  const d={sheetMaterial112:'commercial',sheetWidth112:'6.56168',sheetWidthCustom112:'6.56168',sheetRun112:'auto',sheetAvailFt112:'',sheetAvailIn112:'',sheetEndTrim112:'3',sheetEdgeTrim112:'0',sheetMatch112:'none',sheetRepeat112:'0',sheetReserve112:'1',sheetOrientation112:'manufacturer',sheetRound112:'0',sheetSeamMethod112:'none',sheetSeamExtra112:'10',sheetRodRoll112:'165'};
  Object.keys(d).forEach(k=>{if(E12(k))E12(k).value=d[k]});toggleSheetWidth112();sheetMaterialHint112();window.__runluSheetNetArea112=0;
};

function enhanceV112(){
  enhanceSheet112();
  document.title='RUNLU Field Calculator · V1.12 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.12 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Seven flooring calculators. V1.12 adds Sheet Vinyl / Linoleum roll planning, seams and weld assist while keeping visual carpet, plank/tile, wall-base and stair tools.';
  const eng=E12('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.12 sheet-goods + existing field tools are active.';
}

try{
  const R={end:3,edge:0,match:'none',repeat:0,reserve:1};
  const t=chooseSheetPlan112(10,14,6.56168,R);if(!t.p||t.p.sheets!==2||Math.abs(t.p.lf-29)>.001)throw new Error('V1.12 sheet-goods self-test failed');
  const weld=10*(1.10);if(C12(weld/165)!==1)throw new Error('V1.12 weld-rod self-test failed');
  enhanceV112();
}catch(err){console.error(err);const eng=E12('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc12(err.message||err)}}
})();
