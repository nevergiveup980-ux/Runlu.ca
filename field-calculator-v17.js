(function(){
'use strict';
const oldCalculate=window.calculate;
const oldApplyState=window.applyState;
const oldState=window.state;
const oldClearInputs=window.clearInputs;

function enhanceCarpetV17(){
  const panel=document.getElementById('carpetPanel');
  if(!panel)return;
  const existing=panel.querySelector('details.subdetails');
  if(existing){
    existing.innerHTML=`
      <summary>ADVANCED CARPET RULES</summary>
      <div class="row"><div class="field"><label>Pattern match</label><select id="patternMatch"><option value="none">Plain / random match</option><option value="set">Set / straight match</option><option value="drop">Drop / half-drop match</option></select></div><div class="field"><label>Length pattern repeat (in)</label><input id="pattern" type="number" value="0" min="0" step="0.25"></div></div>
      <div class="row"><div class="field"><label>Trim allowance per end (in)</label><input id="allowance" type="number" value="3" min="0" step="0.25"></div><div class="field"><label>Edge trim per roll side (in)</label><input id="edgeTrim" type="number" value="0" min="0" step="0.125"></div></div>
      <div class="row"><div class="field"><label>Pattern reserve / additional cut</label><select id="patternReserve"><option value="0">0 repeat</option><option value="0.5">0.5 repeat</option><option value="1" selected>1.0 repeat · conservative</option><option value="1.5">1.5 repeats</option></select></div><div class="field"><label>Installation method</label><select id="carpetInstall"><option value="stretch">Stretch-in · pad + tack strip</option><option value="glue">Direct glue / no tack estimate</option></select></div></div>
      <div class="field"><label>Pile / run direction constraint</label><select id="pileDir"><option value="any">Any / let calculator compare</option><option value="length">Must run along room length</option><option value="width">Must run along room width</option></select></div>
      <div class="field"><label>Layout preference</label><div class="chips" id="orient"><button type="button" class="active" onclick="setOrient('auto',this)">AUTO BEST</button><button type="button" onclick="setOrient('length',this)">RUN LENGTH</button><button type="button" onclick="setOrient('width',this)">RUN WIDTH</button></div></div>
      <div class="row"><label class="check"><input id="seams" type="checkbox" checked> Allow parallel seams when required</label><div class="field"><label>Minimum reusable remnant (ft)</label><input id="minRemnant" type="number" value="6" min="0" step="0.5"></div></div>
      <div class="row"><div class="field"><label>Door/opening length without tack (ft)</label><input id="noTackOpening" type="number" value="0" min="0" step="0.25"></div><div class="field"><label>Tack strip extra (%)</label><input id="tackWaste" type="number" value="5" min="0" step="1"></div></div>
      <div class="field"><label>Seam tape extra (%)</label><input id="seamWaste" type="number" value="5" min="0" step="1"></div>
      <div class="note"><b>Planning model:</b> full-length parallel drops only; no automatic T-seams. The 3 in default is trim at <b>each end</b> of a wall-to-wall cut. Patterned jobs use repeat rounding plus the selected reserve on each additional cut; exact drop-match sequencing and manufacturer tolerances still require installer/manufacturer confirmation.</div>`;
  }
  if(!document.getElementById('carpetFieldChecklist')){
    panel.insertAdjacentHTML('beforeend',`<details id="carpetFieldChecklist" class="subdetails"><summary>CARPET FIELD CHECKLIST</summary><div class="note">Plan seams before cutting. Prefer seams running the length of the area; keep main traffic parallel to seams when practical; avoid natural light striking across seams, pivot-traffic zones, and seams perpendicular to door openings. Adjacent broadloom pieces should keep the same pile direction. Patterned carpet may require additional material and field adjustment for bow, skew or elongation—manufacturer guidance controls.</div></details>`);
  }
  document.title='RUNLU Field Calculator · V1.7 Online Test';
  const v=document.querySelector('.ver');if(v)v.textContent='V1.7 · ONLINE TEST';
  const hp=document.querySelector('.hero p');if(hp)hp.textContent='Six flooring calculators. No login. Local calculation core. V1.7 deepens carpet planning and keeps the advanced stair tools.';
}

window.carpetLayout=function(run,across,r,rep,allow,seams,edgeTrim=0,matchType='none',reserveFactor=1){
  const usable=r-2*Math.max(0,edgeTrim)/12;
  if(usable<=0)return null;
  if(!seams&&across>usable)return null;
  const drops=ceil(across/usable);
  const raw=run+2*Math.max(0,allow)/12;
  let first=raw,extraCut=raw,patternExtra=0;
  if(rep>0&&matchType!=='none'){
    first=ceil(raw*12/rep)*rep/12;
    patternExtra=Math.max(0,reserveFactor)*rep/12;
    extraCut=first+patternExtra;
  }
  const lf=first+Math.max(0,drops-1)*extraCut;
  const sf=lf*r,net=run*across,seamCount=Math.max(0,drops-1),seamBase=seamCount*run;
  return{drops,raw,first,extraCut,patternExtra,lf,sf,net,off:Math.max(0,sf-net),wastePct:net>0?Math.max(0,(sf-net)/net*100):0,usableWidth:usable,seamCount,seamBase};
};

window.useCarpetAreaInUnderlay=function(areaSf){
  setType('underlay');
  $('underArea').value=Math.round(areaSf*100)/100;
  $('underUnit').value='sf';
  $('underlayPanel').scrollIntoView({behavior:'smooth',block:'start'});
};

window.calculate=function(){
  if(type!=='carpet')return oldCalculate();
  try{
    const L=dim('Lft','Lin'),W=dim('Wft','Win'),r=roll();
    if(L<=0||W<=0||r<=0)return alert('Enter room dimensions and roll width.');
    const match=$('patternMatch').value||'none',rep=n('pattern'),allow=n('allowance'),edge=n('edgeTrim'),reserve=n('patternReserve'),seams=$('seams').checked;
    if(match!=='none'&&rep<=0)return alert('Enter the carpet length pattern repeat, or choose Plain / random match.');
    const A=carpetLayout(L,W,r,rep,allow,seams,edge,match,reserve),B=carpetLayout(W,L,r,rep,allow,seams,edge,match,reserve);
    let p,label,pile=$('pileDir').value||'any',effective=pile==='any'?orientation:pile;
    if(effective==='length'){p=A;label=pile==='length'?'Pile direction · room length':'Run along room length';}
    else if(effective==='width'){p=B;label=pile==='width'?'Pile direction · room width':'Run along room width';}
    else if(A&&B){if(Math.abs(A.lf-B.lf)<1e-9)p=A.seamCount<=B.seamCount?A:B;else p=A.lf<B.lf?A:B;label=p===A?'Run along room length':'Run along room width';}
    else{p=A||B;label=p===A?'Run along room length':'Run along room width';}
    if(!p)return show('Carpet','NO FIT','',[['Room',f(L)+' × '+f(W)+' ft'],['Roll width',f(r)+' ft']],'<span style="color:var(--red)">No allowed full-length-drop layout fits the selected roll width, edge-trim and seam rules.</span>');
    const alt=p===A?B:A,av=dim('availFt','availIn'),remain=av>0&&av>=p.lf?av-p.lf:0,min=n('minRemnant');
    const seamTape=p.seamBase*(1+n('seamWaste')/100),install=$('carpetInstall').value,perim=2*(L+W),tack=install==='stretch'?Math.max(0,perim-n('noTackOpening'))*(1+n('tackWaste')/100):0;
    const matchLabel=match==='set'?'SET / STRAIGHT':match==='drop'?'DROP / HALF-DROP':'PLAIN / RANDOM';
    const items=[['Layout',label],['Drops',String(p.drops)],['Usable roll width',f(p.usableWidth)+' ft'],['First cut',ftin(p.first)],['Additional cut',p.drops>1?ftin(p.extraCut):'—'],['Seams',String(p.seamCount)],['Seam tape est.',f(seamTape)+' lf'],['Order',f(p.sf/9)+' sy'],['Net room',f(L*W/9)+' sy'],['Planning waste',f(p.wastePct,1)+'%'],['Pattern',matchLabel],['Trim allowance',f(allow)+' in / end']];
    if(install==='stretch')items.push(['Pad net area',f(L*W)+' sf'],['Tack strip est.',f(tack)+' lf']);else items.push(['Install method','Direct glue']);
    if(alt)items.push(['Other direction',ftin(alt.lf)+' · '+alt.seamCount+' seam'+(alt.seamCount===1?'':'s')]);
    if(av>0){items.push(['Roll available',ftin(av)],['After job',av>=p.lf?ftin(remain):'SHORT '+ftin(p.lf-av)]);if(av>=p.lf)items.push(['Leftover status',remain>=min?'REUSABLE':'BELOW '+f(min)+' ft MIN']);}
    const cutPlan=p.drops===1?'1 × '+ftin(p.first):'1 × '+ftin(p.first)+' + '+(p.drops-1)+' × '+ftin(p.extraCut);
    const patternNote=match==='none'?'Plain/random-match planning.':'Pattern plan rounds the first cut to a full length repeat and adds '+f(reserve,1)+' repeat reserve to each additional cut. '+(match==='drop'?'<b>Drop-match cut order can change actual consumption;</b> verify the product pattern data and installer cut sequence.':'');
    const note='<b>Cut plan:</b> '+esc(cutPlan)+'. '+patternNote+' Full-length parallel seams only; no automatic T-seams. Seam/tack figures are planning estimates.<button type="button" class="btn secondary" style="width:100%;margin-top:10px" onclick="useCarpetAreaInUnderlay('+String(L*W)+')">USE ROOM AREA IN UNDERLAY</button>';
    show('Carpet',ftin(p.lf),'linear',items,note);
    setCurrentResult({type:'carpet',title:'Carpet',primary:ftin(p.lf)+' linear · '+f(p.sf/9)+' sy',defaultName:'Carpet room',remnantFt:remain>=min?remain:0,totals:[{key:'Carpet',value:p.lf,unit:'lf'},{key:'Carpet order area',value:p.sf/9,unit:'sy'},{key:'Seam tape',value:seamTape,unit:'lf'}].concat(install==='stretch'?[{key:'Pad net area',value:L*W,unit:'sf'},{key:'Tack strip',value:tack,unit:'lf'}]:[])});
    saveLast();
  }catch(e){console.error(e);$('engine').className='status bad';$('engine').innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc(e.message||e);alert('Calculation error: '+(e.message||e));}
};

window.state=function(){
  const s=oldState();
  return Object.assign(s,{patternMatch:$('patternMatch')?$('patternMatch').value:'none',edgeTrim:$('edgeTrim')?$('edgeTrim').value:'0',patternReserve:$('patternReserve')?$('patternReserve').value:'1',carpetInstall:$('carpetInstall')?$('carpetInstall').value:'stretch',noTackOpening:$('noTackOpening')?$('noTackOpening').value:'0',tackWaste:$('tackWaste')?$('tackWaste').value:'5',seamWaste:$('seamWaste')?$('seamWaste').value:'5'});
};

window.applyState=function(s,restoreType=true){
  oldApplyState(s,restoreType);
  const d={patternMatch:'none',edgeTrim:'0',patternReserve:'1',carpetInstall:'stretch',noTackOpening:'0',tackWaste:'5',seamWaste:'5'};
  Object.keys(d).forEach(k=>{if($(k))$(k).value=s&&s[k]!==undefined?s[k]:d[k];});
};

window.saveLast=function(){memory=state();try{localStorage.setItem('runluFieldCalcV17',JSON.stringify(memory));}catch(e){}};
window.restoreLast=function(){let s=memory;try{if(!s){const raw=localStorage.getItem('runluFieldCalcV17')||localStorage.getItem('runluFieldCalcV16')||localStorage.getItem('runluFieldCalcV15')||localStorage.getItem('runluFieldCalcV14')||localStorage.getItem('runluFieldCalcV13');if(raw)s=JSON.parse(raw);}}catch(e){}if(!s)return alert('No saved job settings yet. Calculate one job first.');applyState(s,true);alert('Last job settings restored.');};
window.clearInputs=function(){oldClearInputs();if($('patternMatch'))$('patternMatch').value='none';if($('edgeTrim'))$('edgeTrim').value='0';if($('patternReserve'))$('patternReserve').value='1';if($('carpetInstall'))$('carpetInstall').value='stretch';if($('noTackOpening'))$('noTackOpening').value='0';if($('tackWaste'))$('tackWaste').value='5';if($('seamWaste'))$('seamWaste').value='5';if($('allowance'))$('allowance').value='3';};

function selfTestV17(){
  const p=carpetLayout(12,14,12,0,3,true,0,'none',1);
  if(!p||p.drops!==2||Math.abs(p.lf-25)>.001)throw new Error('Carpet trim self-test failed');
  const pp=carpetLayout(12,14,12,18,3,true,0,'set',1);
  if(!pp||Math.abs(pp.first-13.5)>.001||Math.abs(pp.extraCut-15)>.001||Math.abs(pp.lf-28.5)>.001)throw new Error('Carpet pattern self-test failed');
  const lf=rollLengthFromWraps(24,4,40);if(Math.abs(lf-146.607657)>.01)throw new Error('Roll estimator self-test failed');
  const stairTest=7*31*(9+7)/144*1.10;if(Math.abs(stairTest-26.5222222)>.001)throw new Error('Stair self-test failed');
}

try{
  enhanceCarpetV17();
  selfTestV17();
  $('engine').className='status ok';
  $('engine').innerHTML='<b>🟢 CALC ENGINE READY</b> · V1.7 carpet planning + local memory are active.';
}catch(e){
  console.error(e);
  if($('engine')){$('engine').className='status bad';$('engine').innerHTML='<b>🔴 CALC ENGINE ERROR</b> · '+esc(e.message||e);}
}
})();