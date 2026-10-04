#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"horizon_robustness.mjs")],{encoding:"utf8"}));
const r=x.exponential_roots[0];
const exact=45/(Math.log(8/3)/Math.log(2));
if(Math.abs(r-exact)>1e-7) throw new Error("root mismatch");
if(x.checks.H5.decision!=="A" || x.checks.H100.decision!=="B") throw new Error("decay direction mismatch");
const mid=x.rolling_intervals.find(v=>v.from===5 && v.to===50);
if(!mid || mid.decision!=="A") throw new Error("rolling [5,50) missing");
const tail=x.rolling_intervals.find(v=>v.from===50 && v.to===null);
if(!tail || tail.decision!=="B") throw new Error("rolling tail missing");
console.log("E054 selftest PASS; H*="+r.toFixed(9));
