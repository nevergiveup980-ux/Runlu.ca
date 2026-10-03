#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"ancestry_depth_sensitivity.mjs")],{encoding:"utf8"}));
const counts=x.profiles.map(p=>p.family_count);
if(JSON.stringify(counts)!==JSON.stringify([5,4,2,1]))throw new Error("counts");
if(x.claims[1].claim!=="DIVERSITY_THRESHOLD_MET")throw new Error("depth1");
if(x.claims[2].claim!=="DIVERSITY_THRESHOLD_NOT_MET")throw new Error("depth2");
console.log("E102 selftest PASS");