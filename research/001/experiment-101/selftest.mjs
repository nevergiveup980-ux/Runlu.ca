#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"transitive_model_ancestry.mjs")],{encoding:"utf8"}));
const g=(a,b)=>x.pairs.find(p=>p.a===a&&p.b===b);
if(!g("SPEC_A","SPEC_B").common.includes("FRAMEWORK_X"))throw new Error("AB");
if(!g("SPEC_A","SPEC_C").common.includes("ASSUMPTION_ROOT"))throw new Error("AC");
if(!g("SPEC_D","SPEC_E").common.includes("LOSS_ROOT"))throw new Error("DE");
if(g("SPEC_A","SPEC_D").status!=="NO_DECLARED_COMMON_ANCESTOR")throw new Error("AD");
if(x.deepestClusters.ASSUMPTION_ROOT.length!==3||x.deepestClusters.LOSS_ROOT.length!==2)throw new Error("clusters");
console.log("E101 selftest PASS");