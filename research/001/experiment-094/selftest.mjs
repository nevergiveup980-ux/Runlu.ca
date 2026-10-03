#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"shared_bias.mjs")],{encoding:"utf8"}));
const m=Object.fromEntries(x.results.map(r=>[r.id,r]));
if(m.SHARED_OFFSET.provenance!=="SHARED_CALIBRATION_ROOT"||m.SHARED_OFFSET.agreementSd!==0||m.SHARED_OFFSET.bias!==-1)throw new Error("shared");
if(m.MIXED_BIAS.provenance!=="MIXED_DEPENDENCE")throw new Error("mixed");
if(m.INDEPENDENT_NOISE.provenance!=="SEPARATE_ROOTS")throw new Error("independent");
if(m.SEPARATE_BUT_WRONG.evidence!=="NO_DECLARED_SHARED_ROOT")throw new Error("separate wrong");
console.log("E094 selftest PASS");