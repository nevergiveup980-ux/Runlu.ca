// Framework-independent authorization boundary for AI Director.
// The caller must provide a server-verified principal, never client-supplied roles.
import {PgDirectorDashboard} from './pg-director-dashboard.mjs';
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class DirectorAccessDenied extends Error {
 constructor(){super('AI Director access denied');this.name='DirectorAccessDenied';this.statusCode=403;}
}
export class DirectorDashboardService {
 constructor({pool,authorizeEpisode}={}){
  if(typeof authorizeEpisode!=='function')throw Error('Server-side authorization callback required');
  this.authorizeEpisode=authorizeEpisode;
  this.dashboard=new PgDirectorDashboard(pool);
 }
 async getEpisode({principal,episodeId}={}){
  if(typeof episodeId!=='string'||!ID.test(episodeId))throw Error('Invalid episode ID');
  if(!principal||principal.verifiedByServer!==true||typeof principal.subject!=='string'||!principal.subject)
   throw new DirectorAccessDenied();
  // The callback must check this specific episode against server-side membership/ownership.
  const permitted=await this.authorizeEpisode({subject:principal.subject,episodeId,permission:'director:read'});
  if(permitted!==true)throw new DirectorAccessDenied();
  return this.dashboard.getEpisode({episodeId});
 }
}
