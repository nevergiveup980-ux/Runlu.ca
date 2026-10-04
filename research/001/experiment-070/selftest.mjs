#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"numeric_lineage.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.PERCENT.status!=="PASS_NUMERIC_LINEAGE")throw new Error("percent");
if(m.DIFF.status!=="PASS_NUMERIC_LINEAGE")throw new Error("difference");
if(!m.BAD_VALUE.reasons.includes("NUMERIC_MISMATCH"))throw new Error("mismatch");
if(!m.STALE_SOURCE.reasons.includes("STALE_SOURCE_VERSION"))throw new Error("stale");
console.log("E070 selftest PASS");