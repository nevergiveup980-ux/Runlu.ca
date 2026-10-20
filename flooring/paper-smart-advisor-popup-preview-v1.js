/* Isolated paper-row advisor preview, no production PO or inventory mutation. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const adapter=window.RUNLUPaperSmartAdvisorAdapterV1,advisor=window.RUNLUSmartCarpetAdvisorV1;
let token="",selection=null;
const demo=[
 {id:"demo-1",kind:"Carpet Roll",name:"Dawn",colour:"Blue",roll:"DEMO-85",width:"12'",quantity:85,available:85,lot:"LOT-A",selectable:true,hold:{known:true}},
 {id:"demo-2",kind:"Carpet Roll",name:"Dawn",colour:"Blue",roll:"DEMO-120",width:"12'",quantity:120,available:120,lot:"LOT-A",selectable:true,hold:{known:true}},
 {id:"demo-3",kind:"Carpet Roll",name:"Dawn",colour:"Blue",roll:"DEMO-70",width:"12'",quantity:70,available:70,lot:"LOT-B",selectable:true,hold:{known:true}}
];
const fields=["qty","size","style","colour"];
function current(){return adapter.readRow(fields.map(x=>$(x).value));}
function stale(){token="";selection=null;$("status").textContent="Information changed — complete the row to refresh suggestions.";$("recommend").disabled=!current().ready;$("suggestions").replaceChildren();$("dialog").close?.();}
fields.forEach(x=>$(x).addEventListener("input",stale));
function render(){
 const row=current();
 if(!row.ready){$("status").textContent="Complete style, colour and explicit area units (SF or SYD) first.";$("recommend").disabled=true;return;}
 const result=adapter.rank(row,demo,advisor);
 token=row.requestKey;selection=null;
 const ul=$("suggestions");ul.replaceChildren();
 $("status").textContent=result.results?.length?"Area-based candidates (DEMO). Cut dimensions require Warehouse verification.":"No matching roll in demo inventory.";
 for(const r of result.results||[]){
  const b=document.createElement("button");
  b.type="button";b.className="result";
  b.disabled=!r.areaCandidate||!r.holdKnown;
  b.textContent=r.roll+" · Dyelot "+(r.dyelot||"UNKNOWN")+" · "+r.availableLF+" LF · "+r.reason+" · remaining ~"+Math.round(r.estimatedRemainingSF)+" SF";
  b.addEventListener("click",()=>{
    if(!current().ready||current().requestKey!==token){stale();return;}
    selection=r;$("detail").textContent="Roll "+r.roll+" / "+r.dyelot+" · "+r.availableLF+" LF · Estimated remaining "+Math.round(r.estimatedRemainingSF)+" SF. Area is not a certified cut plan.";
    $("dialog").showModal();
  });
  ul.appendChild(b);
 }
}
$("recommend").addEventListener("click",render);
$("cancel").addEventListener("click",()=>{selection=null;$("dialog").close();});
$("confirm").addEventListener("click",()=>{
 if(!selection||!current().ready||current().requestKey!==token){selection=null;$("dialog").close();stale();return;}
 $("reference").value="Roll "+selection.roll+" · Lot "+selection.dyelot;
 $("status").textContent="DEMO reference filled into this paper row only; not saved to a real PO.";
 $("dialog").close();selection=null;
});
$("recommend").disabled=!current().ready;
})();