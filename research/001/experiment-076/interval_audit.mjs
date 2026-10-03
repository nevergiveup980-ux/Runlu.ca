#!/usr/bin/env node
const wStar=.5;
const D=w=>.4*w-.2;
const intervals=[
 {id:"LOW_ROBUST",L:.40,U:.48},
 {id:"HIGH_ROBUST",L:.52,U:.60},
 {id:"CROSSING",L:.46,U:.54},
 {id:"TOUCH_LOW",L:.50,U:.58},
 {id:"TOUCH_HIGH",L:.42,U:.50},
 {id:"POINT_TIE",L:.50,U:.50}
];
function classify(x){
 if(x.L>x.U)throw new Error("invalid interval");
 let status;
 if(x.L===wStar&&x.U===wStar)status="POINT_TIE";
 else if(x.L<wStar&&x.U>wStar)status="BOUNDARY_CROSSING";
 else if(x.L===wStar||x.U===wStar)status="BOUNDARY_TOUCHING";
 else if(x.U<wStar)status="ROBUST_B";
 else if(x.L>wStar)status="ROBUST_A";
 else throw new Error("unclassified");
 return {...x,D_L:D(x.L),D_U:D(x.U),status};
}
const results=intervals.map(classify),get=id=>results.find(x=>x.id===id);
if(get("LOW_ROBUST").status!=="ROBUST_B")throw new Error("low");
if(get("HIGH_ROBUST").status!=="ROBUST_A")throw new Error("high");
if(get("CROSSING").status!=="BOUNDARY_CROSSING")throw new Error("cross");
if(get("TOUCH_LOW").status!=="BOUNDARY_TOUCHING")throw new Error("touch");
if(get("POINT_TIE").status!=="POINT_TIE")throw new Error("tie");
console.log(JSON.stringify({schema:"e076-target-uncertainty-v1",wStar,results,
 conclusion:"When target-population uncertainty crosses the effect-flip boundary, the overall comparison is unresolved over the declared uncertainty set."},null,2));