#!/usr/bin/env node
const rank={ANALYTIC:0,SYNTHETIC:1,OBSERVATIONAL:2,OPERATIONAL:3,PRODUCTION_SAFETY:4};
const source={
 id:"C066-ROOT",stage:"TECHNICAL_RESULT",scope:"SYNTHETIC",
 text:"In this synthetic fixture, the method reduces the declared coordination-regret metric relative to the specified comparator.",
 essential_qualifiers:["synthetic","declared metric","specified comparator"]
};
const derived=[
 {id:"C066-A",parent:"C066-ROOT",stage:"ABSTRACT",scope:"SYNTHETIC",
  text:"In the synthetic audit, the method reduces the declared coordination-regret metric versus the specified comparator.",
  retained:["synthetic","declared metric","specified comparator"]},
 {id:"C066-B",parent:"C066-A",stage:"EXECUTIVE_SUMMARY",scope:"SYNTHETIC",
  text:"The method improves coordination.",
  retained:[]},
 {id:"C066-C",parent:"C066-B",stage:"WEBSITE_CARD",scope:"OPERATIONAL",
  text:"Proven coordination improvement for warehouse operations.",
  retained:[]}
];
function audit(node,parent){
 const reasons=[];
 if(rank[node.scope]>rank[parent.scope]) reasons.push("SCOPE_ESCALATION");
 const missing=source.essential_qualifiers.filter(q=>!node.retained.includes(q));
 if(missing.length) reasons.push("ESSENTIAL_QUALIFIER_LOSS");
 if(/\bwarehouse operations\b|\bdeployment\b|\bsafe for production\b/i.test(node.text) && rank[source.scope]<rank.OPERATIONAL)
   reasons.push("UNSUPPORTED_OPERATIONAL_TRANSFER");
 return {...node,missing_qualifiers:missing,reasons,status:reasons.length?"REVIEW_REQUIRED":"PASS_PROVENANCE"};
}
const byId={[source.id]:source}; const results=[];
for(const d of derived){const r=audit(d,byId[d.parent]);results.push(r);byId[d.id]=r;}
if(results[0].status!=="PASS_PROVENANCE")throw new Error("bounded abstract should pass");
if(results[1].status!=="REVIEW_REQUIRED")throw new Error("qualifier laundering must flag");
if(results[2].status!=="REVIEW_REQUIRED")throw new Error("scope escalation must flag");
console.log(JSON.stringify({
 schema:"e066-claim-provenance-v1",
 source,results,
 invariant:"Derived text may be shorter, but it may not claim a broader evidence scope without a new evidence edge.",
 conclusion:"The abstract preserves scope; the executive summary launders essential qualifiers; the website card both loses qualifiers and escalates to unsupported operational language."
},null,2));