#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"model_consensus.mjs")],{encoding:"utf8"}));
if(x.examples.robust_A.class!=="CONSENSUS_A") throw new Error("robust A failed");
if(x.examples.structural_disagreement.class!=="DISAGREE") throw new Error("disagreement failed");
if(x.examples.robust_B.class!=="CONSENSUS_B") throw new Error("robust B failed");
console.log("E055 selftest PASS");