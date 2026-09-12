(function(){
'use strict';
const calcV18=window.calculate;

function el19(id){return document.getElementById(id)}
function num19(id){return parseFloat(el19(id)?.value)||0}
function dim19(ftId,inId){return num19(ftId)+num19(inId)/12}
function esc19(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function fmt19(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}
function ftin19(x){let ft=Math.floor(Math.max(0,x)+1e-9),i=Math.round((x-ft)*48)/4;if(i>=12){ft++;i=0}return ft+"' "+fmt19(i,2)+'"'}

function ensureV19Style(){
  if(el19('runluV19Style'))return;
  const st=document.createElement('style');st.id='runluV19Style';st.textContent=`
  .rollviz{margin-top:14px;border:1px solid var(--line);border-radius:14px;background:#0a1118;overflow:hidden}
  .rollviz-head{padding:12px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .rollviz-head b{font-size:12px;letter-spacing:.08em}.rollviz-head span{font-size:10px;color:var(--muted);text-align:right}
  .rollviz-scroll{max-height:610px;overflow:auto;padding:10px;background:linear-gradient(90deg,#0c141d,#0a1118)}
  .rollviz-ruler{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin:0 2px 6px}
  .rollcut{position:relative;border:1px solid #45657e;border-radius:9px;margin:0 auto 8px;min-height:58px;overflow:hidden;background:#0d1a25}
  .rollcut-use{position:absolute;top:0;bottom:0;background:linear-gradient(145deg,#19334a,#152b3d);border-right:1px solid #75bff4}
  .rollcut-unused{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(135deg,#111a23 0,#111a23 7px,#17222d 7px,#17222d 14px)}
  .rollcut-label{position:relative;z-index:2;padding:8px 9px;text-shadow:0 1px 2px #000;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
  .rollcut-label strong{font-size:11px}.rollcut-label span{font-size:10px;color:#d5e5f2;text-align:right}
  .rollcut-sub{position:relative;z-index:2;padding:0 9px 8px;font-size:9px;color:var(--muted)}
  .rollviz-zone{font-size:10px;font-weight:800;letter-spacing:.06em;color:#dbe9f6;margin:10px 2px 5px}
  .rollviz-summary{padding:10px 12px;border-top:1px solid var(--line);font-size:10px;color:var(--muted);line-height:1.5}
  .rollviz-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:7px}.rollviz-key{display:flex;align-items:center;gap:5px}.rollviz-dot{width:10px;height:10px;border-radius:2px;border:1px solid #45657e}.rollviz-dot.used{background:#19334a}.rollviz-dot.unused{background:repeating-linear-gradient(135deg,#111a23 0,#111a23 3px,#17222d 3px,#17222d 6px)}
  .rollviz-warn{margin-top:10px;padding:9px 10px;border-radius:10px;border:1px solid #6f5d32;background:#1e1a10;color:#ffe2a7;font-size:10px;line-height:1.45}
  `;document.head.appendChild(st);
}

function activeAxis(){
  const pile=el19('pileDir')?.value||'any';
  if(pile==='length'||pile==='width')return pile;
  const active=document.querySelector('#orient button.active');
  const txt=(active?.textContent||'').toUpperCase();
  if(txt.includes('RUN LENGTH'))return 'length';
  if(txt.includes('RUN WIDTH'))return 'width';
  return 'auto';
}

function getRules19(){return{
  match:el19('patternMatch')?.value||'none',rep:num19('pattern'),allow:num19('allowance'),edge:num19('edgeTrim'),reserve:num19('patternReserve'),seams:!!el19('seams')?.checked
}}

function getZones19(){
  const L=dim19('Lft','Lin'),W=dim19('Wft','Win');if(L<=0||W<=0)return[];
  const mode=el19('carpetShape')?.value||'rectangle';
  const z=[{label:'Main room',L,W,rot:false}];
  if(mode!=='rectangle'){
    const L2=dim19('ZLft','ZLin'),W2=dim19('ZWft','ZWin');
    if(L2>0&&W2>0)z.push({label:(el19('zone2Name')?.value||'').trim()||(mode==='closet'?'Closet':'Zone 2'),L:L2,W:W2,rot:el19('zoneRotation')?.value==='90'});
  }
  return z;
}

function zplan19(z,axis,r,R){
  const A=carpetLayout(z.L,z.W,r,R.rep,R.allow,R.seams,R.edge,R.match,R.reserve);
  const B=carpetLayout(z.W,z.L,r,R.rep,R.allow,R.seams,R.edge,R.match,R.reserve);
  let useA=axis==='length';if(z.rot)useA=!useA;
  const p=useA?A:B;if(!p)return null;
  const across=useA?z.W:z.L, run=useA?z.L:z.W;
  const lastFill=Math.max(0,across-(p.drops-1)*p.usableWidth);
  return Object.assign({},p,{label:z.label,across,run,lastFill,axisUsed:useA?'length':'width'});
}
function agg19(zones,axis,r,R){
  const plans=[];for(const z of zones){const p=zplan19(z,axis,r,R);if(!p)return null;plans.push(p)}
  return{axis,plans,lf:plans.reduce((a,p)=>a+p.lf,0),seams:plans.reduce((a,p)=>a+p.seamCount,0)};
}
function pick19(zones,r,R){
  const A=agg19(zones,'length',r,R),B=agg19(zones,'width',r,R),axis=activeAxis();
  if(axis==='length')return A;if(axis==='width')return B;
  if(A&&B){if(Math.abs(A.lf-B.lf)<1e-9)return A.seams<=B.seams?A:B;return A.lf<B.lf?A:B}
  return A||B;
}

function cuts19(plan,r){
  const cuts=[];let global=1;
  plan.plans.forEach(p=>{
    for(let i=0;i<p.drops;i++){
      const last=i===p.drops-1;
      const used=last?p.lastFill:Math.min(p.usableWidth,p.across);
      cuts.push({n:global++,zone:p.label,zoneCut:i+1,len:i===0?p.first:p.extraCut,usedWidth:Math.max(0,Math.min(r,used)),usableWidth:p.usableWidth,last,axis:p.axisUsed});
    }
  });return cuts;
}

function copyCutList19(){
  const d=window.__runluRollDiagramV19;if(!d)return alert('Calculate a carpet job first.');
  const lines=['RUNLU Carpet Cut List',`Roll width: ${fmt19(d.r)} ft`,`Direction: ${d.plan.axis==='length'?'main room length':'main room width'}`];
  d.cuts.forEach(c=>lines.push(`Cut ${c.n} · ${c.zone}: ${ftin19(c.len)} · use approx ${fmt19(c.usedWidth)} ft of width`));
  lines.push(`Planned cut length: ${ftin19(d.plan.lf)}`,'Planning aid only — verify seam placement, pattern and field conditions before cutting.');
  const text=lines.join('\n');
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>alert('Cut list copied.')).catch(()=>fallbackCopy19(text)); else fallbackCopy19(text);
}
function fallbackCopy19(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Cut list copied.');}
window.copyCarpetCutListV19=copyCutList19;

function renderDiagram19(){
  if(type!=='carpet')return;
  const result=el19('result');if(!result||result.classList.contains('hidden'))return;
  if((result.textContent||'').includes('NO FIT'))return;
  const zones=getZones19(),r=roll(),R=getRules19();if(!zones.length||r<=0)return;
  const plan=pick19(zones,r,R);if(!plan)return;
  const cuts=cuts19(plan,r);if(!cuts.length)return;
  ensureV19Style();
  result.querySelector('#rollCutDiagramV19')?.remove();
  const maxLen=Math.max(...cuts.map(c=>c.len),1),edgePct=Math.max(0,Math.min(20,(R.edge/12)/r*100));
  let lastZone='';
  const cards=cuts.map(c=>{
    const zoneTitle=c.zone!==lastZone?`<div class="rollviz-zone">${esc19(c.zone)} · ${esc19(c.axis==='length'?'run length':'run width')}</div>`:'';lastZone=c.zone;
    const h=Math.max(62,Math.min(128,54+c.len/maxLen*66));
    const usableLeft=edgePct,usedPct=Math.max(2,Math.min(100-usableLeft,c.usedWidth/r*100));
    const unusedLeft=Math.min(100,usableLeft+usedPct),unusedPct=Math.max(0,100-unusedLeft-edgePct);
    const partial=c.usedWidth+0.01<Math.min(c.usableWidth,r);
    return `${zoneTitle}<div class="rollcut" style="height:${h}px;width:100%">
      ${edgePct>0?`<div class="rollcut-unused" style="left:0;width:${edgePct}%"></div>`:''}
      <div class="rollcut-use" style="left:${usableLeft}%;width:${usedPct}%"></div>
      ${unusedPct>0?`<div class="rollcut-unused" style="left:${unusedLeft}%;width:${unusedPct}%"></div>`:''}
      ${edgePct>0?`<div class="rollcut-unused" style="right:0;width:${edgePct}%"></div>`:''}
      <div class="rollcut-label"><strong>CUT ${c.n}</strong><span>${esc19(ftin19(c.len))}</span></div>
      <div class="rollcut-sub">${esc19(c.zone)} · planned width ${esc19(fmt19(c.usedWidth))} ft${partial?' · partial-width fill':''}</div>
    </div>`;
  }).join('');
  const av=dim19('availFt','availIn'),balance=av>0?av-plan.lf:null;
  const stock=av>0?(balance>=0?`Stock check: ${ftin19(av)} available → about <b>${ftin19(balance)}</b> remains after listed cuts.`:`Stock check: ${ftin19(av)} available → <b>SHORT ${ftin19(-balance)}</b> against listed cuts.`):'No stock-roll length entered; diagram shows planned cuts only.';
  const html=`<div id="rollCutDiagramV19" class="rollviz">
    <div class="rollviz-head"><div><b>VISUAL ROLL CUT DIAGRAM</b><div class="note">Cut order shown top → bottom.</div></div><span>${esc19(fmt19(r))} ft roll<br>${esc19(cuts.length)} cut${cuts.length===1?'':'s'} · ${esc19(ftin19(plan.lf))}</span></div>
    <div class="rollviz-scroll">
      <div class="rollviz-ruler"><span>0</span><span>ROLL WIDTH ${esc19(fmt19(r))} FT</span><span>${esc19(fmt19(r))}'</span></div>
      ${cards}
    </div>
    <div class="rollviz-summary">${stock}<div class="rollviz-legend"><span class="rollviz-key"><i class="rollviz-dot used"></i>planned material</span><span class="rollviz-key"><i class="rollviz-dot unused"></i>cross-width trim / offcut</span></div>
      <div class="rollviz-warn"><b>Planning aid:</b> this diagram shows conservative full-width shots in sequence. It does not automatically nest offcuts, create T-seams, model doorway seam locations, or correct real-world bow/skew/pattern distortion.</div>
      <button type="button" class="btn secondary" style="width:100%;margin-top:10px" onclick="copyCarpetCutListV19()">COPY CUT LIST</button>
    </div>
  </div>`;
  result.insertAdjacentHTML('beforeend',html);
  window.__runluRollDiagramV19={r,plan,cuts};
}

window.calculate=function(){
  const ret=calcV18();
  if(type==='carpet')setTimeout(renderDiagram19,0);
  return ret;
};

function enhanceV19(){
  ensureV19Style();
  document.title='RUNLU Field Calculator · V1.9 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.9 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Six flooring calculators. No login. V1.9 adds a visual carpet roll cut diagram on top of room-shape, pattern, remnant and sales-assist planning.';
  const tab=document.querySelector('[data-type="carpet"] span');if(tab)tab.textContent='roll · cuts · pattern · visual plan';
  const checklist=el19('carpetFieldChecklist');if(checklist&&!el19('v19SalesNote'))checklist.insertAdjacentHTML('afterend','<div id="v19SalesNote" class="note" style="margin-top:8px">Sales tip: calculate first, then read the <b>Visual Roll Cut Diagram</b> from top to bottom as the proposed warehouse cut sequence.</div>');
  const eng=el19('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.9 visual carpet cut planning is active.';
}

try{
  const R={match:'none',rep:0,allow:3,edge:0,reserve:1,seams:true};
  const t=pick19([{label:'Test',L:12,W:14,rot:false}],12,R);
  if(!t||Math.abs(t.lf-14.5)>.001||cuts19(t,12).length!==1)throw new Error('V1.9 roll diagram self-test failed');
  enhanceV19();
}catch(e){console.error(e);const eng=el19('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc19(e.message||e)}}
})();