#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"standardization.mjs")],{encoding:"utf8"}));
if(!x.results.every(r=>r.direction==="A>B"))throw new Error("direction should remain A>B");
if(!x.results.every(r=>Math.abs(r.difference-.1)<1e-12))throw new Error("difference should remain .10");
if(new Set(x.results.map(r=>r.A.toFixed(12))).size<2)throw new Error("target should alter absolute rates");
console.log("E074 selftest PASS");