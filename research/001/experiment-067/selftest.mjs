#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"orphan_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r.status]));
for(const [id,want] of Object.entries({GOOD:"VALID_LINEAGE",STALE:"STALE_PARENT",MUTATED:"UNREVIEWED_MUTATION",MISSING:"MISSING_PARENT",ORPHAN:"ORPHAN"}))
 if(m[id]!==want)throw new Error(id+" expected "+want+" got "+m[id]);
console.log("E067 selftest PASS");