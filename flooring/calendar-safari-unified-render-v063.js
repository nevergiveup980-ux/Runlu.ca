/* RUNLU Deerfoot Flooring OS · V0.3.63 Unified Safari Render Gate */
(function(){
'use strict';
if(window.__runluSafariUnified063)return;
window.__runluSafariUnified063=true;
const ua=navigator.userAgent||'';
const active=/Safari/i.test(ua)&&/AppleWebKit/i.test(ua)&&!/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua)&&(/Macintosh|Mac OS X/i.test(ua)||/Mac/i.test(navigator.platform||''));
const PreviousMO=window.MutationObserver||window.WebKitMutationObserver;
let refreshTimer=0,refreshing=false;
function inCalendar(node){
  if(!node||node.nodeType!==1)return false;
  if(node.id==='rep54'||node.id==='installerCalendarV053')return true;
  try{return !!node.closest?.('#rep54,#installerCalendarV053')}catch(_){return false}
}
if(active&&PreviousMO){
  class RunluUnifiedObserver{
    constructor(callback){
      this._callback=callback;
      this._native=new PreviousMO((mutations)=>{
        const useful=mutations.filter(m=>!inCalendar(m.target));
        if(!useful.length)return;
        try{this._callback(useful,this)}catch(err){console.error('RUNLU unified observer callback failed',err)}
      });
    }
    observe(target,options){return this._native.observe(target,options)}
    disconnect(){return this._native.disconnect()}
    takeRecords(){return this._native.takeRecords().filter(m=>!inCalendar(m.target))}
  }
  window.MutationObserver=RunluUnifiedObserver;
  if(window.WebKitMutationObserver)window.WebKitMutationObserver=RunluUnifiedObserver;
}
function readMode(){try{return JSON.parse(localStorage.getItem('runlu_calendar_dual_edit_mode_v057')||'"form"')}catch(_){return'form'}}
function finish(){
  if(!document.querySelector('#rep54'))return;
  if(refreshing)return;refreshing=true;
  try{window.RUNLUCalendarViewsV055?.install?.()}catch(_){}
  try{window.RUNLUCalendarGroupsV056?.render?.()}catch(_){}
  try{window.RUNLUCalendarDualEditV057?.setMode?.(readMode())}catch(_){}
  try{window.RUNLUCalendarSchemaV058?.render?.()}catch(_){}
  try{window.RUNLUEventRailV059?.render?.()}catch(_){}
  try{window.RUNLUCHCPeopleV060?.render?.()}catch(_){}
  refreshing=false;
}
function schedule(ms=120){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(finish)),ms)}
function addStyle(){if(document.getElementById('r63style'))return;const s=document.createElement('style');s.id='r63style';s.textContent='.r63badge{display:inline-flex;align-items:center;gap:4px;border:1px solid #cfdad4;background:#f6faf8;color:#416154;border-radius:999px;padding:3px 6px;font-size:7.5px;font-weight:800;white-space:nowrap}.r63badge:before{content:"";width:6px;height:6px;border-radius:50%;background:#3e8a62}';document.head.appendChild(s)}
function badge(){addStyle();if(document.getElementById('r63badge'))return;const host=document.getElementById('r57bar')||document.querySelector('.r54top');if(!host)return;const b=document.createElement('span');b.id='r63badge';b.className='r63badge';b.textContent=active?'Safari unified renderer':'Unified renderer ready';b.title='Calendar DOM mutations are no longer allowed to recursively trigger the enhancement stack. Data/UI actions schedule one controlled decoration pass.';host.appendChild(b)}
function patchFunctions(){
  if(typeof window.saveInstall==='function'&&!window.__r63save){const old=window.saveInstall;window.__r63save=true;window.saveInstall=function(){const r=old.apply(this,arguments);schedule(150);return r}}
  if(typeof window.go==='function'&&!window.__r63go){const old=window.go;window.__r63go=true;window.go=function(){const r=old.apply(this,arguments);schedule(180);return r}}
}
function bind(){if(document.documentElement.dataset.r63bound)return;document.documentElement.dataset.r63bound='1';document.addEventListener('click',()=>schedule(130),true);document.addEventListener('change',()=>schedule(120),true);document.addEventListener('input',e=>{if(e.target?.closest?.('#rep54,#r56modal,#r57modal,#install'))schedule(180)},true);window.addEventListener('storage',schedule)}
function install(){addStyle();bind();setTimeout(()=>{patchFunctions();finish();badge()},500);setTimeout(()=>{patchFunctions();finish();badge()},1200);setTimeout(patchFunctions,2200)}
window.RUNLUSafariUnifiedV063={install,active,refresh:()=>schedule(0)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
