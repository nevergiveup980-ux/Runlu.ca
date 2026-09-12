(function(){
'use strict';
const calcV17=window.calculate;
const stateV17=window.state;
const applyStateV17=window.applyState;
const clearV17=window.clearInputs;
const nextV17=window.nextJob;

function el(id){return document.getElementById(id)}
function val(id){return parseFloat(el(id)?.value)||0}
function d2(ftId,inId){return val(ftId)+val(inId)/12}
function esc18(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function enhanceCarpetV18(){
  const panel=el('carpetPanel');
  if(!panel || el('carpetShapeBox')) return;
  const advanced=panel.querySelector('details.subdetails');
  const html=`<details id="carpetShapeBox" class="subdetails">
    <summary>ROOM SHAPE / SALES ASSIST</summary>
    <div class="field"><label>Room shape</label><select id="carpetShape" onchange="updateCarpetShapeFields()"><option value="rectangle">Rectangle</option><option value="twozone">L-shape / two connected rectangles</option><option value="closet">Room + closet</option></select></div>
    <div id="zone2Fields" class="hidden">
      <div class="field"><label id="zone2Title">Zone 2</label><input id="zone2Name" type="text" placeholder="e.g. Return / Closet"></div>
      <div class="row"><div class="field"><label>Zone 2 length (ft)</label><input id="ZLft" type="number" inputmode="decimal" min="0" placeholder="6"></div><div class="field"><label>Length (in)</label><input id="ZLin" type="number" inputmode="decimal" min="0" max="11.99" placeholder="0"></div></div>
      <div class="row"><div class="field"><label>Zone 2 width (ft)</label><input id="ZWft" type="number" inputmode="decimal" min="0" placeholder="4"></div><div class="field"><label>Width (in)</label><input id="ZWin" type="number" inputmode="decimal" min="0" max="11.99" placeholder="0"></div></div>
      <div class="row"><div class="field"><label>Zone 2 axes</label><select id="zoneRotation"><option value="0">Parallel to main room</option><option value="90">Rotated 90°</option></select></div><div class="field"><label>Shared opening / connected edge (ft)</label><input id="sharedOpening" type="number" min="0" step="0.25" value="0"></div></div>
      <div id="shapeHint" class="note"></div>
    </div>
    <div class="field"><label>Order rounding</label><select id="carpetOrderRound"><option value="0">No extra roll rounding</option><option value="0.5">Round total up to next 0.5 ft</option><option value="1">Round total up to next 1 ft</option></select></div>
    <div class="note"><b>Sales assist:</b> multi-zone calculations keep one common pile/run direction and estimate each rectangle conservatively. This is not an automatic room-nesting/T-seam optimizer.</div>
  </details>`;
  if(advanced) advanced.insertAdjacentHTML('beforebegin',html); else panel.insertAdjacentHTML('beforeend',html);
  updateCarpetShapeFields();
  document.title='RUNLU Field Calculator · V1.8 Online Test';
  const ver=document.querySelector('.ver'); if(ver) ver.textContent='V1.8 · ONLINE TEST';
  const hero=document.querySelector('.hero p'); if(hero) hero.textContent='Six flooring calculators. No login. V1.8 adds carpet room shapes, simple cut sheets and a copy-ready sales summary.';
  const eng=el('engine'); if(eng && eng.classList.contains('ok')) eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.8 carpet shape + cut-sheet planning are active.';
}

window.updateCarpetShapeFields=function(){
  const mode=el('carpetShape')?.value||'rectangle';
  const box=el('zone2Fields'); if(box) box.classList.toggle('hidden',mode==='rectangle');
  const title=el('zone2Title'), name=el('zone2Name'), hint=el('shapeHint');
  if(mode==='closet'){
    if(title) title.textContent='Closet / secondary area label';
    if(name) name.placeholder='e.g. Walk-in closet';
    if(hint) hint.textContent='Enter the closet as a second non-overlapping rectangle. Use Rotated 90° if its length/width axes turn relative to the main room.';
  } else if(mode==='twozone'){
    if(title) title.textContent='Second rectangle label';
    if(name) name.placeholder='e.g. L-return';
    if(hint) hint.textContent='Split the L-shape into two non-overlapping rectangles. Both rectangles share one global carpet direction; choose Rotated 90° when the second rectangle axes turn.';
  }
};

function rules(){
  return {
    match:el('patternMatch')?.value||'none', rep:val('pattern'), allow:val('allowance'), edge:val('edgeTrim'), reserve:val('patternReserve'), seams:!!el('seams')?.checked,
    pile:el('pileDir')?.value||'any', install:el('carpetInstall')?.value||'stretch', noTack:val('noTackOpening'), tackWaste:val('tackWaste'), seamWaste:val('seamWaste'), minRemnant:val('minRemnant')
  };
}

function zonesFromUI(){
  const L=d2('Lft','Lin'), W=d2('Wft','Win');
  if(L<=0||W<=0) return {error:'Enter the main room dimensions.'};
  const mode=el('carpetShape')?.value||'rectangle';
  const zones=[{label:'Main room',L,W,rot:false}];
  let shared=0;
  if(mode!=='rectangle'){
    const L2=d2('ZLft','ZLin'),W2=d2('ZWft','ZWin');
    if(L2<=0||W2<=0) return {error:'Enter the second zone / closet dimensions.'};
    const label=(el('zone2Name')?.value||'').trim() || (mode==='closet'?'Closet':'Zone 2');
    zones.push({label,L:L2,W:W2,rot:(el('zoneRotation')?.value==='90')});
    shared=Math.max(0,val('sharedOpening'));
  }
  return {zones,shared,mode};
}

function zonePlan(z,axis,r,R){
  const A=carpetLayout(z.L,z.W,r,R.rep,R.allow,R.seams,R.edge,R.match,R.reserve);
  const B=carpetLayout(z.W,z.L,r,R.rep,R.allow,R.seams,R.edge,R.match,R.reserve);
  let useA=(axis==='length');
  if(z.rot) useA=!useA;
  const p=useA?A:B;
  if(!p) return null;
  const run=useA?z.L:z.W, across=useA?z.W:z.L;
  const lastFill=Math.max(0,across-(p.drops-1)*p.usableWidth);
  return Object.assign({},p,{label:z.label,run,across,axisUsed:useA?'length':'width',lastFill});
}

function aggregate(zones,axis,r,R){
  const plans=[];
  for(const z of zones){const p=zonePlan(z,axis,r,R); if(!p)return null; plans.push(p)}
  const sum=k=>plans.reduce((a,p)=>a+(Number(p[k])||0),0);
  return {axis,plans,lf:sum('lf'),sf:sum('sf'),net:zones.reduce((a,z)=>a+z.L*z.W,0),seamCount:sum('seamCount'),seamBase:sum('seamBase'),drops:sum('drops')};
}

function choosePlan(zones,r,R){
  const length=aggregate(zones,'length',r,R), width=aggregate(zones,'width',r,R);
  let axis=orientation;
  if(R.pile==='length'||R.pile==='width') axis=R.pile;
  if(axis==='length') return {pick:length,alt:width,label:R.pile==='length'?'Pile direction · main room length':'Run along main room length'};
  if(axis==='width') return {pick:width,alt:length,label:R.pile==='width'?'Pile direction · main room width':'Run along main room width'};
  if(length&&width){
    const pick=Math.abs(length.lf-width.lf)<1e-9?(length.seamCount<=width.seamCount?length:width):(length.lf<width.lf?length:width);
    return {pick,alt:pick===length?width:length,label:pick===length?'Run along main room length':'Run along main room width'};
  }
  const pick=length||width; return {pick,alt:null,label:pick===length?'Run along main room length':'Run along main room width'};
}

function cutEntries(plan){
  const out=[];
  plan.plans.forEach(z=>{
    for(let i=0;i<z.drops;i++) out.push({zone:z.label,index:i+1,len:i===0?z.first:z.extraCut,lastFill:z.lastFill,drops:z.drops});
  });
  return out;
}

function cutSheetHtml(plan,r,roundReserve){
  const cuts=cutEntries(plan),max=Math.max(...cuts.map(c=>c.len),1),limit=18;
  let rows=cuts.slice(0,limit).map((c,i)=>{
    const pct=Math.max(18,Math.min(100,c.len/max*100));
    return `<div style="margin-top:7px"><div style="display:flex;justify-content:space-between;gap:8px;font-size:11px"><span>Cut ${i+1} · ${esc18(c.zone)}</span><b>${esc18(ftin(c.len))}</b></div><div style="height:5px;background:#263442;border-radius:999px;overflow:hidden;margin-top:4px"><div style="height:100%;width:${pct}%;background:var(--blue)"></div></div></div>`;
  }).join('');
  if(cuts.length>limit) rows+=`<div class="note">+ ${cuts.length-limit} more cuts not expanded on screen.</div>`;
  const fillNotes=plan.plans.map(p=>`${esc18(p.label)} last fill ≈ ${esc18(f(p.lastFill))} ft`).join(' · ');
  return `<div style="margin-top:12px;padding:11px;border:1px solid var(--line);border-radius:12px;background:#0b1219"><b>SIMPLE CUT SHEET</b><div class="note">Roll width ${esc18(f(r))} ft · ${cuts.length} full-width shot${cuts.length===1?'':'s'} · ${esc18(fillNotes)}</div>${rows}${roundReserve>0?`<div class="note">Order-rounding reserve: <b>${esc18(f(roundReserve))} lf</b> beyond listed cuts.</div>`:''}</div>`;
}

function buildSalesSummary(data){
  const lines=['RUNLU Carpet Sales Summary'];
  data.zones.forEach(z=>lines.push(`${z.label}: ${f(z.L)} × ${f(z.W)} ft`));
  lines.push(`Net floor area: ${f(data.net)} sf / ${f(data.net/9)} sy`);
  lines.push(`Carpet: ${f(data.orderLf)} lf / ${f(data.orderSy)} sy (${f(data.rollWidth)} ft roll)`);
  lines.push(`Cuts: ${data.cuts} · Seams: ${data.seams} · Seam tape est.: ${f(data.seamTape)} lf`);
  if(data.install==='stretch'){lines.push(`Pad net area: ${f(data.net)} sf`);lines.push(`Tack strip est.: ${f(data.tack)} lf`)} else lines.push('Install: direct glue');
  lines.push(`Pattern: ${data.patternLabel}`);
  lines.push(`Planning waste: ${f(data.wastePct,1)}%`);
  if(data.available>0) lines.push(`Stock roll: ${ftin(data.available)} available · ${data.available>=data.plannedLf?ftin(data.available-data.plannedLf)+' remaining':'SHORT '+ftin(data.plannedLf-data.available)}`);
  lines.push('Planning estimate — verify field conditions, seam placement, pattern behavior and manufacturer requirements before cutting/ordering.');
  return lines.join('\n');
}

window.copyCarpetSalesSummary=async function(){
  const text=window.__runluCarpetSalesSummaryV18;
  if(!text)return alert('Calculate a carpet job first.');
  try{await navigator.clipboard.writeText(text);alert('Sales summary copied.')}catch(e){
    const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Sales summary copied.');
  }
};

function calculateCarpetV18(){
  try{
    const shape=zonesFromUI(); if(shape.error)return alert(shape.error);
    const R=rules(),r=roll(); if(r<=0)return alert('Enter the carpet roll width.');
    if(R.match!=='none'&&R.rep<=0)return alert('Enter the carpet length pattern repeat, or choose Plain / random match.');
    const chosen=choosePlan(shape.zones,r,R),p=chosen.pick;
    if(!p)return show('Carpet','NO FIT','',[['Zones',String(shape.zones.length)],['Roll width',f(r)+' ft']],'<span style="color:var(--red)">No allowed full-length-drop layout fits the selected roll width, edge trim and seam rules.</span>');
    const inc=val('carpetOrderRound'),plannedLf=p.lf,orderLf=inc>0?Math.ceil((plannedLf-1e-10)/inc)*inc:plannedLf,roundReserve=Math.max(0,orderLf-plannedLf),orderSf=orderLf*r,orderSy=orderSf/9;
    const seamTape=p.seamBase*(1+R.seamWaste/100),net=p.net;
    const rawPerim=shape.zones.reduce((a,z)=>a+2*(z.L+z.W),0),connectedPerim=Math.max(0,rawPerim-2*shape.shared),tack=R.install==='stretch'?Math.max(0,connectedPerim-R.noTack)*(1+R.tackWaste/100):0;
    const av=dim('availFt','availIn'),remain=av>0&&av>=plannedLf?av-plannedLf:0;
    const matchLabel=R.match==='set'?'SET / STRAIGHT':R.match==='drop'?'DROP / HALF-DROP':'PLAIN / RANDOM';
    const wastePct=net>0?Math.max(0,(orderSf-net)/net*100):0;
    const items=[['Layout',chosen.label],['Zones',String(shape.zones.length)],['Cuts / drops',String(p.drops)],['Seams',String(p.seamCount)],['Order',f(orderSy)+' sy'],['Order length',ftin(orderLf)],['Net floor',f(net/9)+' sy'],['Planning waste',f(wastePct,1)+'%'],['Pattern',matchLabel],['Trim allowance',f(R.allow)+' in / end'],['Seam tape est.',f(seamTape)+' lf']];
    if(roundReserve>0)items.push(['Order rounding',f(roundReserve)+' extra lf']);
    if(R.install==='stretch')items.push(['Pad net area',f(net)+' sf'],['Tack strip est.',f(tack)+' lf']);else items.push(['Install method','Direct glue']);
    if(chosen.alt)items.push(['Other direction',ftin(chosen.alt.lf)+' · '+chosen.alt.seamCount+' seam'+(chosen.alt.seamCount===1?'':'s')]);
    if(av>0){items.push(['Roll available',ftin(av)],['After job',av>=plannedLf?ftin(remain):'SHORT '+ftin(plannedLf-av)]);if(av>=plannedLf)items.push(['Leftover status',remain>=R.minRemnant?'REUSABLE':'BELOW '+f(R.minRemnant)+' ft MIN'])}
    const zoneText=shape.zones.map(z=>`${esc18(z.label)} ${esc18(f(z.L))} × ${esc18(f(z.W))} ft`).join(' · ');
    const patternNote=R.match==='none'?'Plain/random-match planning.':'Patterned cuts are rounded by the length repeat; additional cuts use the selected reserve. '+(R.match==='drop'?'<b>Drop-match sequencing can change actual consumption.</b> ':'');
    const note=`<b>Areas:</b> ${zoneText}. ${patternNote}All zones use one common pile direction. Full-length parallel seams only; no automatic T-seams or cross-room nesting.${cutSheetHtml(p,r,roundReserve)}<button type="button" class="btn secondary" style="width:100%;margin-top:10px" onclick="copyCarpetSalesSummary()">COPY SALES SUMMARY</button><button type="button" class="btn secondary" style="width:100%;margin-top:8px" onclick="useCarpetAreaInUnderlay(${String(net)})">USE TOTAL AREA IN UNDERLAY</button>`;
    show('Carpet',ftin(orderLf),'linear',items,note);
    const summaryData={zones:shape.zones,net,orderLf,orderSy,rollWidth:r,cuts:p.drops,seams:p.seamCount,seamTape,install:R.install,tack,patternLabel:matchLabel,wastePct,available:av,plannedLf};
    window.__runluCarpetSalesSummaryV18=buildSalesSummary(summaryData);
    setCurrentResult({type:'carpet',title:'Carpet',primary:ftin(orderLf)+' linear · '+f(orderSy)+' sy',defaultName:shape.zones.length>1?'Carpet multi-zone':'Carpet room',remnantFt:remain>=R.minRemnant?remain:0,totals:[{key:'Carpet',value:orderLf,unit:'lf'},{key:'Carpet order area',value:orderSy,unit:'sy'},{key:'Seam tape',value:seamTape,unit:'lf'}].concat(R.install==='stretch'?[{key:'Pad net area',value:net,unit:'sf'},{key:'Tack strip',value:tack,unit:'lf'}]:[])});
    saveLast();
  }catch(e){console.error(e);const eng=el('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc18(e.message||e)}alert('Calculation error: '+(e.message||e))}
}

window.calculate=function(){if(type==='carpet')return calculateCarpetV18();return calcV17();};

window.state=function(){
  const s=stateV17();
  Object.assign(s,{carpetShape:el('carpetShape')?.value||'rectangle',zone2Name:el('zone2Name')?.value||'',ZLft:el('ZLft')?.value||'',ZLin:el('ZLin')?.value||'',ZWft:el('ZWft')?.value||'',ZWin:el('ZWin')?.value||'',zoneRotation:el('zoneRotation')?.value||'0',sharedOpening:el('sharedOpening')?.value||'0',carpetOrderRound:el('carpetOrderRound')?.value||'0'});
  return s;
};

window.applyState=function(s,restoreType=true){
  applyStateV17(s,restoreType);
  ['carpetShape','zone2Name','ZLft','ZLin','ZWft','ZWin','zoneRotation','sharedOpening','carpetOrderRound'].forEach(k=>{if(s&&s[k]!==undefined&&el(k))el(k).value=s[k]});
  updateCarpetShapeFields();
};

window.clearInputs=function(){
  clearV17();
  if(el('carpetShape'))el('carpetShape').value='rectangle';
  ['zone2Name','ZLft','ZLin','ZWft','ZWin'].forEach(k=>{if(el(k))el(k).value=''});
  if(el('zoneRotation'))el('zoneRotation').value='0';if(el('sharedOpening'))el('sharedOpening').value='0';if(el('carpetOrderRound'))el('carpetOrderRound').value='0';
  window.__runluCarpetSalesSummaryV18='';updateCarpetShapeFields();
};

window.nextJob=function(){
  nextV17();
  if(type==='carpet'){
    ['ZLft','ZLin','ZWft','ZWin','zone2Name'].forEach(k=>{if(el(k))el(k).value=''});
    if(el('sharedOpening'))el('sharedOpening').value='0';
  }
};

enhanceCarpetV18();
try{
  const testR={match:'none',rep:0,allow:3,edge:0,reserve:1,seams:true};
  const z=[{label:'A',L:12,W:14,rot:false},{label:'B',L:6,W:4,rot:false}];
  const t=aggregate(z,'length',12,testR);if(!t||Math.abs(t.lf-31.5)>.001)throw new Error('V1.8 multi-zone self-test failed');
}catch(e){const eng=el('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc18(e.message||e)}}
})();
