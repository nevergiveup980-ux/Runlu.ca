'use strict';
(()=>{
  const $x=id=>document.getElementById(id);
  document.title='RUNLU Field Calculator · V1.5 Online Test';
  const ver=document.querySelector('.ver'); if(ver)ver.textContent='V1.5 · ONLINE TEST';
  const hero=document.querySelector('.hero p'); if(hero)hero.textContent='Six flooring calculators plus reusable field tools: Material Templates, Job Basket, Saved Remnants, and stronger carpet seam / pattern controls.';

  const st=document.createElement('style');
  st.textContent=`details.utility{border:1px solid var(--line);border-radius:17px;background:var(--panel);margin-top:12px}details.utility summary{cursor:pointer;padding:14px;font-size:12px;font-weight:800;letter-spacing:.06em;color:#dce7f5}details.utility[open] summary{border-bottom:1px solid var(--line)}.utility-body{padding:12px 14px 14px}.actions3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.list{display:grid;gap:8px;margin-top:10px}.list-item{border:1px solid #273443;background:#0b1219;border-radius:12px;padding:10px}.list-item .title{font-weight:800;font-size:13px}.list-item .sub{color:var(--muted);font-size:10.5px;line-height:1.45;margin-top:3px}.list-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.mini{border:1px solid #314051;background:#111923;color:#dbe5ef;border-radius:9px;padding:7px 9px;font-size:11px;font-weight:700}.result-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.job-total{margin-top:9px;padding:10px;border-radius:12px;background:#101923;border:1px solid #314051;font-size:11px;line-height:1.6}@media(max-width:430px){.actions3,.result-actions{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  const seam=$x('seams');
  if(seam){
    seam.closest('label').style.display='none';
    const rules=document.createElement('div');
    rules.innerHTML=`<div class="row"><div class="field"><label>Seam rule</label><select id="seamPolicy"><option value="allow">Allow seams when required</option><option value="avoidT">Avoid T-seams · advisory</option><option value="none">No seams</option></select></div><div class="field"><label>Pattern handling</label><select id="patternRule"><option value="repeat">Match entered repeat</option><option value="none">No pattern match</option></select></div></div><div class="note">V1.5 uses the entered repeat to round each drop. “Avoid T-seams” is advisory; final seam placement still needs field verification.</div>`;
    seam.closest('label').insertAdjacentElement('afterend',rules);
  }

  const rw=$x('rollMeasureWidth');
  if(rw){
    rw.closest('.field').insertAdjacentHTML('afterend',`<div class="row"><div class="field"><label>Item / style · optional</label><input id="remnantStyle" type="text" placeholder="Style / product"></div><div class="field"><label>Color / dye lot · optional</label><input id="remnantColor" type="text" placeholder="Color / lot"></div></div><div class="field"><label>Location · optional</label><input id="remnantLocation" type="text" placeholder="Rack / bay / location"></div>`);
  }

  const actions=document.querySelector('.actions');
  if(actions) actions.insertAdjacentHTML('beforebegin',`<div class="field" style="margin-top:13px"><label>Area / calculation name · optional</label><input id="calcName" type="text" placeholder="Bedroom 1 / Job 181312 / Remnant A"></div>`);

  const result=$x('result');
  if(result) result.insertAdjacentHTML('afterend',`
    <div id="resultActions" class="result-actions hidden"><button id="addJobBtn" class="btn secondary" type="button">ADD TO JOB</button><button id="saveRemnantBtn" class="btn secondary hidden" type="button">SAVE REMNANT</button><button id="copyResultBtn" class="btn secondary" type="button">COPY RESULT</button></div>
    <details class="utility" id="templateUtility"><summary>MATERIAL TEMPLATES · SAVE & REUSE</summary><div class="utility-body"><div class="row"><div class="field"><label>Template name</label><input id="templateName" type="text" placeholder="12 ft carpet / Jasper / HC pad"></div><div class="field"><label>Saved templates</label><select id="templateSelect"><option value="">Choose template…</option></select></div></div><div class="actions3"><button id="saveTemplateBtn" class="btn secondary" type="button">SAVE CURRENT</button><button id="loadTemplateBtn" class="btn secondary" type="button">LOAD</button><button id="deleteTemplateBtn" class="btn secondary" type="button">DELETE</button></div><div class="note">Templates save material settings, not room dimensions.</div></div></details>
    <details class="utility" id="jobUtility"><summary>JOB BASKET · MULTI-ROOM TOTAL</summary><div class="utility-body"><div id="jobList" class="list"></div><div id="jobTotals" class="job-total">No calculations added yet.</div><div class="actions2"><button id="copyJobBtn" class="btn secondary" type="button">COPY JOB SUMMARY</button><button id="clearJobBtn" class="btn secondary" type="button">CLEAR JOB</button></div></div></details>
    <details class="utility" id="remnantUtility"><summary>SAVED REMNANTS · LOCAL TEST LIST</summary><div class="utility-body"><div id="remnantList" class="list"></div><div class="note">Stored on this browser/device only in V1.5. A saved remnant can be loaded directly into the Carpet roll balance.</div></div></details>`);

  let lastCalc=null;
  const safeJSON=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(e){return fallback}};
  const saveJSON=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v))}catch(e){}};
  const cp=async text=>{try{await navigator.clipboard.writeText(text);alert('Copied.')}catch(e){let ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Copied.')}};
  const name=()=>($x('calcName')?.value||'').trim();

  function syncRules(){if(!$x('seamPolicy'))return; $x('seams').checked=$x('seamPolicy').value!=='none';}
  function deriveCalc(){
    const t=type;
    if(t==='rolllength') return {type:t,name:name()||($x('remnantStyle')?.value||'').trim()||'Roll remnant',qty:lastRollEstimateFt,unit:'lf',summary:ftin(lastRollEstimateFt),width:n('rollMeasureWidth')};
    if(t==='carpet'){
      let L=dim('Lft','Lin'),W=dim('Wft','Win'),r=roll(),rep=$x('patternRule')?.value==='none'?0:n('pattern'),allow=$x('seamPolicy')?.value!=='none';
      let A=carpetLayout(L,W,r,rep,n('allowance'),allow),B=carpetLayout(W,L,r,rep,n('allowance'),allow),p;
      if(orientation==='length')p=A; else if(orientation==='width')p=B; else p=A&&B?(A.lf<=B.lf?A:B):(A||B);
      return p?{type:t,name:name()||'Carpet area',qty:p.lf,unit:'lf',secondary:p.sf/9,secondaryUnit:'sy',summary:ftin(p.lf)+' · '+f(p.sf/9)+' sy'}:null;
    }
    if(t==='plank'){let area=room(),cov=n('boxCov'),w=n('waste'),need=area*(1+w/100),boxes=ceil(need/cov),actual=boxes*cov;return {type:t,name:name()||'Plank / Tile area',qty:boxes,unit:'boxes',secondary:actual,secondaryUnit:'sf',summary:boxes+' boxes · '+f(actual)+' sf'}}
    if(t==='underlay'){let a=n('underArea'),c=n('underCov'),sy=$x('underUnit').value==='sy'?a:a/9,cs=$x('underCovUnit').value==='sy'?c:c/9,qty=ceil(sy/cs),actual=qty*cs;return {type:t,name:name()||'Underlay area',qty,unit:'rolls',secondary:actual,secondaryUnit:'sy',summary:qty+' rolls · '+f(actual)+' sy'}}
    if(t==='adhesive'){let a=n('adhArea'),lo=n('covLow'),safe=ceil(a/lo),u=$x('container').value;return {type:t,name:name()||'Adhesive area',qty:safe,unit:u.toLowerCase(),secondary:a,secondaryUnit:'sf',summary:safe+' '+u+(safe===1?'':'S')+' · '+f(a)+' sf'}}
    if(t==='stairs'){let q=n('steps'),w=n('stairW'),td=n('tread'),rr=$x('includeRiser').checked?n('riser'):0,wa=n('stairWaste'),need=q*w*(td+rr)/144*(1+wa/100);return {type:t,name:name()||'Stairs',qty:need,unit:'sf',summary:f(need)+' sf'}}
    return null;
  }
  function updateActions(){if(!lastCalc){$x('resultActions')?.classList.add('hidden');return}$x('resultActions').classList.remove('hidden');let roll=lastCalc.type==='rolllength';$x('addJobBtn').classList.toggle('hidden',roll);$x('saveRemnantBtn').classList.toggle('hidden',!roll)}

  const baseCalculate=calculate;
  calculate=function(){
    syncRules();
    const patternInput=$x('pattern'),oldPattern=patternInput?.value;
    if(type==='carpet'&&$x('patternRule')?.value==='none')patternInput.value='0';
    baseCalculate();
    if(patternInput&&oldPattern!==undefined)patternInput.value=oldPattern;
    if(!$x('result').classList.contains('hidden')){
      lastCalc=deriveCalc();updateActions();
      if(type==='carpet'&&$x('seamPolicy')?.value==='avoidT')$x('result').insertAdjacentHTML('beforeend','<div class="note"><b>V1.5 seam check:</b> Avoid T-seams is advisory; verify the actual seam map before cutting.</div>');
    }
  };
  const baseSetType=setType;
  setType=function(t){baseSetType(t);lastCalc=null;$x('resultActions')?.classList.add('hidden');renderTemplates()};
  const baseNext=nextJob;
  nextJob=function(){baseNext();lastCalc=null;if($x('calcName'))$x('calcName').value='';$x('resultActions')?.classList.add('hidden')};

  const baseSaveLast=saveLast;
  saveLast=function(){baseSaveLast();saveJSON('runluFieldExtrasV15',{seamPolicy:$x('seamPolicy')?.value||'allow',patternRule:$x('patternRule')?.value||'repeat'})};
  const baseRestore=restoreLast;
  restoreLast=function(){baseRestore();let e=safeJSON('runluFieldExtrasV15',{});if($x('seamPolicy')&&e.seamPolicy)$x('seamPolicy').value=e.seamPolicy;if($x('patternRule')&&e.patternRule)$x('patternRule').value=e.patternRule;syncRules()};

  const getJob=()=>safeJSON('runluFieldJobV15',[]), setJob=v=>{saveJSON('runluFieldJobV15',v);renderJob()};
  function renderJob(){let j=getJob(),list=$x('jobList'),tot=$x('jobTotals');if(!list)return;if(!j.length){list.innerHTML='';tot.textContent='No calculations added yet.';return}list.innerHTML=j.map(x=>`<div class="list-item"><div class="title">${esc(x.name||x.type)}</div><div class="sub">${esc(x.summary||'')}</div><div class="list-actions"><button class="mini" data-remove-job="${x.id}" type="button">REMOVE</button></div></div>`).join('');let g={};j.forEach(x=>{let k=x.type+'|'+x.unit;if(!g[k])g[k]={type:x.type,unit:x.unit,qty:0,sec:0,su:x.secondaryUnit||''};g[k].qty+=Number(x.qty)||0;if(x.secondaryUnit===g[k].su)g[k].sec+=Number(x.secondary)||0});tot.innerHTML='<b>JOB TOTALS</b><br>'+Object.values(g).map(x=>`${esc(x.type)}: ${f(x.qty)} ${esc(x.unit)}${x.sec?' · '+f(x.sec)+' '+esc(x.su):''}`).join('<br>')}
  $x('addJobBtn').onclick=()=>{if(!lastCalc||lastCalc.type==='rolllength')return;let j=getJob();j.push({...lastCalc,id:Date.now()});setJob(j);$x('jobUtility').open=true};
  $x('jobList').onclick=e=>{let id=Number(e.target.dataset.removeJob);if(id)setJob(getJob().filter(x=>x.id!==id))};
  $x('clearJobBtn').onclick=()=>{if(confirm('Clear the current Job Basket?'))setJob([])};
  $x('copyJobBtn').onclick=()=>{let j=getJob();if(!j.length)return alert('Job Basket is empty.');cp(['RUNLU Field Calculator — Job Basket',...j.map((x,i)=>(i+1)+'. '+(x.name||x.type)+' — '+x.summary)].join('\n'))};

  const getRem=()=>safeJSON('runluRemnantsV15',[]), setRem=v=>{saveJSON('runluRemnantsV15',v);renderRem()};
  function renderRem(){let a=getRem(),el=$x('remnantList');if(!el)return;if(!a.length){el.innerHTML='<div class="note">No saved remnants yet.</div>';return}el.innerHTML=a.map(r=>`<div class="list-item"><div class="title">${esc(r.style||'Saved remnant')}</div><div class="sub">${esc(ftin(r.lengthFt))}${r.width?' · '+f(r.width)+' ft wide':''}${r.color?' · '+esc(r.color):''}${r.location?' · '+esc(r.location):''}</div><div class="list-actions"><button class="mini" data-use-rem="${r.id}" type="button">USE IN CARPET</button><button class="mini" data-del-rem="${r.id}" type="button">DELETE</button></div></div>`).join('')}
  $x('saveRemnantBtn').onclick=()=>{if(!lastCalc||lastCalc.type!=='rolllength'||lastRollEstimateFt<=0)return;let a=getRem();a.unshift({id:Date.now(),style:($x('remnantStyle')?.value||name()||'Saved remnant').trim(),color:($x('remnantColor')?.value||'').trim(),location:($x('remnantLocation')?.value||'').trim(),width:n('rollMeasureWidth'),lengthFt:lastRollEstimateFt});setRem(a.slice(0,50));$x('remnantUtility').open=true};
  $x('remnantList').onclick=e=>{let use=Number(e.target.dataset.useRem),del=Number(e.target.dataset.delRem);if(del)setRem(getRem().filter(x=>x.id!==del));if(use){let r=getRem().find(x=>x.id===use);if(!r)return;setType('carpet');$x('availFt').value=Math.floor(r.lengthFt);$x('availIn').value=((r.lengthFt-Math.floor(r.lengthFt))*12).toFixed(2);if(r.width){let m=[12,13.1667,15].find(v=>Math.abs(v-r.width)<.02);if(m)$x('rollWidth').value=String(m);else{$x('rollWidth').value='custom';$x('rollCustom').value=r.width}toggleCustomRoll()}$x('calcName').value=r.style||'Saved remnant';$x('carpetPanel').scrollIntoView({behavior:'smooth'})}};

  const getTpl=()=>safeJSON('runluMaterialTemplatesV15',[]), setTpl=v=>{saveJSON('runluMaterialTemplatesV15',v);renderTemplates()};
  function capture(){let o={type,orientation};if(type==='carpet')Object.assign(o,{rollWidth:$x('rollWidth').value,rollCustom:$x('rollCustom').value,pattern:$x('pattern').value,allowance:$x('allowance').value,seamPolicy:$x('seamPolicy').value,patternRule:$x('patternRule').value});if(type==='rolllength')Object.assign(o,{rollCore:$x('rollCore').value,rollMeasureWidth:$x('rollMeasureWidth').value,rollMethod});if(type==='plank')Object.assign(o,{boxCov:$x('boxCov').value,waste:$x('waste').value});if(type==='underlay')Object.assign(o,{underCov:$x('underCov').value,underCovUnit:$x('underCovUnit').value});if(type==='adhesive')Object.assign(o,{adhProduct:$x('adhProduct').value,adhApp:$x('adhApp').value,covLow:$x('covLow').value,covHigh:$x('covHigh').value,container:$x('container').value});if(type==='stairs')Object.assign(o,{stairW:$x('stairW').value,tread:$x('tread').value,riser:$x('riser').value,stairWaste:$x('stairWaste').value,includeRiser:$x('includeRiser').checked});return o}
  function renderTemplates(){let sel=$x('templateSelect');if(!sel)return;let cur=sel.value;sel.innerHTML='<option value="">Choose template…</option>'+getTpl().map(t=>`<option value="${t.id}">${esc(t.name)} · ${esc(t.type)}</option>`).join('');if([...sel.options].some(o=>o.value===cur))sel.value=cur}
  $x('saveTemplateBtn').onclick=()=>{let nm=$x('templateName').value.trim();if(!nm)return alert('Enter a template name.');let a=getTpl(),entry={id:Date.now(),name:nm,...capture()},i=a.findIndex(x=>x.name.toLowerCase()===nm.toLowerCase());if(i>=0){if(!confirm('Replace the existing template?'))return;entry.id=a[i].id;a[i]=entry}else a.push(entry);setTpl(a);$x('templateSelect').value=String(entry.id)};
  $x('loadTemplateBtn').onclick=()=>{let t=getTpl().find(x=>x.id===Number($x('templateSelect').value));if(!t)return alert('Choose a saved template.');setType(t.type);orientation=t.orientation||'auto';document.querySelectorAll('#orient button').forEach((b,i)=>b.classList.toggle('active',(orientation==='auto'&&i===0)||(orientation==='length'&&i===1)||(orientation==='width'&&i===2)));Object.entries(t).forEach(([k,v])=>{if($x(k)&&!['adhProduct','adhApp'].includes(k))$x(k).value=v});if(t.includeRiser!==undefined)$x('includeRiser').checked=!!t.includeRiser;if(t.adhProduct){$x('adhProduct').value=t.adhProduct;loadAdhesive();if(t.adhApp!==undefined){$x('adhApp').value=t.adhApp;loadAdhApp()}}if(t.rollMethod){rollMethod=t.rollMethod;setRollMethod(rollMethod)}toggleCustomRoll();syncRules();$x('templateName').value=t.name};
  $x('deleteTemplateBtn').onclick=()=>{let id=Number($x('templateSelect').value);if(id&&confirm('Delete this template?'))setTpl(getTpl().filter(x=>x.id!==id))};

  $x('copyResultBtn').onclick=()=>{let t=$x('result').innerText.trim();if(t)cp(t)};
  renderJob();renderRem();renderTemplates();syncRules();
  if($x('engine')){$x('engine').className='status ok';$x('engine').innerHTML='<b>🟢 CALC ENGINE READY · V1.5</b> · Templates, Job Basket, Remnants and roll tools are active.'}
})();
