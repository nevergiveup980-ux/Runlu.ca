// Dry-run provider dispatcher. No network calls, credentials or paid provider SDKs.
// This adapter models a provider acceptance, rejection or uncertain response.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class DirectorDryRunDispatcher {
 constructor({preflight,coordinator,provider}){
  if(typeof preflight?.authorize!=='function'||typeof coordinator?.acknowledge!=='function'||
     typeof coordinator?.flagUnknown!=='function'||typeof provider?.submit!=='function')
   throw Error('Dry-run dispatcher dependencies required');
  this.preflight=preflight;this.coordinator=coordinator;this.provider=provider;
  this.inFlight=new Set();
 }
 async dispatch({episodeId,shotId,attemptId}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid dry-run identity');
  if(this.inFlight.has(attemptId))throw Error('Duplicate dry-run dispatch blocked');
  this.inFlight.add(attemptId);
  const ids={episodeId,shotId,attemptId};
  try{
   // No provider call if the preflight fails. A real provider adapter must
   // additionally solve the pause-after-preflight race before production use.
   const auth=await this.preflight.authorize(ids);
   if(auth?.authorized!==true)throw Error('Preflight did not authorize');
   let response;
   try{response=await this.provider.submit(ids)}
   catch{response=null}
   if(response?.accepted===true&&typeof response.providerTaskId==='string'&&ID.test(response.providerTaskId)){
    try{return await this.coordinator.acknowledge({...ids,providerTaskId:response.providerTaskId})}
    catch{return {state:'UNKNOWN',retryAllowed:false,reason:'acknowledgement_uncertain'}}
   }
   // Even an explicit rejection is not assumed free or safely retryable.
   // Reconciliation is required unless the provider contract proves otherwise.
   try{return await this.coordinator.flagUnknown(ids)}
   catch{return {state:'UNKNOWN',retryAllowed:false,reason:'reconciliation_write_uncertain'}}
  }finally{this.inFlight.delete(attemptId)}
 }
}
