#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"vector_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.BALANCED_STRESS.status!=="VECTOR_ROBUST")throw new Error("balanced");
if(m.TAIL_MASKED.status!=="SCALAR_MASKING")throw new Error("tail");
if(m.FAIRNESS_MASKED.status!=="SCALAR_MASKING")throw new Error("fairness");
if(m.MULTIPLE_FAILURES.status!=="MULTI_METRIC_FAIL")throw new Error("multi");
console.log("E082 selftest PASS");