/* Read-only sales paper row adapter — no PO/storage/inventory mutations. */
(function(root){
"use strict";
const text=x=>String(x??"").trim();
const normalize=x=>text(x).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function quantity(cell){
 const raw=text(cell),m=raw.match(/^(\d+(?:\.\d+)?)\s*(syd|sy|sq\.?\s*yds?|yds?|sf|sq\.?\s*ft|sqft|sqft\.?|square feet)$/i);
 return m?{quantity:Number(m[1]),unit:/^(syd|sy|sq\.?\s*yds?|yds?)$/i.test(m[2])?"syd":"sf"}:null;
}
function dimensions(cell){
 const s=text(cell),m=s.match(/^(\d+(?:\.\d+)?)\s*(?:ft|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|')?$/i);
 return m?{widthFt:Number(m[1]),lengthFt:Number(m[2])}:null;
}
function readRow(cells){
 const area=quantity(cells?.[0]),size=dimensions(cells?.[1]),style=text(cells?.[2]),colour=text(cells?.[3]);
 if(!style||!colour||!area||area.quantity<=0)return {ready:false,reason:"COMPLETE_STYLE_COLOUR_AND_AREA"};
 return {ready:true,style,colour,quantity:area.quantity,unit:area.unit,cut:size,requestKey:JSON.stringify([normalize(style),normalize(colour),area.quantity*(area.unit==="syd"?9:1),size])};
}
function rank(request,inventory,advisor){
 if(!request?.ready)return {ok:false,code:"INCOMPLETE_ROW",results:[]};
 if(!advisor?.advise)return {ok:false,code:"ADVISOR_UNAVAILABLE",results:[]};
 return advisor.advise({style:request.style,colour:request.colour,quantity:request.quantity,unit:request.unit,items:inventory||[]});
}
const api=Object.freeze({readOnly:true,quantity,dimensions,readRow,rank});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.RUNLUPaperSmartAdvisorAdapterV1=api;
})(typeof window!=="undefined"?window:null);
