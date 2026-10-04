#!/usr/bin/env node
const fixtures=[
 {id:"STABLE",artifact:"sha256:A",oldVerifier:"V1",oldRule:"R1",old:"PASS",newVerifier:"V2",newRule:"R1",now:"PASS",meta:true},
 {id:"BUG_FIXED",artifact:"sha256:B",oldVerifier:"V1",oldRule:"R1",old:"PASS",newVerifier:"V2",newRule:"R1",now:"FAIL",meta:true},
 {id:"RULE_CHANGE",artifact:"sha256:C",oldVerifier:"V1",oldRule:"R1",old:"PASS",newVerifier:"V2",newRule:"R2",now:"FAIL",meta:true},
 {id:"MISSING_META",artifact:"sha256:D",oldVerifier:null,oldRule:null,old:"PASS",newVerifier:"V2",newRule:"R1",now:"PASS",meta:false}
];
function audit(x){
 if(!x.meta||!x.oldVerifier||!x.oldRule)return {...x,status:"UNREPRODUCIBLE_VERIFICATION"};
 if(x.oldRule!==x.newRule)return {...x,status:"RULESET_CHANGED"};
 if(x.old==="PASS"&&x.now==="FAIL")return {...x,status:"VERIFIER_OBSOLETE"};
 return {...x,status:"CURRENT_VERIFIER"};
}
const results=fixtures.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
const expected={STABLE:"CURRENT_VERIFIER",BUG_FIXED:"VERIFIER_OBSOLETE",RULE_CHANGE:"RULESET_CHANGED",MISSING_META:"UNREPRODUCIBLE_VERIFICATION"};
for(const [id,s] of Object.entries(expected))if(m[id].status!==s)throw new Error(id);
function publication(s){
 if(s==="CURRENT_VERIFIER")return "VERIFICATION_SURVIVES";
 if(s==="RULESET_CHANGED")return "REVIEW_UNDER_DECLARED_RULESET";
 return "REVERIFY_AND_PROPAGATE_IMPACT";
}
console.log(JSON.stringify({schema:"e089-verifier-audit-v1",results,decisions:results.map(r=>({id:r.id,decision:publication(r.status)})),
 conclusion:"Artifact identity can remain unchanged while verification validity changes because verifier logic or its declared rules changed."},null,2));