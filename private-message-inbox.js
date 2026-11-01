(()=>{'use strict';
const labels={"title": ["Private message inbox", "私密留言收件箱", "Messages privés", "Mensajes privados"], "back": ["Control Center", "控制中心", "Centre de contrôle", "Centro de control"], "intro": ["Review visitor messages and update their status. Only the site owner can access this inbox.", "查看访客留言并更新处理状态。仅站主可以访问此收件箱。", "Consultez les messages et leur statut. Accès réservé au propriétaire du site.", "Consulta mensajes y actualiza su estado. Acceso exclusivo del propietario."], "login": ["Sign in through Control Center to continue.", "请先在控制中心登录。", "Connectez-vous via le centre de contrôle.", "Inicia sesión en el centro de control."], "denied": ["This account does not have inbox access.", "此账户没有收件箱访问权限。", "Ce compte ne peut pas accéder aux messages.", "Esta cuenta no tiene acceso a los mensajes."], "loading": ["Loading…", "加载中…", "Chargement…", "Cargando…"], "error": ["Unable to load messages. Please retry or sign in again.", "无法加载留言，请重试或重新登录。", "Impossible de charger les messages. Réessayez ou reconnectez-vous.", "No se pueden cargar los mensajes. Reintenta o vuelve a iniciar sesión."], "saveError": ["Status was not saved. Refresh and try again.", "状态未保存，请刷新后重试。", "Statut non enregistré. Actualisez et réessayez.", "No se guardó el estado. Actualiza y reintenta."], "empty": ["No messages in this view.", "此分类暂无留言。", "Aucun message dans cette vue.", "No hay mensajes en esta vista."], "all": ["All statuses", "全部状态", "Tous les statuts", "Todos los estados"], "pending": ["Pending", "待处理", "À traiter", "Pendiente"], "reviewed": ["Reviewed", "已查看", "Consulté", "Revisado"], "archived": ["Archived", "已归档", "Archivé", "Archivado"], "refresh": ["Refresh", "刷新", "Actualiser", "Actualizar"], "previous": ["Previous", "上一页", "Précédent", "Anterior"], "next": ["Next", "下一页", "Suivant", "Siguiente"], "signout": ["Sign out", "退出登录", "Déconnexion", "Cerrar sesión"], "anonymous": ["Anonymous", "匿名访客", "Anonyme", "Anónimo"], "reply": ["Reply requested", "希望收到回复", "Réponse demandée", "Solicita respuesta"], "noReply": ["No reply requested", "未要求回复", "Aucune réponse demandée", "No solicita respuesta"], "noEmail": ["No email supplied", "未提供邮箱", "Aucun e-mail fourni", "Sin correo electrónico"], "category": ["Category", "留言类型", "Catégorie", "Categoría"], "collaboration": ["Collaboration", "合作联系", "Collaboration", "Colaboración"], "feedback": ["Feedback", "意见反馈", "Avis", "Comentarios"], "product": ["Product", "产品咨询", "Produit", "Producto"], "other": ["Other", "其他", "Autre", "Otro"], "status": ["Status", "处理状态", "Statut", "Estado"]};

const $=id=>document.getElementById(id),cloud=window.RUNLU.cloud,db=cloud.getClient();
let offset=0,epoch=0,rows=[],hasNext=false,noticeKey='',busy=false;
const size=20,columns='id,category,name,email,message,wants_reply,language,status,created_at';
function t(key){const i=['en','zh','fr','es'].indexOf(document.documentElement.dataset.runluLanguage||document.documentElement.lang);return labels[key]?.[i<0?0:i]||key}
function notice(key){noticeKey=key;$('notice').textContent=key?t(key):''}
function clear(){rows=[];$('messages').replaceChildren();$('inbox').hidden=true}
function controls(){for(const id of ['refresh','filter'])$(id).disabled=busy;$('previous').disabled=busy||offset===0;$('next').disabled=busy||!hasNext;$('page').textContent=String(offset/size+1)}
function node(tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e}
function render(){
 $('messages').replaceChildren();
 for(const row of rows){
  const card=node('article','','card');card.append(node('h2',row.name||t('anonymous')));
  card.append(node('p',new Date(row.created_at).toLocaleString(document.documentElement.lang)+' · '+t(row.category),'meta'));
  card.append(node('p',row.message,'body'));
  card.append(node('p',row.email||t('noEmail')));
  card.append(node('p',t(row.wants_reply?'reply':'noReply'),'meta'));
  const label=node('label',t('status')),select=document.createElement('select');
  for(const status of ['pending','reviewed','archived']){const opt=node('option',t(status));opt.value=status;select.append(opt)}
  select.value=row.status;select.disabled=busy;
  select.addEventListener('change',async()=>{
   const token=epoch,old=row.status,target=select.value;select.disabled=true;
   try{const {data,error}=await db.from('runlu_messages').update({status:target}).eq('id',row.id).eq('status',old).select('id,status').maybeSingle();
    if(token!==epoch)return;if(error||!data||data.status!==target)throw Error('not saved');await load();
   }catch{if(token===epoch){select.value=old;select.disabled=false;notice('saveError')}}
  });
  label.append(select);card.append(label);$('messages').append(card);
 }
 controls();
}
async function load(){
 const token=++epoch;busy=true;clear();notice('loading');controls();
 try{
  const {data:{user},error:authError}=await db.auth.getUser();if(token!==epoch)return;
  if(authError||!user){notice('login');return}
  const {data:profile,error:profileError}=await db.from('runlu_profiles').select('staff_role,account_status').eq('user_id',user.id).maybeSingle();if(token!==epoch)return;
  if(profileError)throw profileError;
  if(profile?.staff_role!=='owner'||profile?.account_status!=='active'){notice('denied');return}
  let query=db.from('runlu_messages').select(columns).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+size);
  if($('filter').value)query=query.eq('status',$('filter').value);
  const {data,error}=await query;if(token!==epoch)return;if(error)throw error;
  hasNext=data.length>size;rows=data.slice(0,size);$('inbox').hidden=false;notice(rows.length?'':'empty');
 }catch{if(token===epoch){clear();notice('error')}}
 finally{if(token===epoch){busy=false;render()}}
}
$('filter').addEventListener('change',()=>{offset=0;load()});$('refresh').addEventListener('click',load);
$('next').addEventListener('click',()=>{offset+=size;load()});$('previous').addEventListener('click',()=>{offset=Math.max(0,offset-size);load()});
$('signout').addEventListener('click',async()=>{++epoch;clear();notice('login');const {error}=await db.auth.signOut();if(error)notice('error')});
document.addEventListener('DOMContentLoaded',()=>{notice(noticeKey);render()});
window.addEventListener('runlu:languagechange',()=>{notice(noticeKey);render()});
db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){++epoch;clear();notice('login')}else if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')setTimeout(load,0)});
load();
})();
