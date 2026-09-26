#!/usr/bin/env node
const source={
 numeric_tokens:["0.096184","9.6184%"],
 direction_tokens:["reduces regret","lower regret","improves"],
 scope_tokens:["synthetic","warehouse operations","production"],
 comparator_tokens:["robust static","specified comparator"],
 method_tokens:["2-bit codebook","contiguous thresholds"]
};
const claims=[
 {id:"COMPLETE",text:"In the synthetic comparison, the 2-bit codebook reduces regret by 0.096184 versus robust static.",
  declared:["NUMERIC_VALUE","DIRECTION","SCOPE","COMPARATOR","METHOD_DEFINITION"]},
 {id:"HIDDEN_NUMBER",text:"The measured synthetic regret reduction is 0.096184.",
  declared:["DIRECTION","SCOPE"]},
 {id:"HIDDEN_COMPARATOR",text:"The synthetic result improves relative to robust static.",
  declared:["DIRECTION","SCOPE"]},
 {id:"HIDDEN_SCOPE",text:"The method improves warehouse operations.",
  declared:["DIRECTION"]},
 {id:"CONTROL",text:"This note defines the formatting convention for claim IDs.",
  declared:["METHOD_DEFINITION"]}
];
function candidates(text){
 const t=text.toLowerCase(), out=[];
 const hit=arr=>arr.some(x=>t.includes(x.toLowerCase()));
 if(hit(source.numeric_tokens))out.push("NUMERIC_VALUE");
 if(hit(source.direction_tokens))out.push("DIRECTION");
 if(hit(source.scope_tokens))out.push("SCOPE");
 if(hit(source.comparator_tokens))out.push("COMPARATOR");
 if(hit(source.method_tokens))out.push("METHOD_DEFINITION");
 return out;
}
function audit(c){
 const cand=candidates(c.text);
 const missing=cand.filter(x=>!c.declared.includes(x));
 return {...c,text_derived_candidates:cand,undeclared_candidates:missing,
  status:missing.length?"DEPENDENCY_REVIEW":"NO_UNDECLARED_CANDIDATE"};
}
const results=claims.map(audit);
const get=id=>results.find(x=>x.id===id);
if(get("COMPLETE").status!=="NO_UNDECLARED_CANDIDATE")throw new Error("complete fixture failed");
if(!get("HIDDEN_NUMBER").undeclared_candidates.includes("NUMERIC_VALUE"))throw new Error("hidden number missed");
if(!get("HIDDEN_COMPARATOR").undeclared_candidates.includes("COMPARATOR"))throw new Error("hidden comparator missed");
if(!get("HIDDEN_SCOPE").undeclared_candidates.includes("SCOPE"))throw new Error("hidden scope missed");
console.log(JSON.stringify({
 schema:"e069-dependency-completeness-v1",
 results,
 conclusion:"Declared dependency graphs can be incomplete. Conservative text-derived candidates can expose omissions for human review without silently rewriting provenance."
},null,2));