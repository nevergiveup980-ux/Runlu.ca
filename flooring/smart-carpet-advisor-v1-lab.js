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
  const dyeValue=x=>String(x?.dyelot??x?.dyeLot??x?.lot??"").trim();
  const dyeKey=x=>norm(dyeValue(x));
  function lotConstraint({dyelot="",existingRolls=[]}={}){
    const explicit=norm(dyelot),lots=new Set((Array.isArray(existingRolls)?existingRolls:[]).map(dyeKey).filter(Boolean));
    const missing=(Array.isArray(existingRolls)?existingRolls:[]).some(x=>!dyeKey(x));
    if(lots.size>1)return {ok:false,code:"EXISTING_DYELOT_CONFLICT",key:""};
    if(missing)return {ok:false,code:"EXISTING_DYELOT_UNKNOWN",key:""};
    const inherited=[...lots][0]||"";
    if(explicit&&inherited&&explicit!==inherited)return {ok:false,code:"REQUEST_DYELOT_CONFLICT",key:""};
    return {ok:true,key:explicit||inherited};
  }
  function advise({style,colour,quantity,unit,dyelot="",existingRolls=[],items=[],maxResults=6}={}){
    const area=areaSF(quantity,unit),name=norm(style),color=norm(colour);
    if(!name||!color||!area)return {ok:false,code:"COMPLETE_STYLE_COLOUR_AND_AREA",results:[]};
    const constraint=lotConstraint({dyelot,existingRolls});
    if(!constraint.ok)return {ok:false,code:constraint.code,results:[]};
    const results=items.filter(x=>x?.kind==="Carpet Roll"&&norm(x.name)===name&&norm(x.colour)===color).map(x=>{
      const width=widthFeet(x.width),length=number(x.available);
      const availableSF=width*length,needLF=width?area/width:0;
      const reservationsKnown=x.hold?.known===true;
      const physical=number(x.quantity);
      const active=x.selectable===true&&length>0&&physical>0;
      const sufficient=active&&width>0&&availableSF+1e-8>=area;
      const lot=dyeValue(x),lotKey=norm(lot);
      const lotMatch=!!lotKey&&(!constraint.key||lotKey===constraint.key);
      const areaCandidate=sufficient&&lotMatch;
      const ready=areaCandidate&&reservationsKnown;
      const reason=!active?"UNAVAILABLE":!width?"WIDTH_UNKNOWN":!sufficient?"INSUFFICIENT_AREA":!lotKey?"DYELOT_UNKNOWN":!lotMatch?"DYELOT_MISMATCH":!reservationsKnown?"HOLD_STATUS_UNVERIFIED":"AREA_MATCH_ONLY";
      return {id:String(x.id||""),roll:String(x.roll||""),style:String(x.name||""),colour:String(x.colour||""),widthFeet:width,availableLF:length,estimatedAreaSF:availableSF,requiredLF:needLF,estimatedRemainingSF:Math.max(0,availableSF-area),location:String(x.location||""),lot,dyelot:lot,holdKnown:reservationsKnown,areaCandidate,ready,cutVerified:false,reason};
    });
    // Eligible rolls first. Within equally verified candidates, consume the
    // smallest sufficient roll (minimum leftover) before larger stock rolls.
    results.sort((a,b)=>Number(b.ready)-Number(a.ready)||Number(b.areaCandidate)-Number(a.areaCandidate)||Number(b.holdKnown)-Number(a.holdKnown)||a.estimatedRemainingSF-b.estimatedRemainingSF||a.roll.localeCompare(b.roll));
    return {ok:true,requestedSF:area,requiredDyelot:constraint.key||null,cutVerified:false,warning:"Area-only estimate. Same dye lot required for multiple rolls. Verify actual cut dimensions, direction, seams, holds and stock before confirmation.",results:results.slice(0,Math.max(1,Math.min(20,Number(maxResults)||6)))};
  }
  // Multiple rolls are considered only within a SINGLE known dye lot.
  // This is a read-only area feasibility estimate, not a cut plan.
  function adviseSameLotSets({style,colour,quantity,unit,dyelot="",existingRolls=[],items=[],maxRolls=3,maxSets=6}={}){
    const area=areaSF(quantity,unit);
    const constraint=lotConstraint({dyelot,existingRolls});
    if(!constraint.ok)return {ok:false,code:constraint.code,sets:[]};
    const base=advise({style,colour,quantity,unit,dyelot,existingRolls,items,maxResults:20});
    if(!base.ok)return {ok:false,code:base.code,sets:[]};
    // Insufficient individual rolls can still form a valid same-lot group.
    const candidates=base.results.filter(x=>x.holdKnown&&x.dyelot&&x.estimatedAreaSF>0&&x.reason!=="UNAVAILABLE"&&x.reason!=="WIDTH_UNKNOWN"&&x.reason!=="DYELOT_MISMATCH");
    const byLot=new Map();
    for(const roll of candidates){
      const key=norm(roll.dyelot);
      if(!byLot.has(key))byLot.set(key,[]);
      byLot.get(key).push(roll);
    }
    const sets=[];
    for(const [key,rolls] of byLot){
      // Bound combinatorics; prefer shorter rolls first, never mix dye lots.
      const sorted=rolls.sort((a,b)=>a.estimatedAreaSF-b.estimatedAreaSF).slice(0,24);
      function visit(from,chosen,total){
        if(chosen.length>=2&&total+1e-8>=area){
          sets.push({dyelot:chosen[0].dyelot,rolls:chosen.map(x=>x.roll),rollIds:chosen.map(x=>x.id),totalEstimatedSF:total,estimatedRemainingSF:Math.max(0,total-area),cutVerified:false});
          return;
        }
        if(chosen.length>=Math.min(4,Math.max(2,maxRolls))||sets.length>1500)return;
        for(let i=from;i<sorted.length;i++)visit(i+1,[...chosen,sorted[i]],total+sorted[i].estimatedAreaSF);
      }
      visit(0,[],0);
    }
    sets.sort((a,b)=>a.estimatedRemainingSF-b.estimatedRemainingSF||a.rolls.length-b.rolls.length||a.dyelot.localeCompare(b.dyelot));
    return {ok:true,requestedSF:area,cutVerified:false,sets:sets.slice(0,Math.max(1,Math.min(20,maxSets)))};
  }
  const api=Object.freeze({version:"1.2.0-lab",readOnly:true,areaSF,widthFeet,completionGate,sameRequest,lotConstraint,advise,adviseSameLotSets});
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.RUNLUSmartCarpetAdvisorV1=api;
})(typeof window!=="undefined"?window:null);
