// Pure, network-free adapter for Runway asynchronous task responses.
// Source: https://docs.dev.runwayml.com/assets/outputs/
// NEVER expose provider output URLs directly to customers: they expire.
const STATES=new Set(["PENDING","RUNNING","SUCCEEDED","FAILED","CANCELLED","THROTTLED"]);
export function normalizeRunwayTask(raw){
 if(!raw||typeof raw!=="object"||typeof raw.id!=="string"||!raw.id.trim()||!STATES.has(raw.status))throw Error("Invalid Runway task");
 const state=raw.status==="SUCCEEDED"?"READY_FOR_INGEST":raw.status==="FAILED"||raw.status==="CANCELLED"?"FAILED":"WAITING";
 const output=state==="READY_FOR_INGEST"?raw.output:null;
 if(state==="READY_FOR_INGEST"&&(!Array.isArray(output)||!output.length||!output.every(u=>typeof u==="string"&&u.startsWith("https://"))))throw Error("Invalid output URLs");
 return {provider:"runway",providerTaskId:raw.id,state,privateOutputUrls:output??[],requiresIngest:state==="READY_FOR_INGEST"};
}
export function publicTaskStatus(task){
 if(!task||typeof task.state!=="string")throw Error("Invalid normalized task");
 return {state:task.state==="READY_FOR_INGEST"?"PROCESSING":task.state};
}
