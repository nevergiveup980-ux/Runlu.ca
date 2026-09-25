#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"semantic_scope_review.mjs")],{encoding:"utf8"}));
const implied=x.results.filter(r=>r.kind==="IMPLIED_OVERCLAIM");
const bounded=x.results.filter(r=>r.kind==="BOUNDED_CLAIM");
if(implied.length<3 || implied.some(r=>r.status!=="REVIEW_REQUIRED")) throw new Error("implied overclaim audit failed");
if(bounded.length<3 || bounded.some(r=>r.status!=="PASS_BOUNDED")) throw new Error("bounded claim audit failed");
console.log("E065 selftest PASS");