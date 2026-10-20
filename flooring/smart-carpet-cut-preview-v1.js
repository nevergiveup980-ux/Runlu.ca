/* Isolated visual harness: fictional inventory only, no durable writes. */
(function(){
'use strict';
const by=x=>document.getElementById(x);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Number(by(x).value);
const rolls=[
{id:'preview-small',roll:'DEMO-101',name:'Dawn',colour:'Blue',kind:'Carpet Roll',lot:'LOT-A',widthFt:12,available:26,selectable:true,hold:{known:true}},
{id:'preview-mid',roll:'DEMO-102',name:'Dawn',colour:'Blue',kind:'Carpet Roll',lot:'LOT-A',widthFt:12,available:35,selectable:true,hold:{known:true}},
{id:'preview-other',roll:'DEMO-203',name:'Dawn',colour:'Blue',kind:'Carpet Roll',lot:'LOT-B',widthFt:12,available:38,selectable:true,hold:{known:true}}
];
let current=[],chosen=null;
const request=()=>({style:by('style').value,colour:by('colour').value,dyelot:by('lot').value,cutAllowanceFt:n('allowance'),cuts:[{id:'Living',widthFt:n('w1'),lengthFt:n('l1')},{id:'Bedroom',widthFt:n('w2'),lengthFt:n('l2')}],rolls});
const signature=()=>JSON.stringify(request());
let requestSignature='';
function reset(){current=[];chosen=null;requestSignature='';by('results').replaceChildren();by('info').textContent='Input changed. Recalculate to see current recommendations.'}
document.querySelectorAll('input').forEach(el=>el.addEventListener('input',reset));
by('calculate').addEventListener('click',()=>{
 const r=window.RUNLUSmartCarpetCutPlannerV1.plan(request());
 current=r.plans||[];chosen=null;requestSignature=signature();
 const holder=by('results');holder.replaceChildren();
 by('info').textContent=!r.ok?'Please enter complete, valid measurements.':current.length?current.length+' same-Dyelot planning option(s). Verify physical cuts before use.':'No valid single-Dyelot cut proposal in this demonstration inventory.';
 for(const [i,p] of current.entries()){
  const card=document.createElement('div');card.className='result';
  const heading=document.createElement('h3');heading.textContent='Option '+(i+1)+' · Dyelot '+p.dyelot+' · '+p.rollCount+' roll(s)';card.appendChild(heading);
  for(const roll of p.rolls){
   const line=document.createElement('p');line.textContent=roll.roll+' · width '+roll.widthFt+' ft · cuts '+roll.cutList.map(c=>c.id+': '+c.widthFt+' × '+c.lengthFt+' ft').join(', ')+' · remaining '+roll.estimatedRemainingLF.toFixed(2)+' LF';
   card.appendChild(line);
  }
  const btn=document.createElement('button');btn.textContent='Review option '+(i+1);btn.addEventListener('click',()=>{if(signature()!==requestSignature){reset();return}chosen=i;by('summary').textContent='Option '+(i+1)+' · '+p.rolls.map(x=>x.roll).join(' + ')+' · '+p.dyelot;by('review').showModal()});card.appendChild(btn);holder.appendChild(card);
 }
});
by('cancel').addEventListener('click',()=>{chosen=null;by('review').close()});
by('confirm').addEventListener('click',()=>{
 if(chosen===null||signature()!==requestSignature){by('review').close();reset();return}
 const selected=current[chosen];by('review').close();by('info').textContent='Preview confirmed: '+selected.rolls.map(x=>x.roll).join(' + ')+'. Not saved to any PO or inventory.';
 chosen=null;
});
})();
