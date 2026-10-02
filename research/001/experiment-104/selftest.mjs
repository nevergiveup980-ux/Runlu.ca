#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"boundary_evidence_strength.mjs")],{encoding:"utf8"}));
const g=id=>x.results.find(r=>r.id===id);
for(const [id,s] of [["B1","WEAK_BOUNDARY_SUPPORT"],["B3","LIMITED_BOUNDARY_SUPPORT"],["B4","STRONG_BOUNDARY_SUPPORT"],["B6","ARTIFACT_BINDING_FAILED"],["B7","EVIDENCE_STALE"],["B8","MECHANISM_RELEVANCE_UNRESOLVED"]])if(g(id).status!==s)throw new Error(id);
console.log("E104 selftest PASS");