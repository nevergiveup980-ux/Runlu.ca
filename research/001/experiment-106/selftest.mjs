#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"conflict_decomposition.mjs")],{encoding:"utf8"}));
if(x.result.heterogeneous.pooled_status!=="POOLED_CONFLICT")throw new Error("pooled");
if(x.result.heterogeneous.conditioned_status!=="CONTEXT_EXPLAINS_APPARENT_CONFLICT")throw new Error("heterogeneous");
if(x.result.trueConflict.conditioned_status!=="WITHIN_CONTEXT_CONFLICT")throw new Error("control");
console.log("E106 selftest PASS");