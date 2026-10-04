#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"failure_mode_graph.mjs")],{encoding:"utf8"}));
const f=(m,a,b)=>x.results.find(r=>r.mode===m&&r.a===a&&r.b===b)?.connected;
if(!f("GLOBAL","A","D"))throw new Error("global");
if(f("SCALE_BIAS","A","B"))throw new Error("scale");
if(!f("TRANSFORM_BUG","A","B"))throw new Error("software");
if(!f("SCALE_BIAS","B","C"))throw new Error("cal");
if(!f("LABEL_LEAKAGE","C","D"))throw new Error("label");
if(f("TRANSFORM_BUG","A","D"))throw new Error("AD");
console.log("E097 selftest PASS");