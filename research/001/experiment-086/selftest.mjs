#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"completeness_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.experiment,r]));
if(m.EXP_A.status!=="COMPLETE_DECLARED_PATHS")throw new Error("A");
if(m.EXP_B.status!=="UNKNOWN_CRITICAL_PATH")throw new Error("B");
if(m.EXP_C.status!=="PARTIAL_PROVENANCE")throw new Error("C");
if(m.EXP_D.status!=="UNKNOWN_CRITICAL_PATH")throw new Error("D");
if(x.pairDecisions[0].decision!=="REPLICATION_INDEPENDENCE_UNRESOLVED")throw new Error("pair");
console.log("E086 selftest PASS");