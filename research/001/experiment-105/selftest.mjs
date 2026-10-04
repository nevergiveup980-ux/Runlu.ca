#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"conflicting_boundary_evidence.mjs")],{encoding:"utf8"}));
if(x.result.conflict.status!=="BOUNDARY_CONFLICT")throw new Error("conflict");
if(x.result.convergent.status!=="BOUNDARY_CONVERGENT")throw new Error("convergent");
if(x.result.incomplete.status!=="BOUNDARY_EVIDENCE_INCOMPLETE")throw new Error("incomplete");
if(JSON.stringify(x.result.conflict.depths)!==JSON.stringify([2,3,1]))throw new Error("depth preservation");
console.log("E105 selftest PASS");