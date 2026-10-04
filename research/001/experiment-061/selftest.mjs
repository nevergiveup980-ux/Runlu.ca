#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"vocabulary_sensitivity.mjs")],{encoding:"utf8"}));
if(x.classification!=="VOCABULARY_ROBUST")throw new Error("classification mismatch");
for(const r of Object.values(x.results)){
 if(Math.abs(r.A_neff-1)>1e-12)throw new Error("A Neff must remain 1");
 if(Math.abs(r.exp_pair_similarity-1)>1e-12)throw new Error("exp similarity must remain 1");
}
console.log("E061 selftest PASS");