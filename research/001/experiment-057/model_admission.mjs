#!/usr/bin/env node
const candidates=[
 {id:"ROLLING_WINDOW",g:{G1:1,G2:1,G3:1,G4:1,G5:1,G6:1,G7:1},note:"Natural finite accounting horizon."},
 {id:"EXPONENTIAL_DECAY",g:{G1:1,G2:1,G3:1,G4:1,G5:1,G6:1,G7:1},note:"Half-life has explicit recency semantics."},
 {id:"LINEAR_TO_ZERO",g:{G1:1,G2:1,G3:1,G4:1,G5:1,G6:1,G7:1},note:"Finite horizon with gradual forgetting."},
 {id:"POST_HOC_POLYNOMIAL",g:{G1:0,G2:1,G3:0,G4:0,G5:1,G6:1,G7:0},note:"Constructed after outcome with free coefficients to obtain a desired vote."},
 {id:"FUTURE_AWARE_WEIGHT",g:{G1:0,G2:0,G3:1,G4:0,G5:1,G6:1,G7:0},note:"Uses future regime duration unavailable at decision time."}
];
const gates=["G1","G2","G3","G4","G5","G6","G7"];
for(const c of candidates){
 c.failed=gates.filter(k=>!c.g[k]);
 c.status=c.failed.length===0?"PASS":"FAIL";
 c.vote_eligible=c.status==="PASS";
}
const admitted=candidates.filter(c=>c.vote_eligible).map(c=>c.id);
const excluded=candidates.filter(c=>!c.vote_eligible).map(c=>({id:c.id,failed:c.failed}));
if(admitted.length!==3) throw new Error("expected three preregistered families admitted");
if(candidates.find(c=>c.id==="POST_HOC_POLYNOMIAL").vote_eligible) throw new Error("post-hoc model must fail");
if(candidates.find(c=>c.id==="FUTURE_AWARE_WEIGHT").vote_eligible) throw new Error("future leakage must fail");
console.log(JSON.stringify({
 schema:"e057-model-admission-v1",
 mandatory_gates:gates,
 candidates,
 admitted,
 excluded,
 conclusion:"Consensus depth is computed only over models that pass the preregistered admission gate; excluded probes may be reported but do not vote."
},null,2));