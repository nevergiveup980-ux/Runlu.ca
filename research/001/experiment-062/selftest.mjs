#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"claim_ledger.mjs")],{encoding:"utf8"}));
if(x.claim.overall_status!=="UNRESOLVED") throw new Error("overall must remain unresolved");
if(x.methodological_subclaim_status!=="ROBUST") throw new Error("methodological subclaim must be robust");
if(!x.claim.layers.some(l=>l.id==="EMPIRICAL_OPERATIONAL_BOUNDARY"&&l.status==="UNRESOLVED")) throw new Error("boundary missing");
console.log("E062 selftest PASS");