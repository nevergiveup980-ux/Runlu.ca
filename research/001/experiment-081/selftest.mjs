#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"outcome_normalized.mjs")],{encoding:"utf8"}));
if(x.results[0].status!=="ROBUST_A")throw new Error("half");
if(x.results[1].status!=="BOUNDARY_TOUCHING")throw new Error("touch");
if(x.results[2].status!=="SIGN_UNRESOLVED")throw new Error("over");
const p=x.results[0].nativeParameters;
if(p.COMMON_ADDITIVE.value===p.EASY_ONLY_ADDITIVE.value)throw new Error("native scale");
console.log("E081 selftest PASS");