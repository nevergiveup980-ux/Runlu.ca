#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"comparability_gate.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.pair[1],r]));
if(m.B.status!=="COMPARABLE")throw new Error("B");
if(m.C.checks.COMPATIBLE_POPULATION!==false)throw new Error("C");
if(m.D.status!=="NOT_COMPARABLE")throw new Error("D");
if(m.E.checks.SAME_METRIC!==false)throw new Error("E");
if(m.F.status!=="REVIEW_REQUIRED")throw new Error("F");
console.log("E072 selftest PASS");