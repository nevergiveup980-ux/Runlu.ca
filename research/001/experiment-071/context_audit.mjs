#!/usr/bin/env node
const required=["VALUE","UNIT","DENOMINATOR","BASELINE","POPULATION","WINDOW","METRIC","SCOPE"];
const claims=[
 {id:"FULL",text:"Synthetic expected regret falls from 2.65625 to 0.65625 per allocation under the uniform 0–15 fixture, a 75.29% reduction.",
  arithmetic:true,ctx:{VALUE:"75.29",UNIT:"percent reduction",DENOMINATOR:"2.65625 baseline regret",BASELINE:"E0 fixed/pre-agreed role",POPULATION:"uniform iid queue pairs 0..15",WINDOW:"single synthetic allocation",METRIC:"expected queue-choice regret",SCOPE:"synthetic"}},
 {id:"NO_BASELINE",text:"Regret improved by 75.29%.",arithmetic:true,
  ctx:{VALUE:"75.29",UNIT:"percent",DENOMINATOR:null,BASELINE:null,POPULATION:null,WINDOW:null,METRIC:"regret",SCOPE:null}},
 {id:"NO_POPULATION",text:"The 1-bit encoding reduces expected regret by 75.29% versus E0.",arithmetic:true,
  ctx:{VALUE:"75.29",UNIT:"percent reduction",DENOMINATOR:"E0 expected regret",BASELINE:"E0",POPULATION:null,WINDOW:"single allocation",METRIC:"expected regret",SCOPE:"synthetic"}},
 {id:"WRONG_ARITHMETIC",text:"The reduction is 80%.",arithmetic:false,
  ctx:{VALUE:"80",UNIT:"percent reduction",DENOMINATOR:"2.65625",BASELINE:"E0",POPULATION:"uniform iid queue pairs 0..15",WINDOW:"single synthetic allocation",METRIC:"expected regret",SCOPE:"synthetic"}}
];
function audit(c){
 const missing=required.filter(k=>c.ctx[k]==null||c.ctx[k]==="");
 const reasons=[];
 if(!c.arithmetic)reasons.push("ARITHMETIC_FAIL");
 if(missing.length)reasons.push("CONTEXT_INCOMPLETE");
 const status=!c.arithmetic?"NUMERIC_REVIEW":missing.length?"CONTEXT_REVIEW":"PASS_NUMERIC_CONTEXT";
 return {...c,missing,reasons,status};
}
const results=claims.map(audit), get=id=>results.find(x=>x.id===id);
if(get("FULL").status!=="PASS_NUMERIC_CONTEXT")throw new Error("full context failed");
if(get("NO_BASELINE").status!=="CONTEXT_REVIEW")throw new Error("missing baseline missed");
if(!get("NO_BASELINE").missing.includes("BASELINE"))throw new Error("baseline field not detected");
if(!get("NO_POPULATION").missing.includes("POPULATION"))throw new Error("population field not detected");
if(get("WRONG_ARITHMETIC").status!=="NUMERIC_REVIEW")throw new Error("arithmetic failure missed");
console.log(JSON.stringify({schema:"e071-numeric-context-v1",required,results,
 conclusion:"A mathematically correct value can still require review when baseline, denominator, population, window, metric, or scope is missing."},null,2));