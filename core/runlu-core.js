(()=>{
'use strict';

const VERSION='0.1.0';
const root=window.RUNLU=window.RUNLU||{};
const bus=new EventTarget();

const byId=id=>document.getElementById(id);
const one=(selector,scope=document)=>scope.querySelector(selector);
const all=(selector,scope=document)=>Array.from(scope.querySelectorAll(selector));

function language(){return document.documentElement.dataset.runluLanguage||'en'}
function setBusy(element,busy=true){if(element)element.disabled=Boolean(busy)}
function setMessage(element,text='',options={}){
  if(!element)return;
  element.textContent=text||'';
  if(options.error===true)element.dataset.runluMessage='error';
  else if(text)element.dataset.runluMessage='ok';
  else delete element.dataset.runluMessage;
}
function safeUrl(value){
  try{
    const url=new URL(String(value||''),window.location.href);
    return ['http:','https:'].includes(url.protocol)?url.href:'';
  }catch{return ''}
}
function safeKey(value,fallback='item'){
  return String(value||fallback).toLowerCase().normalize('NFKD').replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64)||fallback;
}
function safeFileName(value,fallback='file'){
  const raw=String(value||fallback);
  const dot=raw.lastIndexOf('.');
  const ext=dot>0?'.'+raw.slice(dot+1).replace(/[^A-Za-z0-9]/g,'').slice(0,12):'';
  const source=dot>0?raw.slice(0,dot):raw;
  const base=source.normalize('NFKD').replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||fallback;
  return base+ext;
}
function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function formatBytes(value){
  const bytes=Math.max(0,Number(value)||0);
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1048576)return `${(bytes/1024).toFixed(1)} KB`;
  if(bytes<1073741824)return `${(bytes/1048576).toFixed(1)} MB`;
  return `${(bytes/1073741824).toFixed(2)} GB`;
}
function utcStamp(){return new Date().toISOString().replace(/[:.]/g,'-')}
async function sha256(blob){
  if(!window.crypto?.subtle)throw new Error('SHA-256 is unavailable in this browser.');
  const buffer=await blob.arrayBuffer();
  const digest=await crypto.subtle.digest('SHA-256',buffer);
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
function downloadBlob(blob,filename='download'){
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=safeFileName(filename,'download');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function emit(name,detail={}){bus.dispatchEvent(new CustomEvent(name,{detail}))}
function on(name,handler,options){bus.addEventListener(name,handler,options);return()=>bus.removeEventListener(name,handler,options)}
function once(name,handler){return on(name,handler,{once:true})}

root.core={version:VERSION,ready:true};
root.dom={byId,one,all};
root.i18n={language};
root.ui={setBusy,setMessage};
root.security={safeUrl,safeKey,safeFileName,escapeHtml,sha256};
root.files={formatBytes,utcStamp,downloadBlob};
root.events={emit,on,once};

window.dispatchEvent(new CustomEvent('runlu:core-ready',{detail:{version:VERSION}}));
})();
