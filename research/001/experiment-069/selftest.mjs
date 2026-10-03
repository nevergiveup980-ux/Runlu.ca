#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"dependency_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.COMPLETE.status!=="NO_UNDECLARED_CANDIDATE")throw new Error("complete failed");
if(!m.HIDDEN_NUMBER.undeclared_candidates.includes("NUMERIC_VALUE"))throw new Error("number missed");
if(!m.HIDDEN_COMPARATOR.undeclared_candidates.includes("COMPARATOR"))throw new Error("comparator missed");
if(!m.HIDDEN_SCOPE.undeclared_candidates.includes("SCOPE"))throw new Error("scope missed");
console.log("E069 selftest PASS");