#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"claim_graph.mjs")],{encoding:"utf8"}));
if(x.highest_supported_scope!=="L1_SYNTHETIC") throw new Error("scope must stop at L1");
if(!x.audit.some(a=>a.level==="L2_OBSERVATIONAL"&&!a.pass)) throw new Error("L2 failure missing");
if(!x.audit.find(a=>a.level==="L2_OBSERVATIONAL").missing.includes("REPRESENTATIVE_OBSERVATIONS")) throw new Error("representative data gap missing");
console.log("E063 selftest PASS");