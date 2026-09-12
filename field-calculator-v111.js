(function(){
'use strict';
const calcV110=window.calculate;
const stateV110=window.state;
const applyStateV110=window.applyState;
const clearV110=window.clearInputs;
let floorMode111='plank';

function E(id){return document.getElementById(id)}
function N(id){return parseFloat(E(id)?.value)||0}
function F(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}
function C(x){return Math.ceil(x-1e-10)}
function esc111(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c))}

function enhanceFloor111(){
  const p=E('plankPanel');
  if(!p||E('floorModeChips111'))return;
  p.innerHTML=`
    <h3>MATERIAL · PLANK / TILE</h3>
    <div class="field"><label>Calculator</label><div class="chips" id="floorModeChips111"><button id="modePlank111" type="button" class="active" onclick="setFloorMode111('plank',this)">PLANK / LVP / LAMINATE</button><button id="modeTile111" type="button" onclick="setFloorMode111('tile',this)">TILE</button></div></div>

    <div id="plankFields111">
      <div class="row"><div class="field"><label>Coverage per box (sf)</label><input id="boxCov" type="number" value="23.8" step="0.01"></div><div class="field"><label>Waste (%)</label><input id="waste" type="number" value="10" step="0.5"></div></div>
      <div class="chips"><button type="button" onclick="setWaste(5)">5%</button><button type="button" onclick="setWaste(10)">10%</button><button type="button" onclick="setWaste(15)">15%</button></div>
      <details class="subdetails"><summary>PLANK LAYOUT ASSIST</summary>
        <div class="row"><div class="field"><label>Plank length (in)</label><input id="plankLen111" type="number" value="48" min="0" step="0.01"></div><div class="field"><label>Plank width (in)</label><input id="plankWid111" type="number" value="7" min="0" step="0.01"></div></div>
        <div class="row"><div class="field"><label>Expansion gap / wall (in)</label><input id="plankGap111" type="number" value="0.25" min="0" step="0.0625"></div><div class="field"><label>Minimum preferred edge row (in)</label><input id="plankMinRow111" type="number" value="2" min="0" step="0.25"></div></div>
        <div class="field"><label>Plank runs</label><select id="plankDir111"><option value="length">Along room length</option><option value="width">Along room width</option></select></div>
        <div class="note">Layout assist checks the first/last row width after the perimeter expansion gap. If the last row is too narrow, RUNLU suggests balancing the first and last rows. Manufacturer expansion/stagger rules still control.</div>
      </details>
    </div>

    <div id="tileFields111" class="hidden">
      <div class="row"><div class="field"><label>Coverage per box (sf)</label><input id="tileBoxCov111" type="number" value="16" step="0.01"></div><div class="field"><label>Waste (%)</label><input id="tileWaste111" type="number" value="10" step="0.5"></div></div>
      <div class="row"><div class="field"><label>Tile length (in)</label><input id="tileLen111" type="number" value="24" min="0" step="0.01"></div><div class="field"><label>Tile width (in)</label><input id="tileWid111" type="number" value="12" min="0" step="0.01"></div></div>
      <div class="row"><div class="field"><label>Grout joint (in)</label><input id="tileJoint111" type="number" value="0.125" min="0" step="0.03125"></div><div class="field"><label>Orientation</label><select id="tileOrient111"><option value="auto">Auto · fewer grid positions</option><option value="entered">As entered</option><option value="rotated">Rotate 90°</option></select></div></div>
      <div class="chips"><button type="button" onclick="setTileWaste111(5)">5%</button><button type="button" onclick="setTileWaste111(10)">10%</button><button type="button" onclick="setTileWaste111(15)">15%</button></div>
      <div class="note">Box quantity is based on room area + waste. Tile dimensions and grout joint are used for a centered layout check and approximate grid positions; actual cut reuse can reduce piece consumption.</div>
    </div>

    <details class="subdetails"><summary>WALL BASE / TRANSITIONS · QUICK ADD</summary>
      <label class="check"><input id="baseInclude111" type="checkbox"> Include wall base in this calculation</label>
      <div class="row" style="margin-top:10px"><div class="field"><label>Wall base preset</label><select id="basePreset111" onchange="toggleBaseCustom111()"><option value="120">4 in rubber wall base · 120 ft coil</option><option value="100">6 in rubber wall base · 100 ft roll · common</option><option value="120b">6 in rubber wall base · 120 ft coil · alternate</option><option value="custom">Custom roll / coil length</option></select></div><div class="field"><label>Custom roll length (ft)</label><input id="baseCustom111" type="number" value="120" min="0" step="1" disabled></div></div>
      <div class="row"><div class="field"><label>Doors / openings to subtract (ft)</label><input id="baseOpen111" type="number" value="0" min="0" step="0.25"></div><div class="field"><label>Base extra (%)</label><input id="baseExtra111" type="number" value="5" min="0" step="1"></div></div>
      <div class="note">Wall-base length uses the rectangular room perimeter minus entered openings. Presets include 4 in rubber at 120 ft/coil and 6 in rubber at 100 ft/roll, with a 120 ft 6 in option when that product is supplied that way.</div>
      <div style="height:1px;background:var(--line);margin:14px 0"></div>
      <div class="row"><div class="field"><label>Transition total length (ft) · optional</label><input id="transLF111" type="number" value="0" min="0" step="0.25"></div><div class="field"><label>Transition piece length (ft)</label><input id="transPiece111" type="number" value="8" min="0" step="0.25"></div></div>
      <div class="note">Transition piece length is user-defined because reducers, T-mouldings and thresholds vary by product.</div>
    </details>`;
  const tab=document.querySelector('[data-type="plank"] span');if(tab)tab.textContent='plank · tile · base · transitions';
}

