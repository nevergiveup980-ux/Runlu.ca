#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"model_admission.mjs")],{encoding:"utf8"}));
if(x.admitted.join(",")!=="ROLLING_WINDOW,EXPONENTIAL_DECAY,LINEAR_TO_ZERO") throw new Error("admitted set mismatch");
if(x.excluded.length!==2) throw new Error("excluded count mismatch");
if(!x.excluded.some(x=>x.id==="POST_HOC_POLYNOMIAL")) throw new Error("post-hoc exclusion missing");
if(!x.excluded.some(x=>x.id==="FUTURE_AWARE_WEIGHT")) throw new Error("future-aware exclusion missing");
console.log("E057 selftest PASS");