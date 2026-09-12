(function(){
'use strict';
const calcV19=window.calculate;
const stateV19=window.state;
const applyStateV19=window.applyState;
const clearV19=window.clearInputs;

function e10(id){return document.getElementById(id)}
function n10(id){return parseFloat(e10(id)?.value)||0}
function esc10(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function f10(x,d=2){return Number(x).toLocaleString(undefined,{maximumFractionDigits:d})}

function enhanceStairSides(){
  const adv=e10('stairAdvanced');
  if(!adv || e10('stairSideReturns'))return;
  const note=adv.querySelector('.note');
  const html=`<div class="field"><label>Side triangle / stair-end returns</label><select id="stairSideReturns"><option value="0">None</option><option value="1">One side</option><option value="2">Both sides</option></select></div>
  <div class="note">For exposed stair ends like the small triangular side faces beside each tread/riser. Each side is estimated as a right triangle: ½ × tread depth × riser height × steps. Choose Both sides when both stair ends are covered.</div>`;
  if(note)note.insertAdjacentHTML('beforebegin',html);else adv.insertAdjacentHTML('beforeend',html);
}

function stairCalcV110(){
  try{
    const q=n10('steps'),w=n10('stairW'),t=n10('tread'),riserGeom=n10('riser'),r=e10('includeRiser')?.checked?riserGeom:0,wa=n10('stairWaste');
    const nose=n10('stairNose'),lc=n10('landingCount'),ll=n10('landingL'),lw=n10('landingW'),sideCount=parseInt(e10('stairSideReturns')?.value||'0',10)||0;
    if(q<=0||w<=0||t<=0)return alert('Enter stair count, covered width and tread depth.');
    if(sideCount>0&&riserGeom<=0)return alert('Enter riser height to estimate the side triangles.');
    if(lc>0&&(ll<=0||lw<=0))return alert('Enter landing length and width, or set Landing count to 0.');
    const treadArea=q*w*t/144;
    const riserArea=q*w*r/144;
    const noseArea=q*w*nose/144;
    const oneSideTriangle=q*(t*riserGeom/2)/144;
    const sideArea=oneSideTriangle*sideCount;
    const landingArea=lc*ll*lw/144;
    const net=treadArea+riserArea+noseArea+sideArea+landingArea;
    const need=net*(1+wa/100),sy=need/9;
    const sideLabel=sideCount===2?'BOTH SIDES':sideCount===1?'ONE SIDE':'NONE';
    show('Stairs',f10(need),'sf',[
      ['Net surface',f10(net)+' sf'],['With waste',f10(need)+' sf'],['Square yards',f10(sy)+' sy'],['Steps',String(q)],['Covered width',f10(w)+' in'],
      ['Tread area',f10(treadArea)+' sf'],['Riser area',f10(riserArea)+' sf'],['Side triangles',f10(sideArea)+' sf · '+sideLabel],['Wrap allowance',f10(noseArea)+' sf'],['Landing area',f10(landingArea)+' sf']
    ],'<b>Side triangles</b> use ½ × tread depth × riser height for each exposed stair end, per step. Covered width can be the full stair width or a runner width. Uncheck Include risers for tread-only/open-riser work; side triangles remain independent when selected. Waste is applied after all selected stair surfaces are combined.');
    setCurrentResult({type:'stairs',title:'Stairs',primary:f10(need)+' sf · '+f10(sy)+' sy',defaultName:'Stairs',totals:[{key:'Stairs material',value:need,unit:'sf'}]});
    saveLast();
  }catch(err){
    console.error(err);const eng=e10('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc10(err.message||err)}alert('Calculation error: '+(err.message||err));
  }
}

window.calculate=function(){if(type==='stairs')return stairCalcV110();return calcV19();};

window.state=function(){
  const s=stateV19();
  s.stairSideReturns=e10('stairSideReturns')?.value||'0';
  return s;
};

window.applyState=function(s,restoreType=true){
  applyStateV19(s,restoreType);
  if(e10('stairSideReturns'))e10('stairSideReturns').value=(s&&s.stairSideReturns!==undefined)?s.stairSideReturns:'0';
};

window.clearInputs=function(){
  clearV19();
  if(e10('stairSideReturns'))e10('stairSideReturns').value='0';
};

function enhanceV110(){
  enhanceStairSides();
  document.title='RUNLU Field Calculator · V1.10 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.10 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Six flooring calculators. No login. V1.10 adds stair side-triangle / exposed-end returns while keeping visual carpet cut planning, presets, remnants and job totals.';
  const stairTab=document.querySelector('[data-type="stairs"] span');if(stairTab)stairTab.textContent='tread · riser · side returns';
  const eng=e10('engine');if(eng&&eng.classList.contains('ok'))eng.innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.10 stair side-return + visual carpet planning are active.';
}

try{
  const base=7*31*(9+7)/144;
  const sides=7*(9*7/2)/144*2;
  const total=(base+sides)*1.10;
  if(Math.abs(sides-3.0625)>.0001||Math.abs(total-29.8909722)>.001)throw new Error('V1.10 stair side-triangle self-test failed');
  enhanceV110();
}catch(err){console.error(err);const eng=e10('engine');if(eng){eng.className='status bad';eng.innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc10(err.message||err)}}
})();
