#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"hypergraph_audit.mjs")],{encoding:"utf8"}));
const all=x.byLayer.allCriticalLayers;
if(all.length!==3)throw new Error("component count");
if(JSON.stringify(all[0])!==JSON.stringify(["A","B","C","D"]))throw new Error("bridge");
if(x.bridgePaths.A_to_D!=="A --SW:S1-- B --CAL:C2-- C --LABEL:L3-- D")throw new Error("path");
for(const k of ["calibration","software","labels"])if(x.byLayer[k].length!==5)throw new Error(k);
console.log("E096 selftest PASS");