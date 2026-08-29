/* RUNLU Deerfoot Flooring OS · V0.3.62 Safari Flicker / Render Burst Fix */
(function(){
'use strict';
if(window.__runluSafariRender062)return;
window.__runluSafariRender062=true;
const ua=navigator.userAgent||'';
const active=/Safari/i.test(ua)&&/AppleWebKit/i.test(ua)&&!/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua)&&(/Macintosh|Mac OS X/i.test(ua)||/Mac/i.test(navigator.platform||''));
let timer=0,busy=false,baseRender=null;
function addStyle(){
  if(document.getElementById('r62style'))return;
  const s=document.createElement('style');s.id='r62style';s.textContent=`
  .r62badge{display:inline-flex;align-items:center;gap:4px;border:1px solid #cfdad4;background:#f6faf8;color:#416154;border-radius:999px;padding:3px 6px;font-size:7.5px;font-weight:800;white-space:nowrap}.r62badge:before{content:'';width:6px;height:6px;border-radius:50%;background:#55906e}
  @supports (-webkit-touch-callout:none){.r54side,.r54roster,.r54contacts{-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}.r54contacts{contain:paint;isolation:isolate}.r54side{contain:layout paint}}
  `;document.head.appendChild(s);
}
function finishLayers(){
  try{window.RUNLUCalendarViewsV055?.install?.()}catch(_){}
  try{window.RUNLUCalendarGroupsV056?.render?.()}catch(_){}
  try{window.RUNLUCalendarSchemaV058?.render?.()}catch(_){}
  try{window.RUNLUEventRailV059?.render?.()}catch(_){}
  try{window.RUNLUCHCPeopleV060?.render?.()}catch(_){}
}
function patchReplica(){
  const api=window.RUNLUInstallerReplicaV054;
  if(!active||!api||typeof api.render!=='function'||api.__r62patched)return;
  api.__r62patched=true;
  baseRender=api.render.bind(api);
  api.render=function(){
    if(busy)return;
    clearTimeout(timer);
    timer=setTimeout(()=>{
      const roster=document.querySelector('.r54roster'),contacts=document.querySelector('.r54contacts'),main=document.querySelector('.r54main');
      const scroll={roster:roster?.scrollTop||0,contacts:contacts?.scrollTop||0,main:main?.scrollTop||0,left:main?.scrollLeft||0};
      busy=true;
      try{baseRender();}finally{busy=false;}
      requestAnimationFrame(()=>{
        finishLayers();
        requestAnimationFrame(()=>{
          const r=document.querySelector('.r54roster'),c=document.querySelector('.r54contacts'),m=document.querySelector('.r54main');
          if(r)r.scrollTop=scroll.roster;if(c)c.scrollTop=scroll.contacts;if(m){m.scrollTop=scroll.main;m.scrollLeft=scroll.left;}
        });
      });
    },90);
  };
}
function badge(){
  let b=document.getElementById('r62badge');if(b)return;
  const host=document.getElementById('r57bar')||document.querySelector('.r54top');if(!host)return;
  b=document.createElement('span');b.id='r62badge';b.className='r62badge';b.textContent=active?'Safari flicker guard':'Render guard ready';host.appendChild(b);
}
function install(){addStyle();setTimeout(patchReplica,280);setTimeout(()=>{patchReplica();badge();},850);setTimeout(patchReplica,1500);}
window.RUNLUSafariRenderV062={install,active};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
