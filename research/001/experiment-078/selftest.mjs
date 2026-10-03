#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"dependence_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.publication.map(r=>[r.id,r]));
if(m.CARTESIAN_BOX.decision!=="SIGN_UNRESOLVED")throw new Error("box");
if(m.POST_HOC_POSITIVE_FILTER.sign!=="ROBUST_A")throw new Error("manufactured result missing");
if(m.POST_HOC_POSITIVE_FILTER.decision!=="REJECT_CONSTRAINT")throw new Error("bad constraint not rejected");
console.log("E078 selftest PASS");