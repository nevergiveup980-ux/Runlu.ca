#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"admission_uncertainty.mjs")],{encoding:"utf8"}));
if(x.completions.length!==4) throw new Error("completion count wrong");
if(x.robustness!=="SET_ROBUST" || x.stable_consensus!=="A") throw new Error("fixture should be set-robust A");
if(!x.unresolved.every(m=>Object.values(m.ledger).includes("UNRESOLVED"))) throw new Error("unresolved ledger missing");
console.log("E058 selftest PASS");