import {projectDirectorDashboard} from './director-dashboard-contract.mjs';
// Browser-safe read-only dashboard client. No credentials or tokens in URLs.
export class DirectorDashboardClient {
 constructor({fetchImpl}={}){const request=fetchImpl??((...args)=>globalThis.fetch(...args));if(typeof request!=='function')throw Error('fetch required');this.fetchImpl=request;}
 async load(episodeId,{signal}={}){
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(episodeId??''))throw Error('Invalid episode ID');
  const url='/api/stage/director/episode?episodeId='+encodeURIComponent(episodeId);
  let response;
  try{response=await this.fetchImpl(url,{method:'GET',credentials:'same-origin',cache:'no-store',headers:{accept:'application/json'},signal})}
  catch(e){if(e?.name==='AbortError')throw e;throw new Error('network_error')}
  if(response.status===401||response.status===403)throw new Error('access_denied');
  if(!response.ok)throw new Error('server_error');
  const contentType=response.headers?.get?.('content-type')??'';
  if(!contentType.includes('application/json'))throw new Error('invalid_response');
  let body;try{body=await response.json()}catch{throw new Error('invalid_response')}
  if(!body?.data||body.data.episodeId!==episodeId)throw new Error('invalid_response');
  try{return projectDirectorDashboard(body.data)}catch{throw new Error('invalid_response')}
 }
}
