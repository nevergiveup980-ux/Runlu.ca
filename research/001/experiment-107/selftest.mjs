#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"conditioning_granularity.mjs")],{encoding:"utf8"}));
const g=id=>x.audits.find(a=>a.id===id);
if(g("G0").status!=="CONFLICT_PRESENT")throw new Error("G0");
if(g("G1").status!=="CONFLICT_PRESENT")throw new Error("G1");
if(g("G2").status!=="NO_WITHIN_CONTEXT_CONFLICT")throw new Error("G2");
if(g("G3").admitted!==false)throw new Error("G3");
if(x.family_status!=="GRANULARITY_SENSITIVE")throw new Error("family");
console.log("E107 selftest PASS");