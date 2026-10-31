// Offline evaluation of comparable AI video samples.
// No provider calls. Every score is an explicit human review input.
export function scoreSample(s) {
 const keys=["visual","motion","consistency","audio","promptAdherence"];
 for(const k of keys) if(typeof s?.scores?.[k]!=="number"||!Number.isFinite(s.scores[k])||s.scores[k]<0||s.scores[k]>5) throw Error("Score "+k+" must be 0–5");
 if(!Number.isFinite(s.durationSeconds)||s.durationSeconds<=0)throw Error("Invalid duration");
 if(!Number.isFinite(s.totalBilledCad)||s.totalBilledCad<0)throw Error("Invalid cost");
 if(!Number.isInteger(s.attempts)||s.attempts<1)throw Error("Invalid attempts");
 if(typeof s.provider!=="string"||!s.provider.trim())throw Error("Provider required");
 const w={visual:.3,motion:.25,consistency:.2,audio:.1,promptAdherence:.15};
 const weighted=Object.entries(w).reduce((a,[k,v])=>a+s.scores[k]*v,0);
 const pass=weighted>=3.8 && s.scores.visual>=3 && s.scores.motion>=3 && s.scores.consistency>=3 && s.deliverableVerified===true;
 return {provider:s.provider,weightedScore:Number(weighted.toFixed(2)),pass,chargedCad:s.totalBilledCad,attempts:s.attempts,durationSeconds:s.durationSeconds};
}
export function compareSamples(samples) {
 if(!Array.isArray(samples)||!samples.length)throw Error("Samples required");
 const scored=samples.map(scoreSample);
 const grouped=new Map();
 for(const r of scored){if(!grouped.has(r.provider))grouped.set(r.provider,[]);grouped.get(r.provider).push(r);}
 return [...grouped].map(([provider,rows])=>{
  const accepted=rows.filter(x=>x.pass);
  const billed=rows.reduce((n,x)=>n+x.chargedCad,0);
  const acceptedSeconds=accepted.reduce((n,x)=>n+x.durationSeconds,0);
  return {provider,runs:rows.length,passRate:Number((accepted.length/rows.length).toFixed(3)),averageScore:Number((rows.reduce((n,x)=>n+x.weightedScore,0)/rows.length).toFixed(2)),billedCad:Number(billed.toFixed(2)),costPerAcceptedMinuteCad:acceptedSeconds?Number((billed/acceptedSeconds*60).toFixed(2)):null};
 }).sort((a,b)=>b.passRate-a.passRate||(a.costPerAcceptedMinuteCad??Infinity)-(b.costPerAcceptedMinuteCad??Infinity));
}
