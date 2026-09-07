/* RUNLU Flooring OS V0.3.80 · startup status stability guard
   Prevents lower-version wrapper timers from visibly fighting over the two
   startup status labels after the business shell is revealed.
   Visual-only: no business state, cloud data, PO, inventory or accounting writes.
*/
(function(){
'use strict';
if(window.__RUNLU_STATUS_STABILITY_V080__)return;
window.__RUNLU_STATUS_STABILITY_V080__=true;

const PILL='V0.3.80 Management Control';
const DEMO='V0.3.80 · A/R first review · configurable quarterly Commission · PO inventory holds.';
let active=true;

function pin(){
  if(!active)return;
  try{
    const p=document.querySelector('header .pill');
    if(p&&p.textContent!==PILL)p.textContent=PILL;
    const d=document.getElementById('command')?.querySelector?.('.demo');
    if(d&&d.textContent!==DEMO)d.textContent=DEMO;
  }catch(_){}
}

pin();
const observer=new MutationObserver(pin);
try{observer.observe(document.body,{subtree:true,childList:true,characterData:true})}catch(_){}

// Lower wrappers use short startup timers. Hold the final labels through that window,
// then get completely out of the way so normal later UI changes are not constrained.
setTimeout(()=>{
  active=false;
  try{observer.disconnect()}catch(_){}
  pin();
},36000);

window.RUNLUStatusStabilityV080={pin,version:'0.3.80'};
})();
