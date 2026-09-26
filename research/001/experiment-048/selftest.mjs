#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const raw=execFileSync(process.execPath,[
  path.join(dir,"near_optimal.mjs"),
  path.join(dir,"sample.synthetic.jsonl"),
  "0.05"
],{encoding:"utf8"});
const x=JSON.parse(raw);
if(x.input.accepted!==10) throw new Error("expected 10 accepted rows");
if(JSON.stringify(x.one_bit.best.cuts)!=="[12]") throw new Error("unexpected 1-bit optimum");
if(Math.abs(x.one_bit.best.regret-0.75)>1e-12) throw new Error("unexpected 1-bit regret");
if(JSON.stringify(x.two_bit.best.cuts)!=="[3,6,12]") throw new Error("unexpected 2-bit optimum");
if(Math.abs(x.two_bit.best.regret-0.1)>1e-12) throw new Error("unexpected 2-bit regret");
if(x.two_bit.equivalent_count!==2) throw new Error("expected two epsilon-equivalent 2-bit codebooks");
if(!x.two_bit.equivalent.some(v=>JSON.stringify(v.cuts)==="[4,7,12]")) throw new Error("missing near-optimal neighbor");
console.log("E048 selftest PASS");
