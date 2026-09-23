/* RUNLU Flooring OS Universal · Data Adapter
   Local-first storage facade with pluggable cloud-provider boundary.
   U2 default: local. Cloud providers are registered later and never receive secrets from this module. */
(function(){
'use strict';
const BACKEND_STORE='runlu_flooring_universal_data_backend';
const adapters=new Map();

function safeParse(raw,fallback){try{const v=JSON.parse(raw);return v??fallback}catch(_){return fallback}}
function localAdapter(){
  return Object.freeze({
    id:'local',
    label:'Local Device',
    capabilities:Object.freeze({offline:true,sync:false,multiUser:false,tenantServerEnforced:false}),
    read(key,fallback){return safeParse(localStorage.getItem(key),fallback)},
    write(key,value){localStorage.setItem(key,JSON.stringify(value));return value},
    remove(key){localStorage.removeItem(key)},
    rawKeys(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('runlu_flooring_universal_'))out.push(k)}return out.sort()},
    health(){return {ok:true,adapter:'local',detail:'Local device storage ready'}}
  });
}
function register(id,adapter){
  if(!id||!adapter||typeof adapter.read!=='function'||typeof adapter.write!=='function')throw new Error('Invalid data adapter');
  adapters.set(id,adapter);return adapter;
}
register('local',localAdapter());

function backendConfig(){return safeParse(localStorage.getItem(BACKEND_STORE),{mode:'local',provider:'local',configuredAt:null})}
function current(){
  const cfg=backendConfig(),adapter=adapters.get(cfg.provider)||adapters.get('local');
  return adapter;
}
function read(key,fallback){return current().read(key,fallback)}
function write(key,value){return current().write(key,value)}
function remove(key){return current().remove?.(key)}
function useLocal(){const cfg={mode:'local',provider:'local',configuredAt:new Date().toISOString()};localStorage.setItem(BACKEND_STORE,JSON.stringify(cfg));return cfg}
function registerCloudProvider(id,adapter){
  if(id==='local')throw new Error('local is reserved');
  return register(id,adapter);
}
function cloudReady(){
  return Object.freeze({
    contractVersion:1,
    requiredCapabilities:['tenantIsolation','authenticatedActor','serverAuthorization','backupRestore'],
    supportedModes:['local','managed-cloud','bring-your-own-cloud'],
    activeMode:backendConfig().mode||'local',
    activeProvider:backendConfig().provider||'local'
  });
}
window.RUNLUUniversalData=Object.freeze({read,write,remove,current,backendConfig,useLocal,registerCloudProvider,cloudReady});
})();