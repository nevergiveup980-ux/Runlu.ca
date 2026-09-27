#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"oracle_provenance.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.oracle,r]));
if(m.ORACLE_COPY.status!=="CIRCULAR_VALIDATION")throw new Error("copy");
if(m.ORACLE_TRANSITIVE.status!=="CIRCULAR_VALIDATION")throw new Error("transitive");
if(m.ORACLE_MATH.status!=="NONCIRCULAR_ANALYTIC_ORACLE")throw new Error("math");
if(m.ORACLE_EXTERNAL.status!=="NONCIRCULAR_EXTERNAL_ORACLE")throw new Error("external");
if(m.ORACLE_EMPIRICAL.status!=="NONCIRCULAR_EMPIRICAL_CANDIDATE")throw new Error("empirical");
console.log("E091 selftest PASS");