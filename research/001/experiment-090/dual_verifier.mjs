#!/usr/bin/env node
const fixtures=[
 {id:"VALID",spec:"S1",oracle:"PASS",a:"PASS",b:"PASS"},
 {id:"INVALID",spec:"S1",oracle:"FAIL",a:"FAIL",b:"FAIL"},
 {id:"A_BUG",spec:"S1",oracle:"FAIL",a:"PASS",b:"FAIL"},
 {id:"SHARED_SPEC_BUG",spec:"S_BUG",oracle:"FAIL",a:"PASS",b:"PASS"}
];
function audit(x){
 const agree=x.a===x.b;
 let verifierOutcome=agree?(x.a==="PASS"?"AGREEMENT_PASS":"AGREEMENT_FAIL"):"VERIFIER_DISAGREEMENT";
 const specRisk=agree&&x.a!==x.oracle?"SHARED_SPECIFICATION_RISK":"NO_SHARED_SPEC_RISK_DETECTED";
 return {...x,verifierOutcome,specRisk};
}
const results=fixtures.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.VALID.verifierOutcome!=="AGREEMENT_PASS")throw new Error("valid");
if(m.INVALID.verifierOutcome!=="AGREEMENT_FAIL")throw new Error("invalid");
if(m.A_BUG.verifierOutcome!=="VERIFIER_DISAGREEMENT")throw new Error("disagree");
if(m.SHARED_SPEC_BUG.specRisk!=="SHARED_SPECIFICATION_RISK")throw new Error("shared");
function decision(r){
 if(r.verifierOutcome==="VERIFIER_DISAGREEMENT")return "INVESTIGATE_IMPLEMENTATIONS";
 if(r.specRisk==="SHARED_SPECIFICATION_RISK")return "BLOCK_SPEC_DEPENDENT_ACCEPTANCE";
 return "CONSISTENT_WITH_ORACLE_FIXTURE";
}
console.log(JSON.stringify({schema:"e090-dual-verifier-v1",results,decisions:results.map(r=>({id:r.id,decision:decision(r)})),
 conclusion:"Independent implementations can agree because they share the same specification error; verifier agreement is implementation evidence, not independent validation of the specification."},null,2));