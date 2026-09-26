#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"fragility_margin.mjs")],{encoding:"utf8"}));
if(!(x.epsilonStar>0))throw new Error("epsilon");
if(x.probes[0].status!=="ROBUST_A")throw new Error("nominal");
if(x.probes[1].status!=="ROBUST_A")throw new Error("half");
if(x.probes[2].status!=="BOUNDARY_TOUCHING")throw new Error("touch");
if(x.probes[3].status!=="SIGN_UNRESOLVED")throw new Error("unresolved");
console.log("E079 selftest PASS");