#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"weight_boundary.mjs")],{encoding:"utf8"}));
if(Math.abs(x.wStar-.5)>1e-12)throw new Error("boundary");
const m=Object.fromEntries(x.points.map(p=>[p.wEasy.toFixed(2),p.direction]));
if(m["0.49"]!=="A<B"||m["0.50"]!=="TIE"||m["0.51"]!=="A>B")throw new Error("directions");
console.log("E075 selftest PASS");