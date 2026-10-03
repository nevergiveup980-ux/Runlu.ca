// E019 reproducibility audit: verifies required Track-A artifacts exist
import fs from "node:fs";
const required=[
 "research/001/experiment-001/simulator.js",
 "research/001/experiment-001/PROTOCOL.md",
 "research/001/experiment-004/simulator.js",
 "research/001/experiment-004/ANALYSIS_PLAN.md",
 "research/001/experiment-005/audit.js"
];
let ok=true;
for(const p of required){
 const exists=fs.existsSync(p);
 console.log((exists?"PASS ":"FAIL ")+p);
 if(!exists) ok=false;
}
if(!ok) process.exit(1);
console.log("PASS Track-A prerequisite artifact audit");
