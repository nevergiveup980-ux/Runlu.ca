#!/usr/bin/env node
const cases=[
 {id:"CURRENT",v:"2",d:"sha256:bbb",verified:"2026-09-20T10:00:00Z",run:"2026-09-21T10:00:00Z",rv:"2",rd:"sha256:bbb"},
 {id:"STALE_VERSION",v:"1",d:"sha256:aaa",verified:"2026-09-20T10:00:00Z",run:"2026-09-21T10:00:00Z",rv:"2",rd:"sha256:bbb"},
 {id:"STALE_DIGEST",v:"2",d:"sha256:aaa",verified:"2026-09-20T10:00:00Z",run:"2026-09-21T10:00:00Z",rv:"2",rd:"sha256:bbb"},
 {id:"FUTURE",v:"2",d:"sha256:bbb",verified:"2026-09-22T10:00:00Z",run:"2026-09-21T10:00:00Z",rv:"2",rd:"sha256:bbb"},
 {id:"MISSING",v:"2",d:null,verified:"2026-09-20T10:00:00Z",run:"2026-09-21T10:00:00Z",rv:"2",rd:"sha256:bbb"}
];
function audit(x){
 if(!x.v||!x.d||!x.verified||!x.run||!x.rv||!x.rd)return {...x,status:"MISSING_BINDING"};
 if(new Date(x.verified)>new Date(x.run))return {...x,status:"FUTURE_VERIFICATION"};
 if(x.v!==x.rv||x.d!==x.rd)return {...x,status:"STALE_VERIFICATION"};
 return {...x,status:"CURRENT_VERIFICATION"};
}
const results=cases.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.CURRENT.status!=="CURRENT_VERIFICATION")throw new Error("current");
if(m.STALE_VERSION.status!=="STALE_VERIFICATION")throw new Error("version");
if(m.STALE_DIGEST.status!=="STALE_VERIFICATION")throw new Error("digest");
if(m.FUTURE.status!=="FUTURE_VERIFICATION")throw new Error("future");
if(m.MISSING.status!=="MISSING_BINDING")throw new Error("missing");
const decision=s=>s==="CURRENT_VERIFICATION"?"PROVENANCE_EDGE_CURRENT":"REVERIFY_OR_SUPPLY_IMMUTABLE_EXECUTION_EVIDENCE";
console.log(JSON.stringify({schema:"e088-provenance-freshness-v1",results,decisions:results.map(r=>({id:r.id,decision:decision(r.status)})),
 conclusion:"Previously verified provenance is current only when the verification is bound to the same artifact identity/version/digest used at execution; age alone is not the criterion."},null,2));