/* RUNLU Deerfoot Flooring OS · V0.3.64.1 People Entry Fix */
(function(){
'use strict';
if(window.__runluPeopleEntry0641)return;window.__runluPeopleEntry0641=true;
const $=s=>document.querySelector(s);
function style(){if($('#r641style'))return;const s=document.createElement('style');s.id='r641style';s.textContent=`
#r641bar{display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:7px 10px;border:1px solid #d7dfdb;border-bottom:0;background:#f7faf8;position:relative;z-index:40}
#r641bar .r641label{margin-right:auto;font-size:8.5px;color:#64736c;font-weight:800}
#r641people{border:1px solid #315d49;background:#315d49;color:#fff;border-radius:6px;padding:6px 10px;font-size:9px;font-weight:900;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.06)}
#r641people:hover{filter:brightness(.96)}
#r641people:focus{outline:2px solid #a8c5b6;outline-offset:2px}
@media(max-width:720px){#r641bar{padding:6px 8px}#r641bar .r641label{display:none}#r641people{width:100%}}
`;document.head.appendChild(s)}
function ensure(){style();if($('#r641bar'))return true;const cal=$('#installerCalendarV053'),install=$('#install');if(!cal||!install)return false;const bar=document.createElement('div');bar.id='r641bar';bar.innerHTML='<span class="r641label">Calendar people directory · Installer · CHC · Sales</span><button id="r641people" type="button">👥 People Manager</button>';cal.parentNode.insertBefore(bar,cal);$('#r641people').onclick=()=>{const api=window.RUNLUPeopleManagerV064;if(api&&typeof api.open==='function')api.open();else alert('People Manager is still loading. Please try again in a moment.')};return true}
function install(){let tries=0;const timer=setInterval(()=>{tries++;if(ensure()||tries>30)clearInterval(timer)},150);setTimeout(ensure,700);setTimeout(ensure,1600);}
window.RUNLUPeopleEntryV0641={install,ensure};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
