#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"dual_verifier.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.VALID.verifierOutcome!=="AGREEMENT_PASS")throw new Error("valid");
if(m.INVALID.verifierOutcome!=="AGREEMENT_FAIL")throw new Error("invalid");
if(m.A_BUG.verifierOutcome!=="VERIFIER_DISAGREEMENT")throw new Error("disagreement");
if(m.SHARED_SPEC_BUG.specRisk!=="SHARED_SPECIFICATION_RISK")throw new Error("shared spec");
if(x.decisions.find(d=>d.id==="SHARED_SPEC_BUG").decision!=="BLOCK_SPEC_DEPENDENT_ACCEPTANCE")throw new Error("block");
console.log("E090 selftest PASS");