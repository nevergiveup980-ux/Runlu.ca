#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"measurement_chain.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.CLEAN.status!=="EMPIRICAL_ORACLE_CANDIDATE")throw new Error("clean");
for(const id of ["UNCALIBRATED","TIME_SHIFT","LABEL_LEAK","SELECTIVE_MISSING","WRONG_SCOPE"])
 if(m[id].status!=="GROUND_TRUTH_NOT_ESTABLISHED")throw new Error(id);
console.log("E092 selftest PASS");