#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"claim_linter.mjs")],{encoding:"utf8"}));
if(x.fixtures[0].status!=="NO_SCOPE_OVERREACH_DETECTED")throw new Error("bounded fixture failed");
if(x.fixtures[1].status!=="REVIEW_REQUIRED")throw new Error("operational overreach missed");
if(x.fixtures[2].status!=="REVIEW_REQUIRED")throw new Error("production overreach missed");
console.log("E064 selftest PASS");