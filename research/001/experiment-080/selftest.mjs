#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"geometry_audit.mjs")],{encoding:"utf8"}));
const r=x.results;
if(!(r.EASY_ONLY_ADDITIVE.critical>r.COMMON_ADDITIVE.critical))throw new Error("easy");
if(!(r.HARD_ONLY_ADDITIVE.critical>r.COMMON_ADDITIVE.critical))throw new Error("hard");
if(Math.abs(r.RELATIVE_MULTIPLICATIVE.critical-1)>1e-10)throw new Error("relative");
console.log("E080 selftest PASS");