#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"joint_uncertainty.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.ROBUST_A_BOX.status!=="ROBUST_A")throw new Error("A");
if(m.ROBUST_B_BOX.status!=="ROBUST_B")throw new Error("B");
if(m.MIXED_BOX.status!=="SIGN_UNRESOLVED")throw new Error("mixed");
if(m.TARGET_ONLY_LOOKS_A.status!=="SIGN_UNRESOLVED")throw new Error("joint");
if(m.TIE_BOX.status!=="EXACT_TIE_ONLY")throw new Error("tie");
console.log("E077 selftest PASS");