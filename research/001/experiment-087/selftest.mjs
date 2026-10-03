#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"evidence_strength.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.P_VERIFIED.status!=="VERIFIED_PATH")throw new Error("verified");
if(m.P_MACHINE.status!=="MACHINE_SUPPORTED_PATH")throw new Error("machine");
if(m.P_HUMAN.status!=="DECLARED_PATH")throw new Error("human");
if(m.P_INFERRED.status!=="WEAKLY_INFERRED_PATH")throw new Error("inferred");
if(x.decisions.find(v=>v.id==="P_HUMAN").decision!=="REPLICATION_INDEPENDENCE_UNRESOLVED")throw new Error("downgrade");
console.log("E087 selftest PASS");