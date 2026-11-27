// Framework-neutral read-only recovery endpoint. Must be mounted behind a real
// server with verified session resolution and episode-specific authorization.
import {DirectorAccessDenied} from './director-dashboard-service.mjs';
import {PgDirectorRecoveryInventory} from './pg-recovery-inventory.mjs';
import {projectDirectorRecovery} from './director-recovery-contract.mjs';
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export function createDirectorRecoveryHandler({pool,resolvePrincipal,authorizeEpisode}={}){
 if(typeof resolvePrincipal!=='function'||typeof authorizeEpisode!=='function')
  throw Error('Verified principal and authorization callbacks required');
 const inventory=new PgDirectorRecoveryInventory(pool);
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
 const respond=(status,body)=>({status,headers,body:JSON.stringify(body)});
 return async function handle(request){
  if(request?.method!=='GET')return respond(405,{error:'method_not_allowed'});
  let url;
  try{url=new URL(request.url,'https://stage.invalid')}catch{return respond(400,{error:'bad_request'})}
  if(url.pathname!=='/api/stage/director/recovery')return respond(404,{error:'not_found'});
  const episodeId=url.searchParams.get('episodeId');
  if(!ID.test(episodeId??''))return respond(400,{error:'invalid_episode'});
  try{
   const principal=await resolvePrincipal(request);
   if(principal?.verifiedByServer!==true||typeof principal.subject!=='string'||!principal.subject)
    throw new DirectorAccessDenied();
   const permitted=await authorizeEpisode({subject:principal.subject,episodeId,permission:'director:read'});
   if(permitted!==true)throw new DirectorAccessDenied();
   const items=await inventory.inspect({episodeId});
   return respond(200,{data:{episodeId,items:projectDirectorRecovery(items)}});
  }catch(e){
   if(e instanceof DirectorAccessDenied)return respond(403,{error:'access_denied'});
   return respond(500,{error:'internal_error'});
  }
 };
}
