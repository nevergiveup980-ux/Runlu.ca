#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"provenance_audit.mjs")],{encoding:"utf8"}));
if(x.results[0].status!=="PASS_PROVENANCE")throw new Error("abstract should pass");
if(!x.results[1].reasons.includes("ESSENTIAL_QUALIFIER_LOSS"))throw new Error("summary qualifier loss missed");
if(!x.results[2].reasons.includes("SCOPE_ESCALATION"))throw new Error("website scope escalation missed");
if(!x.results[2].reasons.includes("UNSUPPORTED_OPERATIONAL_TRANSFER"))throw new Error("operational transfer missed");
console.log("E066 selftest PASS");