/* Opt-in V8 paper skin for the nested, existing editable Deerfoot paper.
   Does not change the original production editor, inventory or save logic. */
(function(){
"use strict";
const marker="smartrollV8ReferenceStyle";
function locate(win,depth){
 if(!win||depth>8)return null;
 let d;try{d=win.document}catch{return null}
 if(d.querySelector(".invoice .companyInfo")&&d.querySelector(".invoice .priceBand"))return d;
 for(const f of d.querySelectorAll("iframe")){const found=locate(f.contentWindow,depth+1);if(found)return found}
 return null;
}
function apply(){
 const d=locate(window,0);
 if(!d||!d.head||!d.body)return;
 if(d.getElementById(marker))return;
 const link=d.createElement("link");
 link.id=marker;link.rel="stylesheet";link.href="deerfoot-paper-reference-calibration-v1.css?v=8-smartroll-20261024";
 // CSS is scoped to this opt-in nested document, never the shared original.
 d.body.classList.add("referenceCalibration");
 d.head.appendChild(link);
 const b=document.querySelector("#srPilotBanner strong");
 if(b)b.textContent="SmartRoll PAPER PILOT · V8 FORM";
}
document.getElementById("editor")?.addEventListener("load",()=>{[150,450,900,1500].forEach(t=>setTimeout(apply,t))});
[250,700,1300].forEach(t=>setTimeout(apply,t));
setInterval(apply,1200);
})();