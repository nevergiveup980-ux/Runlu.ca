// Framework-neutral paged read-only recovery endpoint; intentionally not mounted.
// Session resolution and episode authorization are supplied by a trusted server.
import {parseRecoveryPageRequest,projectRecoveryPage} from './director-recovery-pagination.mjs';
import {verifyRecoveryCursor,signRecoveryCursor} from './director-recovery-cursor.mjs';
import {PgDirectorRecoveryPages} from './pg-recovery-pages.mjs';
import {projectDirectorRecovery} from './director-recovery-contract.mjs';
export function createDirectorRecoveryPagedHandler({pool,resolvePrincipal,authorizeEpisode,cursorSecret}={}){
 if(typeof resolvePrincipal!=='function'||typeof authorizeEpisode!=='function'||
    typeof cursorSecret!=='string'||Buffer.byteLength(cursorSecret)<32)
  throw Error('Verified authorization callbacks and cursor secret required');
 const pages=new PgDirectorRecoveryPages(pool);
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
 const respond=(status,body)=>({status,headers,body:JSON.stringify(body)});
 return async function handle(request){
  if(request?.method!=='GET')return respond(405,{error:'method_not_allowed'});
  let url;
  try{url=new URL(request.url,'https://stage.invalid')}catch{return respond(400,{error:'bad_request'})}
  if(url.pathname!=='/api/stage/director/recovery/pages')return respond(404,{error:'not_found'});
  let input;
  try{input=parseRecoveryPageRequest(url.href)}catch{return respond(400,{error:'invalid_page_request'})}
  try{
   const principal=await resolvePrincipal(request);
   if(principal?.verifiedByServer!==true||typeof principal.subject!=='string'||!principal.subject)
    return respond(403,{error:'access_denied'});
   if(await authorizeEpisode({subject:principal.subject,episodeId:input.episodeId,permission:'director:read'})!==true)
    return respond(403,{error:'access_denied'});
   let after=null;\n   const asOf=Date.now();
   try{
    if(input.cursor)after=verifyRecoveryCursor({token:input.cursor,episodeId:input.episodeId,secret:cursorSecret});
   }catch{return respond(400,{error:'invalid_or_expired_cursor'})}
   const result=await pages.inspectPage({episodeId:input.episodeId,pageSize:input.pageSize,after,asOf:after?.issuedAt??asOf});
   const items=projectDirectorRecovery(result.items);
   const nextCursor=result.nextKey?signRecoveryCursor({episodeId:input.episodeId,after:result.nextKey,secret:cursorSecret,issuedAt:after?.issuedAt??asOf}):null;
   return respond(200,{data:projectRecoveryPage({episodeId:input.episodeId,items,pageSize:input.pageSize,nextCursor})});
  }catch{return respond(500,{error:'internal_error'})}
 };
}
