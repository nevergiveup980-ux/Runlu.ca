#!/usr/bin/env node
import {createHash} from "node:crypto";
const hash=s=>createHash("sha256").update(s).digest("hex");
const registry={
 ROOT:{id:"ROOT",version:3,text:"In this synthetic fixture, the declared metric improves relative to the specified comparator.",parent:null},
 GOOD:{id:"GOOD",version:1,text:"In the synthetic audit, the declared metric improves versus the specified comparator.",parent:"ROOT",reviewed_parent_version:3},
 STALE:{id:"STALE",version:1,text:"Synthetic comparison shows improvement on the declared metric.",parent:"ROOT",reviewed_parent_version:2},
 MUTATED:{id:"MUTATED",version:1,text:"The synthetic fixture shows lower declared regret.",parent:"ROOT",reviewed_parent_version:3},
 MISSING:{id:"MISSING",version:1,text:"The method improves the declared synthetic metric.",parent:"DOES_NOT_EXIST",reviewed_parent_version:1},
 ORPHAN:{id:"ORPHAN",version:1,text:"Proven coordination improvement.",parent:null}
};
registry.GOOD.reviewed_text_hash=hash(registry.GOOD.text);
registry.STALE.reviewed_text_hash=hash(registry.STALE.text);
registry.MUTATED.reviewed_text_hash=hash("In the synthetic fixture, declared regret is lower."); // published text changed after review
registry.MISSING.reviewed_text_hash=hash(registry.MISSING.text);
function audit(c){
 if(c.id==="ROOT")return {id:c.id,status:"SOURCE_ROOT",reasons:[]};
 if(!c.parent)return {id:c.id,status:"ORPHAN",reasons:["NO_PARENT"]};
 const p=registry[c.parent];
 if(!p)return {id:c.id,status:"MISSING_PARENT",reasons:["PARENT_NOT_RESOLVABLE"]};
 const reasons=[];
 if(c.reviewed_parent_version!==p.version)reasons.push("STALE_PARENT_VERSION");
 if(c.reviewed_text_hash!==hash(c.text))reasons.push("TEXT_CHANGED_AFTER_REVIEW");
 const status=reasons.includes("STALE_PARENT_VERSION")?"STALE_PARENT":
   reasons.includes("TEXT_CHANGED_AFTER_REVIEW")?"UNREVIEWED_MUTATION":"VALID_LINEAGE";
 return {id:c.id,status,reasons,parent:c.parent,current_parent_version:p.version,reviewed_parent_version:c.reviewed_parent_version};
}
const results=Object.values(registry).map(audit);
const status=id=>results.find(x=>x.id===id).status;
if(status("GOOD")!=="VALID_LINEAGE")throw new Error("good lineage failed");
if(status("STALE")!=="STALE_PARENT")throw new Error("stale parent missed");
if(status("MUTATED")!=="UNREVIEWED_MUTATION")throw new Error("mutation missed");
if(status("MISSING")!=="MISSING_PARENT")throw new Error("missing parent missed");
if(status("ORPHAN")!=="ORPHAN")throw new Error("orphan missed");
console.log(JSON.stringify({
 schema:"e067-orphan-claim-audit-v1",
 results,
 publishable:results.filter(x=>["SOURCE_ROOT","VALID_LINEAGE"].includes(x.status)).map(x=>x.id),
 blocked:results.filter(x=>!["SOURCE_ROOT","VALID_LINEAGE"].includes(x.status)).map(x=>x.id),
 conclusion:"Only exact, current, reviewed lineage passes. Cautious wording alone does not repair missing or stale provenance."
},null,2));