// Framework-neutral read-only HTTP handler. Wire behind a real authenticated server.
// resolvePrincipal MUST verify a session/token server-side; never trust request headers as identity.
import {DirectorDashboardService,DirectorAccessDenied} from './director-dashboard-service.mjs';
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export function createDirectorDashboardHandler({pool,authorizeEpisode,resolvePrincipal}={}){
 if(typeof resolvePrincipal!=='function')throw Error('Verified principal resolver required');
 const service=new DirectorDashboardService({pool,authorizeEpisode});
 return async function handle(request){
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
  const respond=(status,body)=>({status,headers,body:JSON.stringify(body)});
  if(request?.method!=='GET')return respond(405,{error:'method_not_allowed'});
  let url;
  try{url=new URL(request.url,'https://stage.invalid')}catch{return respond(400,{error:'bad_request'})}
  if(url.pathname!=='/api/stage/director/episode')return respond(404,{error:'not_found'});
  const episodeId=url.searchParams.get('episodeId');
  if(!episodeId||!ID.test(episodeId))return respond(400,{error:'invalid_episode'});
  try{
   const principal=await resolvePrincipal(request);
   const data=await service.getEpisode({principal,episodeId});
   return respond(200,{data});
  }catch(e){
   if(e instanceof DirectorAccessDenied)return respond(403,{error:'access_denied'});
   // Do not leak SQL details, internal IDs, or provider data to clients.
   return respond(500,{error:'internal_error'});
  }
 };
}
