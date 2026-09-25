#!/usr/bin/env node
const claims={
 A:{id:"A",value:75.29,unit:"percent reduction",metric:"expected queue-choice regret",denominator:"E0 expected regret",population:"uniform iid queue pairs 0..15",window:"single allocation",scope:"SYNTHETIC"},
 B:{id:"B",value:82.4,unit:"percent reduction",metric:"expected queue-choice regret",denominator:"E0 expected regret",population:"uniform iid queue pairs 0..15",window:"single allocation",scope:"SYNTHETIC"},
 C:{id:"C",value:82.4,unit:"percent reduction",metric:"expected queue-choice regret",denominator:"E0 expected regret",population:"SURGE-only synthetic queue pairs",window:"single allocation",scope:"SYNTHETIC"},
 D:{id:"D",value:71.0,unit:"percent reduction",metric:"expected queue-choice regret",denominator:"E0 expected regret",population:"observed warehouse opportunities",window:"calendar day",scope:"OBSERVATIONAL"},
 E:{id:"E",value:70.0,unit:"percent reduction",metric:"collision rate",denominator:"baseline collision rate",population:"uniform iid queue pairs 0..15",window:"single allocation",scope:"SYNTHETIC"},
 F:{id:"F",value:79.0,unit:"percent reduction",metric:null,denominator:"E0 expected regret",population:"uniform iid queue pairs 0..15",window:"single allocation",scope:"SYNTHETIC"}
};
function cmp(x,y){
 const checks={
  SAME_METRIC:x.metric==null||y.metric==null?null:x.metric===y.metric,
  COMPATIBLE_DENOMINATOR:x.denominator==null||y.denominator==null?null:x.denominator===y.denominator,
  COMPATIBLE_POPULATION:x.population==null||y.population==null?null:x.population===y.population,
  COMPATIBLE_WINDOW:x.window==null||y.window==null?null:x.window===y.window,
  COMPATIBLE_SCOPE:x.scope==null||y.scope==null?null:x.scope===y.scope
 };
 const vals=Object.values(checks);
 const status=vals.includes(null)?"REVIEW_REQUIRED":vals.includes(false)?"NOT_COMPARABLE":"COMPARABLE";
 return {pair:[x.id,y.id],checks,status};
}
const results=[cmp(claims.A,claims.B),cmp(claims.A,claims.C),cmp(claims.A,claims.D),cmp(claims.A,claims.E),cmp(claims.A,claims.F)];
const get=id=>results.find(r=>r.pair[1]===id);
if(get("B").status!=="COMPARABLE")throw new Error("control pair should compare");
if(get("C").checks.COMPATIBLE_POPULATION!==false)throw new Error("population mismatch missed");
if(get("D").checks.COMPATIBLE_SCOPE!==false||get("D").checks.COMPATIBLE_WINDOW!==false)throw new Error("scope/window mismatch missed");
if(get("E").checks.SAME_METRIC!==false)throw new Error("metric mismatch missed");
if(get("F").status!=="REVIEW_REQUIRED")throw new Error("unknown metadata should review");
console.log(JSON.stringify({schema:"e072-comparability-v1",claims,results,
 conclusion:"Side-by-side comparison requires compatible metric, denominator, population, window, and evidence scope; arithmetic validity alone is insufficient."},null,2));