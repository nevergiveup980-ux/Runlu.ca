/* SmartRoll pilot on the actual nested Deerfoot paper, opt-in URL only.
   Authenticated Warehouse SELECT-only, no PO auto-save and no stock mutation.
   Each Confirm operates on a guarded original paper row. */
(function(){
"use strict";
const adapter=window.RUNLUPaperSmartAdvisorAdapterV1;
const advisor=window.RUNLUSmartCarpetAdvisorV1;
const guard=window.RUNLUSmartRollPaperRowGuardV1;
const inventoryApi=window.RUNLUCutPreviewLiveInventoryV2;
let inventory=[],loadedAt="",loading=false,token=null,candidate=null,epoch=0,lastSuggested=new WeakMap(),lastRow=null;
const outer=document.getElementById("editor");
const text=x=>String(x??"").trim();
function cellText(cell){
 return Array.from(cell?.childNodes||[]).filter(n=>!n.classList?.contains("ppb52InventoryBtn")).map(n=>n.textContent||"").join("").trim();
}
function rowData(tr){return adapter.readRow(Array.from(tr.children).slice(0,5).map(cellText))}
function paperDoc(win,level=0){
 if(!win||level>8)return null;
 let doc;try{doc=win.document}catch{return null}
 if(doc.querySelector("#rows tr"))return doc;
 for(const iframe of doc.querySelectorAll("iframe")){const found=paperDoc(iframe.contentWindow,level+1);if(found)return found}
 return null;
}
function setupShell(){
 if(document.getElementById("srPilotBanner"))return;
 const style=document.createElement("style");style.textContent=`
 #srPilotBanner{position:fixed;top:0;left:0;right:0;z-index:89999;background:#173d30;color:white;padding:8px 12px;font:13px system-ui;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
 #srPilotBanner button,#srDialog button{padding:10px;border-radius:8px;border:0;min-height:42px;font-weight:700}
 #srPilotBanner button{background:#fff;color:#173d30}
 #srDialog{z-index:100002;width:min(700px,calc(100% - 18px));max-height:85vh;overflow:auto;border:0;border-radius:14px;padding:16px;color:#173d30;font:14px system-ui;box-shadow:0 20px 70px #0005}
 #srDialog::backdrop{background:#091a12a8}
 #srChoices{display:grid;gap:8px;max-height:48vh;overflow:auto}
 #srChoices button{text-align:left;background:#e8f2eb;color:#173d30;border:1px solid #c4d9ca}
 #srChoices button[aria-selected=true]{border:3px solid #176044;background:#d7efdf}
 #srChoices button:disabled{opacity:.5}
 .srPilotButton{position:absolute!important;right:.45mm!important;top:50%!important;transform:translateY(-50%)!important;cursor:pointer!important;border-radius:50%!important;z-index:50!important;background:#e7f7ea!important;border:1px solid #24634b!important;color:#174a33!important;min-width:4mm!important;height:4mm!important;font:9pt Arial!important;padding:0!important}
 @media print{#srPilotBanner,#srDialog,.srPilotButton{display:none!important}}
 `;document.head.appendChild(style);
 const banner=document.createElement("div");banner.id="srPilotBanner";banner.innerHTML='<strong>SmartRoll PAPER PILOT</strong><button type="button" id="srLoad">Load LIVE Warehouse (read-only)</button><span id="srSource">No inventory loaded. Existing paper editor remains editable.</span>';
 document.body.appendChild(banner);
 document.getElementById("srLoad").addEventListener("click",loadLive);
 const dialog=document.createElement("dialog");dialog.id="srDialog";dialog.innerHTML='<h2>SmartRoll — Review roll for this PO line</h2><p id="srInfo"></p><div id="srChoices"></div><p>Area-based suggestion only. Dyelot, cut geometry, orientation and holds require Warehouse verification. No stock deducted or PO saved by SmartRoll.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" id="srCancel">Cancel</button><button type="button" id="srConfirm" disabled>Confirm to this paper row</button></div>';
 document.body.appendChild(dialog);
 document.getElementById("srCancel").addEventListener("click",close);
 document.getElementById("srConfirm").addEventListener("click",confirm);
 dialog.addEventListener("cancel",()=>{candidate=null;token=null});
}
function close(){candidate=null;token=null;const d=document.getElementById("srDialog");if(d?.open)d.close()}
function message(s){const el=document.getElementById("srSource");if(el)el.textContent=s}
async function loadLive(){
 if(loading)return;
 loading=true;epoch++;close();inventory=[];loadedAt="";message("Loading authorized Warehouse stock…");
 try{
  const result=await inventoryApi.loadLive();
  inventory=result.rolls.map(r=>({...r,width:r.widthFt?String(r.widthFt)+"'":"",quantity:r.available}));
  loadedAt=result.fetchedAt;epoch++;
  message("LIVE READ-ONLY · "+inventory.length+" rolls · "+new Date(loadedAt).toLocaleString()+" · unknown holds excluded");
 }catch(e){epoch++;message("LIVE unavailable: "+(e?.message||e)+". No cache or DEMO fallback.");}
 finally{loading=false}
}
function openForRow(tr){
 if(!inventory.length||!loadedAt){message("Load LIVE Warehouse stock first. No stale recommendations.");return}
 const req=rowData(tr);
 if(!req.ready)return;
 const g=guard.begin(tr,adapter);if(!g.ok)return;
 const result=adapter.rank(req,inventory,advisor),chosen=(result.results||[]).filter(r=>r.areaCandidate&&r.holdKnown&&r.dyelot);
 token={...g.token,epoch,loadedAt};candidate=null;
 const list=document.getElementById("srChoices");list.replaceChildren();
 document.getElementById("srInfo").textContent=req.style+" / "+req.colour+" · "+req.quantity+" "+req.unit+" · "+(chosen.length?chosen.length+" eligible area candidate(s)":"No safely eligible candidate");
 for(const roll of chosen){
  const b=document.createElement("button");b.type="button";b.textContent="Deerfoot Roll "+roll.roll+" | Dyelot "+roll.dyelot+" | "+roll.widthFeet+" ft wide | "+roll.availableLF+" LF | estimated spare "+Math.round(roll.estimatedRemainingSF)+" SF";
  b.addEventListener("click",()=>{if(!guard.check(token,adapter).ok||token.epoch!==epoch){close();return}candidate=roll;list.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",String(x===b)));document.getElementById("srConfirm").disabled=false});
  list.appendChild(b);
 }
 document.getElementById("srConfirm").disabled=true;
 document.getElementById("srDialog").showModal();
}
function confirm(){
 if(!token||!candidate||!guard.check(token,adapter).ok||token.epoch!==epoch||token.loadedAt!==loadedAt){close();message("PO row or inventory changed; suggestion cancelled.");return}
 const tr=token.row,cell=tr.children[4],win=cell.ownerDocument.defaultView;
 cell.textContent="Roll "+candidate.roll+" · Dyelot "+candidate.dyelot;
 cell.dispatchEvent(new win.Event("input",{bubbles:true}));
 cell.dispatchEvent(new win.Event("change",{bubbles:true}));
 lastSuggested.set(tr,rowData(tr).requestKey);
 const rollNumber=candidate.roll;
 close();tr.scrollIntoView({block:"center",inline:"nearest"});
 message("Roll "+rollNumber+" confirmed into original paper line (draft only).");
}
function scan(){
 const pd=paperDoc(window);if(!pd)return;
 for(const tr of pd.querySelectorAll("#rows tr")){
  if(tr.dataset.srPilotBound)continue;
  tr.dataset.srPilotBound="1";
  const style=tr.children[2],colour=tr.children[3];if(!style||!colour)continue;
  style.style.position="relative";
  const b=pd.createElement("button");b.type="button";b.className="srPilotButton ppb52InventoryBtn";b.contentEditable="false";b.textContent="⌕";b.title="SmartRoll recommendation for this paper row";
  b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openForRow(tr)});
  style.appendChild(b);
  for(const cell of Array.from(tr.children).slice(0,4)){
   cell.addEventListener("focusout",()=>{
    if(!inventory.length)return;
    const data=rowData(tr);if(!data.ready)return;
    if(data.requestKey!==lastSuggested.get(tr)){lastSuggested.set(tr,data.requestKey);openForRow(tr)}
   });
  }
 }
}
setupShell();setInterval(scan,900);outer?.addEventListener("load",()=>setTimeout(scan,300));[300,800,1600].forEach(t=>setTimeout(scan,t));
})();