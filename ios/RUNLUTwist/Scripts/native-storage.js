// Native cache survives denied/evicted WebKit storage and mirrors only local game keys.
const nativeBridge=window.webkit?.messageHandlers?.twist;
const storedKeys=["runlu-twist-node001-v1","runlu-twist-node001-v6","twist-lang","twist-reasoning-v1","twist-reflections-v1","twist-studio-v1","twist-verified-pilot-v1","twist-ordering-v1","twist-route-order-v1","twist-classic-content-v6-migrated"];
const nativeCache={};
for(const k of storedKeys){
  const snapshot=window.__twistNativeSnapshot?.[k];
  let v=null;try{v=localStorage.getItem(k);}catch(_){}
  if(nativeBridge&&typeof snapshot==="string")v=snapshot;
  if(typeof v==="string"){nativeCache[k]=v;try{localStorage.setItem(k,v);}catch(_){}}
}
function nativeSave(){if(nativeBridge)nativeBridge.postMessage({type:"save",values:{...nativeCache}});}
const nativeStorage={
 getItem:k=>nativeCache[k]??null,
 setItem(k,v){if(!storedKeys.includes(k))return;nativeCache[k]=String(v);try{localStorage.setItem(k,String(v));}catch(_){}nativeSave();},
 removeItem(k){delete nativeCache[k];try{localStorage.removeItem(k);}catch(_){}nativeSave();}
};