window.setFloorMode111=function(mode,btn){
  floorMode111=mode==='tile'?'tile':'plank';
  document.querySelectorAll('#floorModeChips111 button').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');else E(floorMode111==='tile'?'modeTile111':'modePlank111')?.classList.add('active');
  E('plankFields111')?.classList.toggle('hidden',floorMode111!=='plank');
  E('tileFields111')?.classList.toggle('hidden',floorMode111!=='tile');
  E('result')?.classList.add('hidden');
};
window.setTileWaste111=function(v){if(E('tileWaste111'))E('tileWaste111').value=v};
window.toggleBaseCustom111=function(){if(E('baseCustom111'))E('baseCustom111').disabled=E('basePreset111')?.value!=='custom'};

function room111(){return{L:dim('Lft','Lin'),W:dim('Wft','Win')}}
function plankLayout111(L,W,plankL,plankW,gap,minRow,dir){
  const run=dir==='width'?W:L,across=dir==='width'?L:W;
  const runIn=Math.max(0,run*12-2*gap),acrossIn=Math.max(0,across*12-2*gap);
  if(runIn<=0||acrossIn<=0||plankL<=0||plankW<=0)return null;
  const rows=C(acrossIn/plankW);
  let last=acrossIn-(rows-1)*plankW;if(last<=0)last=plankW;
  let first=plankW,balanced=false;
  if(rows>1&&last<minRow){first=last=(plankW+last)/2;balanced=true;}
  const fullAlong=Math.floor(runIn/plankL),tail=runIn-fullAlong*plankL;
  return{run,across,runIn,acrossIn,rows,first,last,balanced,fullAlong,tail};
}
function edgePiece111(span,tile,joint){
  const n=Math.max(1,C((span+joint)/(tile+joint)));
  const full=n*tile+(n-1)*joint;
  const over=Math.max(0,full-span);
  const edge=n===1?Math.min(tile,span):Math.max(0,tile-over/2);
  return{n,edge};
}
function tileGrid111(L,W,TL,TW,J,rot){
  const a=rot?TW:TL,b=rot?TL:TW;
  const x=edgePiece111(L*12,a,J),y=edgePiece111(W*12,b,J);
  return{rot,tileL:a,tileW:b,nL:x.n,nW:y.n,pieces:x.n*y.n,edgeL:x.edge,edgeW:y.edge,minEdge:Math.min(x.edge,y.edge)};
}
function baseCalc111(L,W){
  if(!E('baseInclude111')?.checked)return null;
  const open=Math.max(0,N('baseOpen111')),extra=Math.max(0,N('baseExtra111'));
  let unit=0;const preset=E('basePreset111')?.value||'120';
  if(preset==='custom')unit=N('baseCustom111');else if(preset==='100')unit=100;else unit=120;
  if(unit<=0)return{error:'Enter a valid wall-base roll / coil length.'};
  const net=Math.max(0,2*(L+W)-open),required=net*(1+extra/100),qty=C(required/unit),left=qty*unit-required;
  const label=E('basePreset111')?.selectedOptions?.[0]?.textContent||'Wall base';
  return{net,required,qty,left,unit,label};
}
function transitionCalc111(){const lf=Math.max(0,N('transLF111')),piece=N('transPiece111');if(lf<=0)return null;if(piece<=0)return{error:'Enter a valid transition piece length.'};return{lf,piece,qty:C(lf/piece),left:C(lf/piece)*piece-lf}}

