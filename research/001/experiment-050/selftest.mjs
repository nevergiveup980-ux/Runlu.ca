#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const raw=execFileSync(process.execPath,[path.join(dir,"counterexamples.mjs")],{encoding:"utf8"});
const x=JSON.parse(raw);
if(x.counterexample_T1_for_Jsum.hidden_sums.thin!==1200) throw new Error("bad T1 fixture");
if(x.counterexample_T1_for_Jsum.hidden_sums.dense!==4500) throw new Error("bad T1 dense fixture");
if(x.counterexample_T2_for_Jtau.hidden_overdue_counts.twoOverdue!==2) throw new Error("bad J_tau fixture");
if(x.counterexample_T2_for_Jtau.hidden_overdue_counts.oneOverdue!==1) throw new Error("bad J_tau fixture");
if(x.overall!=="There is no objective-independent minimal temporal summary.") throw new Error("missing structural conclusion");
console.log("E050 selftest PASS");
