#!/usr/bin/env node
const obs={
 A:{SOFTWARE:"S1",CALIBRATION:"C1",LABEL:"L1",softwareBridge:"K9",calibrationBridge:"Q1"},
 B:{SOFTWARE:"S1",CALIBRATION:"C2",LABEL:"L2",softwareBridge:"Q2",calibrationBridge:"K9"},
 C:{SOFTWARE:"S2",CALIBRATION:"C2",LABEL:"L3",softwareBridge:"R1",calibrationBridge:"R2"},
 D:{SOFTWARE:"S3",CALIBRATION:"C3",LABEL:"L3",softwareBridge:"T1",calibrationBridge:"T2"},
 E:{SOFTWARE:"S4",CALIBRATION:"C4",LABEL:"L4",softwareBridge:"U1",calibrationBridge:"U2"},
 F:{SOFTWARE:"S4",CALIBRATION:"C4",LABEL:"L5",softwareBridge:"V1",calibrationBridge:"V2"}
};
const pairs=[["A","B"],["B","C"],["C","D"],["E","F"]];
function audit(a,b){
 const x=obs[a],y=obs[b];
 const software=x.SOFTWARE===y.SOFTWARE;
 const calibration=x.CALIBRATION===y.CALIBRATION;
 const label=x.LABEL===y.LABEL;
 const cross=x.softwareBridge===y.calibrationBridge||y.softwareBridge===x.calibrationBridge;
 return {
  pair:a+b,
  SOFTWARE_ONLY:software,
  CALIBRATION_ONLY:calibration,
  SOFTWARE_AND_CALIBRATION:software&&calibration,
  SOFTWARE_OR_LABEL:software||label,
  CROSS_LAYER_INTERACTION:cross
 };
}
const results=pairs.map(([a,b])=>audit(a,b));
const g=p=>results.find(x=>x.pair===p);
if(!g("AB").SOFTWARE_ONLY||g("AB").CALIBRATION_ONLY)throw new Error("AB marginal fixture");
if(!g("AB").CROSS_LAYER_INTERACTION)throw new Error("AB cross-layer interaction");
if(!g("BC").CALIBRATION_ONLY||g("BC").SOFTWARE_ONLY)throw new Error("BC calibration");
if(!g("CD").SOFTWARE_OR_LABEL)throw new Error("CD OR via label");
if(!g("EF").SOFTWARE_AND_CALIBRATION)throw new Error("EF conjunctive");
console.log(JSON.stringify({
 schema:"e098-interaction-failure-v1",obs,results,
 conclusion:"Failure dependence can be conjunctive, disjunctive, or cross-layer. Marginal audits do not exhaust interaction mechanisms."
},null,2));