/* RUNLU Deerfoot Flooring OS · V0.3.64.2 Operations Navigation */
(function(){
'use strict';
if(window.__runluOperationsNav0642)return;window.__runluOperationsNav0642=true;
function rename(){
  const b=document.querySelector('nav button[data-page="install"]');
  if(b&&b.textContent!=='Operations'){
    b.textContent='Operations';
    b.title='Field operations · Installation · Calendar · People';
  }
}
function patch(){
  if(typeof window.renderNav==='function'&&!window.__r642RenderNavPatched){
    const old=window.renderNav;
    window.__r642RenderNavPatched=true;
    window.renderNav=function(){const r=old.apply(this,arguments);rename();return r};
  }
  rename();
}
function install(){patch();setTimeout(patch,220);setTimeout(patch,850)}
window.RUNLUOperationsNavV0642={install,rename};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();