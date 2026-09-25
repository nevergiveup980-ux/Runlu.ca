#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"interval_audit.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.LOW_ROBUST.status!=="ROBUST_B")throw new Error("low");
if(m.HIGH_ROBUST.status!=="ROBUST_A")throw new Error("high");
if(m.CROSSING.status!=="BOUNDARY_CROSSING")throw new Error("cross");
if(m.TOUCH_LOW.status!=="BOUNDARY_TOUCHING"||m.TOUCH_HIGH.status!=="BOUNDARY_TOUCHING")throw new Error("touch");
if(m.POINT_TIE.status!=="POINT_TIE")throw new Error("tie");
console.log("E076 selftest PASS");