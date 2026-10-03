#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"reliability_validity.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
for(const [id,status] of Object.entries({GOOD:"RELIABLE_AND_VALID",PRECISE_WRONG:"RELIABLE_BUT_BIASED",NOISY_CENTERED:"NOISY_BUT_UNBIASED",NOISY_BIASED:"UNRELIABLE_AND_BIASED"}))
 if(m[id].status!==status)throw new Error(id);
if(m.PRECISE_WRONG.sd!==0||m.PRECISE_WRONG.bias!==-1)throw new Error("precision-bias");
console.log("E093 selftest PASS");