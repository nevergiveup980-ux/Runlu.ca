/* SmartRoll guarded multi-row preview only: direct DOM changes to demo table. */
(function(){
'use strict';
const by=x=>document.getElementById(x),adapter=window.RUNLUPaperSmartAdvisorAdapterV1,advisor=window.RUNLUSmartCarpetAdvisorV1,guard=window.RUNLUSmartRollPaperRowGuardV1;
const demo=[
{id:'d1',kind:'Carpet Roll',name:'Dawn',colour:'Blue',roll:'DEMO-85',width:"12'",available:85,quantity:85,lot:'LOT-A',selectable:true,hold:{known:true}},
{id:'d2',kind:'Carpet Roll',name:'Dawn',colour:'Blue',roll:'DEMO-120',width:"12'",available:120,quantity:120,lot:'LOT-A',selectable:true,hold:{known:true}},
{id:'d3',kind:'Carpet Roll',name:'Dawn',colour:'Blue',roll:'DEMO-70',width:"12'",available:70,quantity:70,lot:'LOT-B',selectable:true,hold:{known:true}}
];
let token=null,selected=null;
const dialog=by('review');
function reset(message){
 token=null;selected=null;by('candidates').replaceChildren();by('confirm').disabled=true;
 if(dialog.open)dialog.close();
 if(message)by('status').textContent=message;
}
function readCells(tr){return Array.from(tr.children).slice(0,5).map(c=>c.textContent.trim())}
function suggest(tr){
 const start=guard.begin(tr,adapter);
 if(!start.ok){by('status').textContent='Complete STYLE, COLOUR and area with SF/SYD before requesting SmartRoll suggestions.';return}
 token=start.token;selected=null;by('confirm').disabled=true;by('candidates').replaceChildren();
 const input=adapter.readRow(readCells(tr)),result=adapter.rank(input,demo,advisor);
 const i=Array.from(by('paperRows').children).indexOf(tr);
 by('rowLabel').textContent='Line '+(i+1);
 by('detail').textContent='Choose a roll. Same Dyelot, smallest sufficient roll and warehouse cut feasibility must be confirmed.';
 for(const rec of result.results||[]){
   const btn=document.createElement('button');btn.type='button';btn.className='candidate';
   btn.disabled=!rec.areaCandidate||!rec.holdKnown;
   btn.textContent='Roll '+rec.roll+' · Dyelot '+(rec.dyelot||'unknown')+' · '+rec.availableLF+' LF · estimated remaining '+Math.round(rec.estimatedRemainingSF)+' SF'+(btn.disabled?' · '+rec.reason:'');
   btn.addEventListener('click',()=>{
     if(!guard.check(token,adapter).ok){reset('This paper row changed; please run SmartRoll again.');return}
     selected=rec;Array.from(by('candidates').children).forEach(b=>b.setAttribute('aria-selected',String(b===btn)));by('confirm').disabled=false;
   });
   by('candidates').appendChild(btn);
 }
 if(!result.results?.length)by('detail').textContent='No matching demo stock; there is nothing to confirm.';
 dialog.showModal();
}
by('paperRows').addEventListener('click',e=>{const b=e.target.closest('button.suggest');if(b)suggest(b.closest('tr'))});
by('paperRows').addEventListener('input',e=>{
 if(e.target.closest('tr')===token?.row)reset('Paper PO row changed; old recommendations invalidated.');
});
by('cancel').addEventListener('click',()=>reset('Cancelled: paper rows remain unchanged.'));
by('confirm').addEventListener('click',()=>{
 const check=guard.check(token,adapter);
 if(!selected||!check.ok){reset('Cannot confirm: selected row or its inputs changed.');return}
 const tr=token.row;
 const cell=tr.children[4];
 cell.textContent='Roll '+selected.roll+' · Lot '+selected.dyelot;
 reset('Confirmed DEMO '+selected.roll+' into original paper line '+(Array.from(by('paperRows').children).indexOf(tr)+1)+'. Not saved to a real PO.');
});
dialog.addEventListener('cancel',()=>reset('Cancelled: no paper row changed.'));
})();