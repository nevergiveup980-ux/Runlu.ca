#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"transitive_provenance.mjs")],{encoding:"utf8"}));
const p=(a,b)=>x.pairs.find(v=>v.a===a&&v.b===b);
if(p("EXP_A","EXP_B").status!=="HIDDEN_COMMON_ANCESTOR")throw new Error("A-B");
if(p("EXP_A","EXP_C").status!=="NO_DECLARED_COMMON_ROOT")throw new Error("A-C");
if(p("EXP_A","EXP_D").status!=="HIDDEN_COMMON_ANCESTOR")throw new Error("A-D");
console.log("E085 selftest PASS");