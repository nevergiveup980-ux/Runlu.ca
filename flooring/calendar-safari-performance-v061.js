/* RUNLU Deerfoot Flooring OS · V0.3.61 Safari Performance Pass */
(function(){
'use strict';
if(window.__runluSafariPerf061)return;
window.__runluSafariPerf061=true;

const ua=navigator.userAgent||'';
const isSafari=/Safari/i.test(ua)&&/AppleWebKit/i.test(ua)&&!/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
const isMac=/Macintosh|Mac OS X/i.test(ua)||/Mac/i.test(navigator.platform||'');
const active=isSafari&&isMac;
const NativeMO=window.MutationObserver||window.WebKitMutationObserver;
const stats={active,callbacks:0,suppressed:0,coalesced:0,lastFlush:0};
window.__runluPerf061=stats;

function generatedElement(el){
  if(!el||el.nodeType!==1)return false;
  const id=String(el.id||'');
  if(/^r(?:56|57|58|59|60|61)/.test(id))return true;
  for(const c of el.classList||[]){if(/^r(?:56|57|58|59|60|61)/.test(String(c)))return true;}
  return false;
}
function generatedNode(n){
  if(!n)return true;
  if(n.nodeType===3||n.nodeType===8)return true;
  return generatedElement(n);
}
function usefulMutation(m){
  if(!m)return false;
  if(m.type!=='childList')return true;
  const changed=[...(m.addedNodes||[]),...(m.removedNodes||[])];
  if(!changed.length)return true;
  return changed.some(n=>!generatedNode(n));
}

if(active&&NativeMO){
  class RunluSafariMutationObserver{
    constructor(callback){
      this._callback=callback;
      this._pending=[];
      this._timer=0;
      this._native=new NativeMO((mutations)=>{
        const useful=mutations.filter(usefulMutation);
        stats.suppressed+=mutations.length-useful.length;
        if(!useful.length)return;
        if(this._timer)stats.coalesced++;
        this._pending.push(...useful);
        if(this._timer)return;
        this._timer=window.setTimeout(()=>this._flush(),72);
      });
    }
    _flush(){
      if(this._timer){window.clearTimeout(this._timer);this._timer=0;}
      if(!this._pending.length)return;
      const batch=this._pending.splice(0);
      stats.callbacks++;
      stats.lastFlush=Date.now();
      try{this._callback(batch,this)}catch(err){console.error('RUNLU Safari observer callback failed',err)}
    }
    observe(target,options){return this._native.observe(target,options)}
    disconnect(){
      if(this._timer){window.clearTimeout(this._timer);this._timer=0;}
      this._pending.length=0;
      return this._native.disconnect();
    }
    takeRecords(){
      const native=this._native.takeRecords().filter(usefulMutation);
      if(this._pending.length){const p=this._pending.splice(0);return p.concat(native)}
      return native;
    }
  }
  window.MutationObserver=RunluSafariMutationObserver;
  if(window.WebKitMutationObserver)window.WebKitMutationObserver=RunluSafariMutationObserver;
}

function addStyle(){
  if(document.getElementById('r61style'))return;
  const s=document.createElement('style');s.id='r61style';s.textContent=`
  .r61perf{display:inline-flex;align-items:center;gap:4px;border:1px solid #cfdad4;background:#f6faf8;color:#416154;border-radius:999px;padding:3px 6px;font-size:7.5px;font-weight:800;white-space:nowrap}.r61dot{width:6px;height:6px;border-radius:50%;background:#55906e}.r61perf.off{opacity:.62}.r61perf.off .r61dot{background:#9aa6a0}
  `;document.head.appendChild(s);
}
function badge(){
  addStyle();
  let b=document.getElementById('r61perf');
  if(!b){b=document.createElement('span');b.id='r61perf';b.className='r61perf'+(active?'':' off');const host=document.getElementById('r57bar')||document.querySelector('.r54toolbar')||document.querySelector('#installerCalendarV053 .r54top');if(host)host.appendChild(b);else return}
  b.innerHTML=`<span class="r61dot"></span>${active?'Safari optimized':'Performance guard ready'}`;
  b.title=active?'Safari/WebKit observer bursts are coalesced and self-generated Calendar mutations are ignored.':'Chrome/other browsers keep their native observer behavior.';
}
function install(){addStyle();setTimeout(badge,300);setTimeout(badge,900);}
window.RUNLUSafariPerformanceV061={install,active,stats};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
