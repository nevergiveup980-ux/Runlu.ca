#!/usr/bin/env node
const levels=[
 {id:"L0_ANALYTIC",requires:[]},
 {id:"L1_SYNTHETIC",requires:["EXECUTABLE_REPRODUCTION","MODEL_SCENARIO_CORRESPONDENCE"]},
 {id:"L2_OBSERVATIONAL",requires:["TELEMETRY_SEMANTICS","SAMPLING_COVERAGE","UNCERTAINTY_ANALYSIS","REPRESENTATIVE_OBSERVATIONS"]},
 {id:"L3_OPERATIONAL",requires:["CONTROLLED_EVALUATION","DECLARED_COMPARATOR","DECLARED_OBJECTIVE","FAILURE_HANDLING","SAFETY_SEPARATION"]},
 {id:"L4_PRODUCTION_SAFETY",requires:["SAFETY_CASE","HAZARD_ANALYSIS","AUTHORITY_OWNERSHIP","PRODUCTION_VALIDATION","MONITORING","ROLLBACK_RECOVERY","DEPLOYMENT_GOVERNANCE"]}
];
const evidence={
 EXECUTABLE_REPRODUCTION:true,
 MODEL_SCENARIO_CORRESPONDENCE:true,
 TELEMETRY_SEMANTICS:false,
 SAMPLING_COVERAGE:false,
 UNCERTAINTY_ANALYSIS:false,
 REPRESENTATIVE_OBSERVATIONS:false,
 CONTROLLED_EVALUATION:false,
 DECLARED_COMPARATOR:true,
 DECLARED_OBJECTIVE:true,
 FAILURE_HANDLING:true,
 SAFETY_SEPARATION:true,
 SAFETY_CASE:false,
 HAZARD_ANALYSIS:false,
 AUTHORITY_OWNERSHIP:false,
 PRODUCTION_VALIDATION:false,
 MONITORING:false,
 ROLLBACK_RECOVERY:false,
 DEPLOYMENT_GOVERNANCE:false
};
let highest="L0_ANALYTIC";
const audit=[];
for(const level of levels){
 const missing=level.requires.filter(r=>!evidence[r]);
 const pass=missing.length===0;
 audit.push({level:level.id,pass,missing});
 if(pass) highest=level.id;
 else break;
}
if(highest!=="L1_SYNTHETIC") throw new Error("fixture must stop at synthetic scope");
console.log(JSON.stringify({
 schema:"e063-claim-graph-v1",
 levels,
 evidence,
 audit,
 highest_supported_scope:highest,
 forbidden_scope_jump:"L1_SYNTHETIC -> L3_OPERATIONAL or L4_PRODUCTION_SAFETY",
 conclusion:"The declared fixture supports synthetic methodology claims only. Observational, operational, and production-safety claims require new evidence edges."
},null,2));