/* RUNLU Deerfoot Flooring OS · V0.3.66.1 Orders Workflow Colors
   Visual language only; no business/data behavior changes.
   Green = Active / ready to execute
   Gold / amber = People TO Call / follow-up required
   Brick red = Back Order / material path blocked or waiting
   V0.3.63 remains the stable rollback baseline. */
(function(){
'use strict';
if(window.__runluOrdersWorkflowColorsV0661)return;
window.__runluOrdersWorkflowColorsV0661=true;
const by=id=>document.getElementById(id);
function install(){
  if(by('r661workflowColors'))return;
  const s=document.createElement('style');
  s.id='r661workflowColors';
  s.textContent=`
/* ACTIVE · deep Deerfoot/RUNLU green */
.r66drawerHead:not(.back){background:#173d30!important;color:#fff!important}
.r66state:not(.back){background:#e6f1eb!important;color:#245c45!important}

/* BACK ORDER · muted brick red: blocked/waiting, not an error alarm */
.r66drawerHead.back{background:#8a3b32!important;color:#fff!important}
.r66state.back{background:#f8e7e4!important;color:#7d332c!important}

/* PEOPLE TO CALL · gold/amber: follow-up needed */
#r66people.card.r66people{border-left:0!important;overflow:hidden;padding:0!important}
#r66people>.statusLine{margin:0!important;padding:12px 14px!important;background:#b18428!important;color:#fff!important}
#r66people>.statusLine h3{color:#fff!important}
#r66people>.statusLine .muted{color:rgba(255,255,255,.84)!important}
#r66people>.statusLine .tag{background:rgba(255,255,255,.18)!important;border:1px solid rgba(255,255,255,.32)!important;color:#fff!important}
#r66peopleList{padding:9px 14px 14px!important}
.r66toCall{background:#f7edcf!important;color:#765714!important}

/* Shared visual semantics */
#r66people,.r66drawerCol{box-shadow:0 1px 2px rgba(24,44,36,.04)}
`;
  document.head.appendChild(s);
}
window.RUNLUOrdersWorkflowColorsV0661={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
