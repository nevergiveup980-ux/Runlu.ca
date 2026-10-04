#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"interaction_failure.mjs")],{encoding:"utf8"}));
const g=p=>x.results.find(r=>r.pair===p);
if(!g("AB").SOFTWARE_ONLY||g("AB").CALIBRATION_ONLY||!g("AB").CROSS_LAYER_INTERACTION)throw new Error("AB");
if(!g("BC").CALIBRATION_ONLY||g("BC").SOFTWARE_ONLY)throw new Error("BC");
if(!g("CD").SOFTWARE_OR_LABEL)throw new Error("CD");
if(!g("EF").SOFTWARE_AND_CALIBRATION)throw new Error("EF");
console.log("E098 selftest PASS");