#!/usr/bin/env node
const nodes={
 SPEC_TARGET:{type:"SPEC",up:[]},
 ORACLE_COPY:{type:"ORACLE",klass:"DERIVED_FROM_SPEC",up:["SPEC_TARGET"]},
 ORACLE_TRANSITIVE:{type:"ORACLE",klass:"DERIVED_FROM_SPEC",up:["REFERENCE_TABLE"]},
 REFERENCE_TABLE:{type:"REFERENCE",up:["SPEC_TARGET"]},
 ORACLE_MATH:{type:"ORACLE",klass:"INDEPENDENT_ANALYTIC",up:["MATH_ROOT"]},
 MATH_ROOT:{type:"ROOT",up:[]},
 ORACLE_EXTERNAL:{type:"ORACLE",klass:"EXTERNAL_REFERENCE",up:["EXT_ROOT"]},
 EXT_ROOT:{type:"ROOT",up:[]},
 ORACLE_EMPIRICAL:{type:"ORACLE",klass:"EMPIRICAL_GROUND_TRUTH_CANDIDATE",up:["MEASUREMENT_ROOT"]},
 MEASUREMENT_ROOT:{type:"ROOT",up:[]}
};
function closure(id){
 const seen=new Set(),stack=[...(nodes[id]?.up||[])];
 while(stack.length){const x=stack.pop();if(seen.has(x))continue;seen.add(x);for(const y of nodes[x]?.up||[])stack.push(y)}
 return seen;
}
function audit(id,target="SPEC_TARGET"){
 const n=nodes[id],c=closure(id),circular=c.has(target);
 let status;
 if(circular)status="CIRCULAR_VALIDATION";
 else if(n.klass==="INDEPENDENT_ANALYTIC")status="NONCIRCULAR_ANALYTIC_ORACLE";
 else if(n.klass==="EXTERNAL_REFERENCE")status="NONCIRCULAR_EXTERNAL_ORACLE";
 else if(n.klass==="EMPIRICAL_GROUND_TRUTH_CANDIDATE")status="NONCIRCULAR_EMPIRICAL_CANDIDATE";
 else status="ORACLE_INDEPENDENCE_UNRESOLVED";
 return {oracle:id,klass:n.klass,closure:[...c],circular,status};
}
const results=["ORACLE_COPY","ORACLE_TRANSITIVE","ORACLE_MATH","ORACLE_EXTERNAL","ORACLE_EMPIRICAL"].map(x=>audit(x));
const m=Object.fromEntries(results.map(x=>[x.oracle,x]));
if(m.ORACLE_COPY.status!=="CIRCULAR_VALIDATION")throw new Error("direct");
if(m.ORACLE_TRANSITIVE.status!=="CIRCULAR_VALIDATION")throw new Error("transitive");
if(m.ORACLE_MATH.status!=="NONCIRCULAR_ANALYTIC_ORACLE")throw new Error("math");
if(m.ORACLE_EMPIRICAL.status!=="NONCIRCULAR_EMPIRICAL_CANDIDATE")throw new Error("emp");
function decision(r){
 if(r.circular)return "REGRESSION_ONLY_NOT_INDEPENDENT_VALIDATION";
 if(r.klass==="EMPIRICAL_GROUND_TRUTH_CANDIDATE")return "AUDIT_MEASUREMENT_PROVENANCE";
 return "ELIGIBLE_AS_INDEPENDENT_ORACLE_CANDIDATE";
}
console.log(JSON.stringify({schema:"e091-oracle-provenance-v1",results,decisions:results.map(r=>({oracle:r.oracle,decision:decision(r)})),
 conclusion:"An expected answer is not independent merely because it is stored as an oracle; if its provenance reaches the target specification, using it to validate that specification is circular."},null,2));