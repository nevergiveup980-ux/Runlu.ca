// Reference snapshot from Runway Dev official API pricing (2026-10-14).
// USD rates are NOT guaranteed live quotes. Refresh before accepting paid orders.
// Source: https://docs.dev.runwayml.com/guides/pricing/
export const PRICE_SNAPSHOT = Object.freeze({
 asOf:"2026-10-14", currency:"USD", source:"https://docs.dev.runwayml.com/guides/pricing/",
 models:Object.freeze([
  {id:"gen4_turbo",vendor:"runway",usdPerSecond:0.05,capabilities:["image-to-video"],tier:"economy"},
  {id:"gen4.5",vendor:"runway",usdPerSecond:0.12,capabilities:["text-to-video","image-to-video"],tier:"premium"},
  {id:"veo3.1_fast_no_audio",vendor:"runway",usdPerSecond:0.10,capabilities:["text-to-video","no-native-audio"],tier:"balanced"},
  {id:"veo3.1_fast_audio",vendor:"runway",usdPerSecond:0.15,capabilities:["text-to-video","native-audio"],tier:"balanced"},
  {id:"veo3.1_no_audio",vendor:"runway",usdPerSecond:0.20,capabilities:["text-to-video","no-native-audio"],tier:"premium"},
  {id:"veo3.1_audio",vendor:"runway",usdPerSecond:0.40,capabilities:["text-to-video","native-audio"],tier:"premium"}
 ])
});
export function selectCandidates({sourceImage=false,nativeAudio=false,maxUsdPerSecond=Infinity,preferredTier}={}){
 if(typeof sourceImage!=="boolean"||typeof nativeAudio!=="boolean"||typeof maxUsdPerSecond!=="number"||Number.isNaN(maxUsdPerSecond)||maxUsdPerSecond<=0)throw Error("Invalid selection constraints");
 return PRICE_SNAPSHOT.models.filter(m=>
  m.usdPerSecond<=maxUsdPerSecond &&
  (!sourceImage||m.capabilities.includes("image-to-video")) &&
  (!nativeAudio||m.capabilities.includes("native-audio"))
 ).sort((a,b)=>(a.tier===preferredTier?-1:0)-(b.tier===preferredTier?-1:0)||a.usdPerSecond-b.usdPerSecond);
}
export function estimateShotUsd(modelId,seconds,{retryAllowance=1.5}={}){
 const m=PRICE_SNAPSHOT.models.find(x=>x.id===modelId);
 if(!m||!Number.isFinite(seconds)||seconds<=0||!Number.isFinite(retryAllowance)||retryAllowance<1)throw Error("Invalid shot");
 return Math.round(m.usdPerSecond*seconds*retryAllowance*100)/100;
}
