/* Explicit opt-in live read-only Warehouse inventory source for isolated cut preview.
   No credential harvesting, no mutation and no fallback from offline cache. */
(function(root){
"use strict";
const PROJECT="https://ekrnknlawekeoszzkamd.supabase.co";
const KEY="sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn";
const AUTH="runlu-flooring-auth-v1";
const positive=x=>Number.isFinite(Number(x))&&Number(x)>0?Number(x):0;
function widthFt(raw){
 const s=String(raw??"").trim();
 const m=s.match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|′)?\s*(?:(\d+(?:\.\d+)?)\s*(?:in|inch|inches|"|″))?$/i);
 if(!m)return 0;
 const a=Number(m[1]),b=Number(m[2]||0);return a>0&&a<=30&&b>=0&&b<12?a+b/12:0;
}
function adapt(rows){
 return (Array.isArray(rows)?rows:[]).filter(r=>r.dataset_key==="runlu_carpet_inventory_v52").map(r=>{
  const p=r.payload||{},length=positive(p.length);
  const holds=Array.isArray(p.holds)?p.holds:[];
  const holdAmount=p.holdQuantity??p.quantityOnHold??p.reservedQuantity??p.allocatedQuantity;
  const holdKnown=holdAmount!=null||Array.isArray(p.holds);
  const reserved=holdAmount!=null?Number(holdAmount):holds.reduce((sum,x)=>sum+positive(x.quantity),0);
  const available=holdKnown&&Number.isFinite(reserved)&&reserved>=0?Math.max(0,length-reserved):0;
  const status=String(p.status||"");
  return {id:String(r.record_id||p.roll||p.id||""),roll:String(p.roll||""),name:String(p.collection||p.product||""),
   colour:String(p.colour||p.color||""),kind:"Carpet Roll",lot:String(p.lot||""),widthFt:widthFt(p.width),
   available,selectable:length>0&&!p.transferredOut&&String(p.warehouseScope||"").toLowerCase()!=="external"&&!/used up|transferred|at store/i.test(status),
   hold:{known:holdKnown},sourceUpdatedAt:String(r.updated_at||p.updatedAt||"")};
 });
}
async function loadLive(){
 if(!root.supabase?.createClient)throw new Error("Supabase library unavailable");
 const client=root.supabase.createClient(PROJECT,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:false}});
 const session=(await client.auth.getSession()).data?.session;
 if(!session)throw new Error("Sign in to RUNLU central services in this browser before loading live inventory");
 const data=await client.from("warehouse_records").select("dataset_key,record_id,payload,updated_at").eq("dataset_key","runlu_carpet_inventory_v52").is("deleted_at",null).limit(1000);
 if(data.error)throw data.error;
 if(!Array.isArray(data.data))throw new Error("No verified live response");
 if(data.data.length===1000)throw new Error("Inventory query reached row limit; cannot treat as complete");
 return {rolls:adapt(data.data),source:"LIVE_READ_ONLY",fetchedAt:new Date().toISOString()};
}
const api=Object.freeze({version:"2.0-preview",widthFt,adapt,loadLive});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.RUNLUCutPreviewLiveInventoryV2=api;
})(typeof window!=="undefined"?window:null);
