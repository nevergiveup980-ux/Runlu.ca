/* Paper-reference-only measurement aids; never loaded by production templates. */
(function(){
"use strict";
const invoice=document.getElementById("invoice");
if(!invoice)return;
const grid=document.getElementById("calibrationGrid");
const points=document.getElementById("calibrationPoints");
const check=[
["Customer","soldLines"],["Line items","items"],["Notes","notesBox"],
["Payment","paymentBox"],["Totals","totalsBox"],["Terms","terms"],
["Signature","authLine"],["Footer","invoiceNoBottom"]
];
const overlay=document.createElement("div");overlay.id="calibrationOverlay";
overlay.setAttribute("aria-hidden","true");
const gridLayer=document.createElement("div");gridLayer.className="calibrationGridLayer";overlay.appendChild(gridLayer);
for(const [label,cls] of check){
 const el=invoice.querySelector("."+cls);
 if(!el)continue;
 const marker=document.createElement("span");marker.className="calibrationLandmark";marker.dataset.anchor=cls;marker.textContent=label;
 overlay.appendChild(marker);
}
invoice.appendChild(overlay);
function position(){
 const parent=invoice.getBoundingClientRect();
 // Use physical dimensions in the fixed Letter layout; overlay follows all preview transforms.
 for(const marker of overlay.querySelectorAll(".calibrationLandmark")){
  const target=invoice.querySelector("."+marker.dataset.anchor);
  if(!target)continue;
  const x=target.offsetLeft,y=target.offsetTop;
  marker.style.left=x+"px";marker.style.top=y+"px";
 }
}
function refresh(){
 invoice.classList.toggle("calibrationShowGrid",!!grid?.checked);
 invoice.classList.toggle("calibrationShowPoints",!!points?.checked);
 position();
}
grid?.addEventListener("change",refresh);
points?.addEventListener("change",refresh);
window.addEventListener("resize",position);
refresh();
})();