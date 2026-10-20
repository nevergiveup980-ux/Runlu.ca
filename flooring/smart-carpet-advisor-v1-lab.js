/* RUNLU Flooring OS — Smart Carpet Advisor V1 (isolated read-only lab)
 * Estimates roll candidates from exact product + colour and requested area.
 * Area-only matches are NEVER certified cuttable: actual cut dimensions and
 * roll direction must be verified by Warehouse before picking/cutting.
 * No inventory, PO, Job, Hold or network writes.
 */
(function(root){
  "use strict";
  const norm=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const number=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:0};
  function widthFeet(value){
    const s=String(value??"").trim().toLowerCase();
    if(!s)return 0;
    const ft=s.match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|′)?\s*(?:(\d+(?:\.\d+)?)\s*(?:in|inch|inches|"|″))?$/);
    if(ft){const a=Number(ft[1]),b=Number(ft[2]||0);return a>0&&a<=30&&b>=0&&b<12?a+b/12:0}
    return 0;
  }
  function areaSF(qty,unit){
    const q=number(qty),u=norm(unit);
    if(!q)return 0;
    if(["sf","sq ft","sqft","square feet","square foot"].includes(u))return q;
    if(["syd","sy","sq yd","sqyd","square yards","square yard"].includes(u))return q*9;
    return 0;
  }
  // No advice until the complete sales line has been committed by leaving a field.
  // The UI must call this after blur/change, never on each keystroke.
  function completionGate({style,colour,quantity,unit}={},eventType="blur"){
    const name=norm(style),color=norm(colour),area=areaSF(quantity,unit);
    if(!name||!color||!area)return {ready:false,reason:"INCOMPLETE_LINE",requestKey:""};
    if(eventType!=="blur"&&eventType!=="change")return {ready:false,reason:"AWAIT_FIELD_COMMIT",requestKey:""};
    return {ready:true,reason:"READY",requestKey:JSON.stringify([name,color,area])};
  }
  function sameRequest(request,expectedKey){
    const gate=completionGate(request,"change");
    return gate.ready&&gate.requestKey===expectedKey;
  }
  function advise({style,colour,quantity,unit,items=[],maxResults=6}={}){
    const area=areaSF(quantity,unit),name=norm(style),color=norm(colour);
    if(!name||!color||!area)return {ok:false,code:"COMPLETE_STYLE_COLOUR_AND_AREA",results:[]};
    const results=items.filter(x=>x?.kind==="Carpet Roll"&&norm(x.name)===name&&norm(x.colour)===color).map(x=>{
      const width=widthFeet(x.width),length=number(x.available);
      const availableSF=width*length,needLF=width?area/width:0;
      const reservationsKnown=x.hold?.known===true;
      const physical=number(x.quantity);
      const active=x.selectable===true&&length>0&&physical>0;
      const sufficient=active&&width>0&&availableSF+1e-8>=area;
      const reason=!active?"UNAVAILABLE":!width?"WIDTH_UNKNOWN":!sufficient?"INSUFFICIENT_AREA":!reservationsKnown?"HOLD_STATUS_UNVERIFIED":"AREA_MATCH_ONLY";
      return {id:String(x.id||""),roll:String(x.roll||""),style:String(x.name||""),colour:String(x.colour||""),widthFeet:width,availableLF:length,estimatedAreaSF:availableSF,requiredLF:needLF,estimatedRemainingSF:Math.max(0,availableSF-area),location:String(x.location||""),lot:String(x.lot||""),holdKnown:reservationsKnown,areaCandidate:sufficient,cutVerified:false,reason};
    });
    results.sort((a,b)=>Number(b.areaCandidate)-Number(a.areaCandidate)||Number(b.holdKnown)-Number(a.holdKnown)||a.estimatedRemainingSF-b.estimatedRemainingSF||a.roll.localeCompare(b.roll));
    return {ok:true,requestedSF:area,cutVerified:false,warning:"Area-only estimate. Verify roll width, cut dimensions, orientation, seams, holds and actual stock before confirmation.",results:results.slice(0,Math.max(1,Math.min(20,Number(maxResults)||6)))};
  }
  const api=Object.freeze({version:"1.1.0-lab",readOnly:true,areaSF,widthFeet,completionGate,sameRequest,advise});
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.RUNLUSmartCarpetAdvisorV1=api;
})(typeof window!=="undefined"?window:null);
