#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"evidence_census.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
for(const [id,n] of Object.entries({P20:20,P3:3,P2:2,P1:1}))
 if(m[id].uniqueCriticalRootCount!==n||m[id].rawObserverCount!==20)throw new Error(id);
if(x.rootCountSensitivityRange.min!==1||x.rootCountSensitivityRange.max!==20)throw new Error("range");
console.log("E095 selftest PASS");