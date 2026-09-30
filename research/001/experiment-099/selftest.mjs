#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"model_multiplicity.mjs")],{encoding:"utf8"}));
if(x.aggregate!=="MODEL_SENSITIVE")throw new Error("aggregate");
if(x.selection_demonstration.select_only_dependent_models!=="STABLE_DEPENDENT")throw new Error("dep subset");
if(x.selection_demonstration.select_only_separate_models!=="STABLE_SEPARATE")throw new Error("sep subset");
if(x.admitted_model_ids.includes("M5"))throw new Error("M5");
if(x.admitted_model_ids.length!==4)throw new Error("admitted count");
console.log("E099 selftest PASS");