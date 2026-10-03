#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"context_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.FULL.status!=="PASS_NUMERIC_CONTEXT")throw new Error("full");
if(!m.NO_BASELINE.missing.includes("BASELINE"))throw new Error("baseline");
if(!m.NO_POPULATION.missing.includes("POPULATION"))throw new Error("population");
if(m.WRONG_ARITHMETIC.status!=="NUMERIC_REVIEW")throw new Error("arithmetic");
console.log("E071 selftest PASS");