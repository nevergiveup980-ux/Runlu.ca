#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"model_family_redundancy.mjs")],{encoding:"utf8"}));
if(x.raw.count!==10)throw new Error("raw");
if(x.rootLevel.count!==5)throw new Error("roots");
if(x.raw.dependent!==7||x.raw.separate!==3)throw new Error("raw verdicts");
if(x.rootLevel.dependent_roots.length!==3||x.rootLevel.separate_roots.length!==2)throw new Error("root verdicts");
if(x.clusters.some(c=>c.status!=="ROOT_VERDICT_CONSISTENT"))throw new Error("unexpected mixed root");
console.log("E100 selftest PASS");