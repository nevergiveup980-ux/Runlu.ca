#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
function run(){
  return JSON.parse(execFileSync(process.execPath,[
    path.join(dir,"bootstrap_uncertainty.mjs"),
    path.join(dir,"sample.synthetic.jsonl"),
    "300","47001"
  ],{encoding:"utf8"}));
}
const a=run(), b=run();
if(JSON.stringify(a)!==JSON.stringify(b)) throw new Error("seeded bootstrap is not deterministic");
if(a.input.accepted!==10 || a.input.replicates!==300) throw new Error("input summary mismatch");
if(!a.uncertainty.optimal_two_bit_regret) throw new Error("missing uncertainty interval");
const sum=a.threshold_stability.two_bit.top.reduce((s,x)=>s+x.count,0);
if(sum<=0) throw new Error("missing threshold frequencies");
if(a.threshold_stability.one_bit.dominant.share<=0 || a.threshold_stability.one_bit.dominant.share>1) throw new Error("bad dominant share");
console.log("E047 selftest PASS");
