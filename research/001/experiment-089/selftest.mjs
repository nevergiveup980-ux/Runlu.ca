#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"verifier_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
for(const [id,status] of Object.entries({STABLE:"CURRENT_VERIFIER",BUG_FIXED:"VERIFIER_OBSOLETE",RULE_CHANGE:"RULESET_CHANGED",MISSING_META:"UNREPRODUCIBLE_VERIFICATION"}))
 if(m[id].status!==status)throw new Error(id);
if(x.decisions.find(d=>d.id==="BUG_FIXED").decision!=="REVERIFY_AND_PROPAGATE_IMPACT")throw new Error("impact");
console.log("E089 selftest PASS");