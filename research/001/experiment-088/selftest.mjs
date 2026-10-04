#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"freshness_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
for(const [id,status] of Object.entries({CURRENT:"CURRENT_VERIFICATION",STALE_VERSION:"STALE_VERIFICATION",STALE_DIGEST:"STALE_VERIFICATION",FUTURE:"FUTURE_VERIFICATION",MISSING:"MISSING_BINDING"}))
 if(m[id].status!==status)throw new Error(id);
console.log("E088 selftest PASS");