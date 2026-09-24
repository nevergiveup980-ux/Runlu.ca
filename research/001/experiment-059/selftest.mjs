#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"family_dependence.mjs")],{encoding:"utf8"}));
if(x.raw_model_count.winner!=="A") throw new Error("raw count should favor A");
if(x.family_count.winner!=="B") throw new Error("family count should favor B");
if(x.assumption_families.length!==3) throw new Error("expected three families");
console.log("E059 selftest PASS");