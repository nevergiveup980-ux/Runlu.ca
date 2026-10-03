#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"dependency_graph.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.ALL_PASS.efficiencyPassCount!==3)throw new Error("raw");
if(m.ALL_PASS.independentEfficiencyConfirmations!==1)throw new Error("dependency");
if(m.SAFETY_FAIL.status!=="PROTECTED_FAIL")throw new Error("protected");
console.log("E083 selftest PASS");