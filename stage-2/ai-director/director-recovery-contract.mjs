// Read-only recovery view projection. No retry, cancel or provider-call actions.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
const STATES=new Set(['DISPATCHING','UNKNOWN']);
export function projectDirectorRecovery(items){
 if(!Array.isArray(items)||items.length>100)throw Error('Invalid recovery inventory');
 const seen=new Set();
 return items.map(item=>{
  if(!item||!ID.test(item.attemptId??'')||!ID.test(item.shotId??'')||
     !STATES.has(item.state)||item.retryAllowed!==false||
     item.requiresManualReconciliation!==true||seen.has(item.attemptId))
   throw Error('Invalid recovery item');
  seen.add(item.attemptId);
  return {
   attemptId:item.attemptId,shotId:item.shotId,state:item.state,
   providerTaskId:typeof item.providerTaskId==='string'&&ID.test(item.providerTaskId)?item.providerTaskId:null,
   retryAllowed:false,requiresManualReconciliation:true,
   label:item.state==='DISPATCHING'?'Submission outcome unconfirmed':'Provider outcome unknown'
  };
 });
}
