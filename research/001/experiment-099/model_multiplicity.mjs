#!/usr/bin/env node
const models=[
 {id:"M1",name:"SOFTWARE_ONLY",admitted:true,basis:"ARCHITECTURE_PATH",verdict:"DEPENDENT"},
 {id:"M2",name:"CALIBRATION_ONLY",admitted:true,basis:"ARCHITECTURE_PATH",verdict:"SEPARATE"},
 {id:"M3",name:"SOFTWARE_AND_CALIBRATION",admitted:true,basis:"CAUSAL_DERIVATION",verdict:"SEPARATE"},
 {id:"M4",name:"CROSS_LAYER_K9",admitted:true,basis:"REPRODUCIBLE_FIXTURE",verdict:"DEPENDENT"},
 {id:"M5",name:"LABEL_ONLY",admitted:false,basis:"UNRESOLVED",verdict:"SEPARATE"}
];
function familyVerdict(xs){
 if(xs.some(x=>x.admission==="UNRESOLVED"))return "UNRESOLVED_FAMILY";
 const v=[...new Set(xs.map(x=>x.verdict))];
 return v.length===1?(v[0]==="DEPENDENT"?"STABLE_DEPENDENT":"STABLE_SEPARATE"):"MODEL_SENSITIVE";
}
const admitted=models.filter(x=>x.admitted);
const aggregate=familyVerdict(admitted);
const cherryDependent=familyVerdict(admitted.filter(x=>x.verdict==="DEPENDENT"));
const cherrySeparate=familyVerdict(admitted.filter(x=>x.verdict==="SEPARATE"));
if(aggregate!=="MODEL_SENSITIVE")throw new Error("family should be sensitive");
if(cherryDependent!=="STABLE_DEPENDENT")throw new Error("dependent cherry");
if(cherrySeparate!=="STABLE_SEPARATE")throw new Error("separate cherry");
if(admitted.some(x=>x.id==="M5"))throw new Error("inadmissible included");
console.log(JSON.stringify({
 schema:"e099-model-multiplicity-v1",
 pair:"AB",models,admitted_model_ids:admitted.map(x=>x.id),
 aggregate,
 selection_demonstration:{
  select_only_dependent_models:cherryDependent,
  select_only_separate_models:cherrySeparate
 },
 conclusion:"The same admissible model family supports opposing subset conclusions. The family-level result is MODEL_SENSITIVE; subset selection can manufacture stability."
},null,2));