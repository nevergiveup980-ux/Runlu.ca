(()=>{
'use strict';
const badge=document.getElementById('inboxPendingBadge'),cloud=window.RUNLU?.cloud;
if(!badge||!cloud)return;
let generation=0,count=null,state='hidden';
const copy={en:{pending:n=>`${n} pending messages`,empty:'No pending messages',error:'Message count unavailable'},zh:{pending:n=>`${n} 条待处理留言`,empty:'暂无待处理留言',error:'留言数量暂时无法获取'},fr:{pending:n=>`${n} messages à traiter`,empty:'Aucun message à traiter',error:'Nombre de messages indisponible'},es:{pending:n=>`${n} mensajes pendientes`,empty:'No hay mensajes pendientes',error:'Recuento de mensajes no disponible'}};
function render(){
 const words=copy[document.documentElement.dataset.runluLanguage]||copy.en;
 badge.hidden=state==='hidden';badge.dataset.pending=String(state==='ready'&&count>0);
 badge.textContent=state==='hidden'?'':state==='error'?words.error:count>0?words.pending(count):words.empty;
}
function clear(){generation++;state='hidden';count=null;render()}
async function refresh(){
 if(document.hidden)return;
 const token=++generation;
 try{
  const user=await cloud.auth.user();if(token!==generation)return;
  if(!user){clear();return}
  const profile=await cloud.from('runlu_profiles').select('staff_role,account_status').eq('user_id',user.id).maybeSingle();
  if(token!==generation)return;
  if(profile.error)throw profile.error;
  if(profile.data?.staff_role!=='owner'||profile.data?.account_status!=='active'){clear();return}
  const result=await cloud.from('runlu_messages').select('id',{count:'exact',head:true}).eq('status','pending');
  if(token!==generation)return;
  if(result.error||!Number.isInteger(result.count))throw Error('Count unavailable');
  count=result.count;state='ready';render();
 }catch{if(token===generation){count=null;state='error';render()}}
}
cloud.auth.onAuthStateChange(()=>{clear();setTimeout(refresh,0)});
window.addEventListener('runlu:languagechange',render);
document.addEventListener('DOMContentLoaded',render);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
window.addEventListener('focus',refresh);
window.addEventListener('pageshow',refresh);
setInterval(refresh,60000);
refresh();
})();
