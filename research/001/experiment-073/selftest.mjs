#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"aggregation_reversal.mjs")],{encoding:"utf8"}));
if(!x.reversal)throw new Error("reversal missing");
if(!x.subgroup.every(r=>r.direction==="A>B"))throw new Error("subgroup direction");
if(x.pooled.direction!=="A<B")throw new Error("pooled direction");
console.log("E073 selftest PASS");