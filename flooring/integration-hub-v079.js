/* RUNLU Deerfoot Flooring OS · V0.3.79 Integration Hub Foundation
   Provider-neutral bridge contract reserved for RFMS and future systems.
   Safety rules:
   - Disabled by default. No external network call is made by this file.
   - No API key, password or token is stored in browser localStorage.
   - Future live connectors should call a RUNLU-controlled server-side proxy / Edge Function.
   - Imports are staged/validated before application; exports require explicit connector support.
   - Existing Flooring OS Orders, POs, Inventory, Pricing, Accounting and history are not rewritten here.
*/
(function(){
'use strict';
if(window.__RUNLU_INTEGRATION_HUB_V079__)return;
window.__RUNLU_INTEGRATION_HUB_V079__=true;

const CONFIG_KEY='runlu_flooring_integrations_v079';
const JOURNAL_KEY='runlu_flooring_integration_journal_v079';
const MAX_JOURNAL=300;
const CAPABILITIES=Object.freeze([
  'customers','products','inventory','orders','purchaseOrders','vendorBills','payments','claims','attachments','scheduling'
]);
const CANONICAL=Object.freeze({
  customer:['id','externalId','name','company','phone','email','address','active','updatedAt'],
  product:['id','externalId','sku','style','colour','manufacturer','supplier','category','purchaseUnit','sellUnit','conversionFactor','standardCost','currentCost','retailPrice','active','updatedAt'],
  inventory:['id','externalId','productId','sku','style','colour','lot','rollNumber','location','quantity','unit','status','updatedAt'],
  order:['id','externalId','orderNumber','customerId','status','items','subtotal','tax','total','createdAt','updatedAt'],
  purchaseOrder:['id','externalId','poNumber','supplier','orderId','status','items','subtotal','createdAt','updatedAt'],
  vendorBill:['id','externalId','invoiceNumber','poNumber','orderId','supplier','status','subtotal','tax','total','invoiceDate','updatedAt'],
  payment:['id','externalId','orderId','amount','method','status','date','updatedAt'],
  claim:['id','externalId','orderId','customerId','status','reason','notes','createdAt','updatedAt'],
  attachment:['id','externalId','parentType','parentId','name','mimeType','url','createdAt'],
  schedule:['id','externalId','orderId','installerId','start','end','status','notes','updatedAt']
});

const adapters=new Map();
const now=()=>new Date().toISOString();
const clone=v=>JSON.parse(JSON.stringify(v));
function readJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v}catch(_){return fallback}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
function config(){
  const base={version:1,provider:'rfms',enabled:false,mode:'disabled',direction:'read-only',lastChangedAt:'',notes:'Reserved interface only'};
  const saved=readJSON(CONFIG_KEY,{});return {...base,...(saved&&typeof saved==='object'?saved:{})};
}
function saveConfig(patch){
  const next={...config(),...patch,lastChangedAt:now()};
  delete next.token;delete next.apiKey;delete next.password;delete next.secret;delete next.authorization;
  writeJSON(CONFIG_KEY,next);return clone(next);
}
function journal(entry){
  const row={id:'int-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),at:now(),...entry};
  const rows=readJSON(JOURNAL_KEY,[]);const next=[row,...(Array.isArray(rows)?rows:[])].slice(0,MAX_JOURNAL);writeJSON(JOURNAL_KEY,next);return clone(row);
}
function getJournal(limit=50){const rows=readJSON(JOURNAL_KEY,[]);return (Array.isArray(rows)?rows:[]).slice(0,Math.max(1,Math.min(Number(limit)||50,MAX_JOURNAL))).map(clone)}
function safeResult(ok,state,extra={}){return {ok:!!ok,state,at:now(),...extra}}
function assertCapability(entity){if(!CAPABILITIES.includes(entity))throw new Error('Unsupported integration capability: '+entity)}
function registerAdapter(name,adapter){
  if(!name||!adapter||typeof adapter!=='object')throw new Error('Adapter name and object are required.');
  adapters.set(String(name).toLowerCase(),adapter);return true;
}
function getAdapter(name=config().provider){return adapters.get(String(name||'').toLowerCase())||null}
async function status(name=config().provider){
  const a=getAdapter(name);if(!a)return safeResult(false,'adapter-missing',{provider:name||''});
  if(typeof a.status!=='function')return safeResult(true,'reserved',{provider:name,live:false});
  try{return await a.status()}catch(e){return safeResult(false,'error',{provider:name,error:e?.message||String(e)})}
}
async function pull(entity,options={}){
  assertCapability(entity);const cfg=config(),a=getAdapter(cfg.provider);
  if(!cfg.enabled)return safeResult(false,'disabled',{provider:cfg.provider,entity,records:[]});
  if(!a||typeof a.pull!=='function')return safeResult(false,'not-implemented',{provider:cfg.provider,entity,records:[]});
  const res=await a.pull(entity,{...options,dryRun:options.dryRun!==false});journal({action:'pull',provider:cfg.provider,entity,state:res?.state||'complete',count:Array.isArray(res?.records)?res.records.length:0,dryRun:options.dryRun!==false});return res;
}
async function push(entity,records,options={}){
  assertCapability(entity);const cfg=config(),a=getAdapter(cfg.provider),list=Array.isArray(records)?records:[];
  if(!cfg.enabled)return safeResult(false,'disabled',{provider:cfg.provider,entity,count:list.length});
  if(cfg.direction==='read-only')return safeResult(false,'read-only',{provider:cfg.provider,entity,count:list.length});
  if(!a||typeof a.push!=='function')return safeResult(false,'not-implemented',{provider:cfg.provider,entity,count:list.length});
  const res=await a.push(entity,clone(list),{...options,dryRun:options.dryRun!==false});journal({action:'push',provider:cfg.provider,entity,state:res?.state||'complete',count:list.length,dryRun:options.dryRun!==false});return res;
}
function previewMap(entity,record,direction='import'){
  assertCapability(entity);const cfg=config(),a=getAdapter(cfg.provider);if(a&&typeof a.map==='function')return clone(a.map(entity,clone(record||{}),direction));
  return {entity,direction,input:clone(record||{}),mapped:null,state:'mapping-not-implemented'};
}

// RFMS placeholder adapter. It intentionally contains no endpoint and no credentials.
registerAdapter('rfms',{
  label:'RFMS',
  capabilities:CAPABILITIES.slice(),
  async status(){return safeResult(true,'reserved',{provider:'rfms',live:false,enabled:config().enabled,message:'RFMS bridge contract reserved; live server-side connector not configured.'})},
  async pull(entity){return safeResult(false,'not-configured',{provider:'rfms',entity,records:[],message:'Configure a server-side RFMS connector before enabling imports.'})},
  async push(entity,records){return safeResult(false,'not-configured',{provider:'rfms',entity,count:Array.isArray(records)?records.length:0,message:'Configure a server-side RFMS connector before enabling exports.'})},
  map(entity,record,direction){return {entity,direction,input:record,mapped:null,state:'mapping-reserved'}}
});

function install(){
  document.documentElement.setAttribute('data-runlu-integration-hub','v079');
  window.dispatchEvent(new CustomEvent('runlu:integration-ready',{detail:{version:'0.3.79',provider:config().provider,enabled:config().enabled}}));
  return true;
}

window.RUNLUIntegrationHubV079={
  version:'0.3.79',capabilities:CAPABILITIES,canonical:CANONICAL,install,
  config:()=>clone(config()),configure:saveConfig,registerAdapter,adapter:getAdapter,status,pull,push,previewMap,journal:getJournal
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
