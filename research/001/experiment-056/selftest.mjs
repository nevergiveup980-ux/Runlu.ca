#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"three_model_consensus.mjs")],{encoding:"utf8"}));
if(Math.abs(x.L_star-77)>1e-12) throw new Error("linear flip must be 77");
const f=x.examples;
if(!f.unanimous_A.unanimous || f.unanimous_A.consensus_action!=="A") throw new Error("unanimous A failed");
if(f.two_of_three_A.consensus_depth!==2 || f.two_of_three_A.consensus_action!=="A") throw new Error("2/3 A failed");
if(!f.unanimous_B.unanimous || f.unanimous_B.consensus_action!=="B") throw new Error("unanimous B failed");
if(f.two_of_three_B.consensus_depth!==2 || f.two_of_three_B.consensus_action!=="B") throw new Error("2/3 B failed");
console.log("E056 selftest PASS");