function calcFloor111(){
  try{
    const R=room111();if(R.L<=0||R.W<=0)return alert('Enter room dimensions.');
    const area=R.L*R.W,base=baseCalc111(R.L,R.W),trans=transitionCalc111();
    if(base?.error)return alert(base.error);if(trans?.error)return alert(trans.error);
    let items=[],totals=[],title='',primary='',note='';
    if(floorMode111==='plank'){
      const cov=N('boxCov'),w=N('waste'),pL=N('plankLen111'),pW=N('plankWid111'),gap=N('plankGap111'),minRow=N('plankMinRow111'),dir=E('plankDir111')?.value||'length';
      if(cov<=0)return alert('Enter coverage per box.');
      const need=area*(1+w/100),boxes=C(need/cov),actual=boxes*cov;
      const layout=plankLayout111(R.L,R.W,pL,pW,gap,minRow,dir);
      title='Plank / LVP';primary=boxes+' boxes';
      items=[['Net area',F(area)+' sf'],['With waste',F(need)+' sf'],['Coverage / box',F(cov)+' sf'],['Actual material',F(actual)+' sf'],['Spare vs room',F(actual-area)+' sf'],['Waste',F(w,1)+'%']];
      if(layout){items.push(['Run direction',dir==='length'?'Room length':'Room width'],['Rows',String(layout.rows)],['First row',F(layout.first)+' in'],['Last row',F(layout.last)+' in'],['Row balance',layout.balanced?'BALANCE RECOMMENDED':'OK'],['Nominal boards / row',layout.fullAlong+(layout.tail>0?' + end cut':'')]);}
      note=layout?.balanced?'<b>Layout assist:</b> the natural last row is narrower than the preferred minimum, so the first and last rows are balanced to about '+esc111(F(layout.last))+' in each. Confirm manufacturer minimum widths, expansion gap and stagger rules.':'Order quantity is rounded up to whole boxes. Layout assist is advisory; manufacturer installation rules control.';
      totals=[{key:'Plank / LVP',value:boxes,unit:'boxes'},{key:'Plank / LVP material',value:actual,unit:'sf'}];
    }else{
      const cov=N('tileBoxCov111'),w=N('tileWaste111'),TL=N('tileLen111'),TW=N('tileWid111'),J=N('tileJoint111'),ori=E('tileOrient111')?.value||'auto';
      if(cov<=0||TL<=0||TW<=0)return alert('Enter tile size and coverage per box.');
      const need=area*(1+w/100),boxes=C(need/cov),actual=boxes*cov;
      const A=tileGrid111(R.L,R.W,TL,TW,J,false),B=tileGrid111(R.L,R.W,TL,TW,J,true);
      let g=ori==='entered'?A:ori==='rotated'?B:(A.pieces<B.pieces?A:B.pieces<A.pieces?B:(A.minEdge>=B.minEdge?A:B));
      title='Tile';primary=boxes+' boxes';
      items=[['Net area',F(area)+' sf'],['With waste',F(need)+' sf'],['Coverage / box',F(cov)+' sf'],['Actual material',F(actual)+' sf'],['Tile grid',g.nL+' × '+g.nW],['Grid positions',String(g.pieces)],['Tile orientation',g.rot?'Rotated 90°':'As entered'],['Centered edge · length',F(g.edgeL)+' in'],['Centered edge · width',F(g.edgeW)+' in'],['Grout joint',F(J,3)+' in']];
      note='<b>Centered layout check:</b> edge-piece sizes assume equal cuts at opposite walls. Box quantity is area + waste; grid positions are a layout guide, not an order-piece count, because cut pieces may be reusable. Mortar and grout calculators come in the next materials expansion.';
      totals=[{key:'Tile',value:boxes,unit:'boxes'},{key:'Tile material',value:actual,unit:'sf'}];
    }
    if(base){items.push(['Wall base net',F(base.net)+' lf'],['Wall base order',F(base.required)+' lf'],['Wall base rolls/coils',String(base.qty)],['Wall base spare',F(base.left)+' lf']);totals.push({key:'Wall base · '+base.label,value:base.qty,unit:'rolls'},{key:'Wall base length',value:base.required,unit:'lf'});}
    if(trans){items.push(['Transition',F(trans.lf)+' lf'],['Transition pieces',String(trans.qty)],['Transition spare',F(trans.left)+' lf']);totals.push({key:'Transition',value:trans.qty,unit:'pieces'},{key:'Transition length',value:trans.lf,unit:'lf'});}
    show(title,primary,'',items,note);
    setCurrentResult({type:'plank',title,primary:primary+' · '+F(area)+' sf',defaultName:title+' room',totals});
    saveLast();
  }catch(err){console.error(err);const eng=E('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc111(err.message||err)}alert('Calculation error: '+(err.message||err));}
}

window.calculate=function(){if(type==='plank')return calcFloor111();return calcV110();};

window.state=function(){
  const s=stateV110();
  return Object.assign(s,{floorMode111,
    plankLen111:E('plankLen111')?.value||'48',plankWid111:E('plankWid111')?.value||'7',plankGap111:E('plankGap111')?.value||'0.25',plankMinRow111:E('plankMinRow111')?.value||'2',plankDir111:E('plankDir111')?.value||'length',
    tileBoxCov111:E('tileBoxCov111')?.value||'16',tileWaste111:E('tileWaste111')?.value||'10',tileLen111:E('tileLen111')?.value||'24',tileWid111:E('tileWid111')?.value||'12',tileJoint111:E('tileJoint111')?.value||'0.125',tileOrient111:E('tileOrient111')?.value||'auto',
    baseInclude111:!!E('baseInclude111')?.checked,basePreset111:E('basePreset111')?.value||'120',baseCustom111:E('baseCustom111')?.value||'120',baseOpen111:E('baseOpen111')?.value||'0',baseExtra111:E('baseExtra111')?.value||'5',transLF111:E('transLF111')?.value||'0',transPiece111:E('transPiece111')?.value||'8'});
};
window.applyState=function(s,restoreType=true){
  applyStateV110(s,restoreType);
  const vals={plankLen111:'48',plankWid111:'7',plankGap111:'0.25',plankMinRow111:'2',plankDir111:'length',tileBoxCov111:'16',tileWaste111:'10',tileLen111:'24',tileWid111:'12',tileJoint111:'0.125',tileOrient111:'auto',basePreset111:'120',baseCustom111:'120',baseOpen111:'0',baseExtra111:'5',transLF111:'0',transPiece111:'8'};
  Object.keys(vals).forEach(k=>{if(E(k))E(k).value=s&&s[k]!==undefined?s[k]:vals[k]});
  if(E('baseInclude111'))E('baseInclude111').checked=!!(s&&s.baseInclude111);
  setFloorMode111(s&&s.floorMode111==='tile'?'tile':'plank');toggleBaseCustom111();
};
window.clearInputs=function(){
  clearV110();
  if(E('boxCov'))E('boxCov').value='23.8';if(E('waste'))E('waste').value='10';
  const vals={plankLen111:'48',plankWid111:'7',plankGap111:'0.25',plankMinRow111:'2',plankDir111:'length',tileBoxCov111:'16',tileWaste111:'10',tileLen111:'24',tileWid111:'12',tileJoint111:'0.125',tileOrient111:'auto',basePreset111:'120',baseCustom111:'120',baseOpen111:'0',baseExtra111:'5',transLF111:'0',transPiece111:'8'};
  Object.keys(vals).forEach(k=>{if(E(k))E(k).value=vals[k]});if(E('baseInclude111'))E('baseInclude111').checked=false;setFloorMode111('plank');toggleBaseCustom111();
};

function enhanceV111(){
  enhanceFloor111();toggleBaseCustom111();
  document.title='RUNLU Field Calculator · V1.11 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.11 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Six flooring calculators. No login. V1.11 separates Plank and Tile planning and adds wall-base / transition quick-add while keeping visual carpet and advanced stair tools.';
  const eng=E('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.11 plank/tile + wall-base planning are active.';
}

try{
  const p=plankLayout111(12,10,48,7,0,2,'length');if(!p||!p.balanced||Math.abs(p.last-4)>.001)throw new Error('V1.11 plank row-balance self-test failed');
  const q=C((12*14*1.10)/23.8);if(q!==8)throw new Error('V1.11 plank box self-test failed');
  const bNet=2*(12+14)-4,bReq=bNet*1.05,bQty=C(bReq/120);if(Math.abs(bReq-50.4)>.001||bQty!==1)throw new Error('V1.11 wall-base self-test failed');
  enhanceV111();
}catch(err){console.error(err);const eng=E('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc111(err.message||err)}}
})();
