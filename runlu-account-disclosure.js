(() => {
'use strict';
const details=document.getElementById('accountDetails');if(!details)return;
const technical=new Set(['planCenter','accessCenter','accessDiagnostic','ordersList','subscriptionsList']);
function revealTarget(){
 const id=(location.hash||'').slice(1);
 if(technical.has(id))details.open=true;
}
window.addEventListener('hashchange',revealTarget);
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');if(!link)return;
 const id=link.getAttribute('href').slice(1);
 if(technical.has(id))details.open=true;
});
revealTarget();
})();