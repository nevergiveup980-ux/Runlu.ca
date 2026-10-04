#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const raw=execFileSync(process.execPath,[path.join(dir,"calibrate.mjs"),path.join(dir,"sample.synthetic.jsonl")],{encoding:"utf8"});
const x=JSON.parse(raw);
if(x.input.records!==6) throw new Error("expected 6 records");
if(x.input.accepted_opportunities!==6) throw new Error("expected 6 accepted observations");
if(!x.one_bit || !x.two_bit || !x.robust_static_two_bit) throw new Error("missing calibration outputs");
console.log("E045 selftest PASS");
