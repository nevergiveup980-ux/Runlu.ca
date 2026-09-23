/* RUNLU Flooring OS Universal · PWA / Offline Status */
(function(){
'use strict';
let reg=null,installPrompt=null,lastError=null;
const supported=()=>('serviceWorker' in navigator);
async function register(){
 if(!supported())return {ok:false,error:'Service Worker unsupported'};
 try{reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});lastError=null;return {ok:true,scope:reg.scope}}catch(e){lastError=e.message||String(e);return {ok:false,error:lastError}}
}
function installed(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function online(){return navigator.onLine!==false}
function status(){return {supported:supported(),registered:!!reg,installed:installed(),online:online(),installAvailable:!!installPrompt,error:lastError,scope:reg?.scope||null}}
async function install(){if(!installPrompt)return {ok:false,reason:'Browser install prompt unavailable'};installPrompt.prompt();const choice=await installPrompt.userChoice;installPrompt=null;return {ok:choice.outcome==='accepted',outcome:choice.outcome}}
function render(){
 const host=document.getElementById('universalOffline');if(!host)return;const s=status();
 host.innerHTML='<div class="card"><h2>Offline / Install</h2><p class="muted">Universal caches its app shell so the Local-First workspace can reopen without a network connection after the first successful load.</p><div class="uOffline '+(s.supported?'pass':'fail')+'"><div><b>'+(s.online?'ONLINE':'OFFLINE')+'</b><span>Service Worker '+(s.registered?'registered':s.supported?'initializing':'unsupported')+' · '+(s.installed?'installed app':'browser mode')+'</span></div><strong>'+(s.error?'CHECK':'READY')+'</strong></div><div class="uOfflineFacts"><span>App shell <b>'+(s.registered?'Cached / managed':'Pending')+'</b></span><span>Business data <b>Local Device</b></span><span>Durable mirror <b>IndexedDB</b></span><span>Cloud <b>Optional</b></span></div><button class="primary" id="uInstallApp" '+(s.installAvailable?'':'disabled')+'>'+(s.installed?'Installed':'Install App')+'</button><p class="muted">'+(s.installAvailable?'Browser installation is available.':'On iPhone/iPad, installation may be offered through the browser Share → Add to Home Screen flow.')+'</p></div>';
 document.getElementById('uInstallApp').onclick=async()=>{await install();render()};
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;render()});
window.addEventListener('appinstalled',()=>{installPrompt=null;render()});
window.addEventListener('online',render);window.addEventListener('offline',render);
window.RUNLUUniversalPWA=Object.freeze({register,status,install,render});
register().then(()=>render());
})();