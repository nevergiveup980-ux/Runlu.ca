#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"impact_propagation.mjs")],{encoding:"utf8"}));
const pick=(scenario,id)=>x.scenarios[scenario].find(r=>r.id===id).action;
if(pick("CONCLUSION_REVERSED","WEBSITE")!=="BLOCK")throw new Error("transitive block failed");
if(pick("NUMERIC_CORRECTION","TABLE")!=="RE_REVIEW")throw new Error("numeric review failed");
if(pick("NUMERIC_CORRECTION","METHOD_NOTE")!=="UNAFFECTED")throw new Error("unaffected control failed");
if(x.scenarios.RETRACTED.some(r=>r.action!=="BLOCK"))throw new Error("retraction propagation failed");
console.log("E068 selftest PASS");