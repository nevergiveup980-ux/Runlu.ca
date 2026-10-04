#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const raw=execFileSync(process.execPath,[path.join(dir,"counterexamples.mjs")],{encoding:"utf8"});
const x=JSON.parse(raw);
if(x.current_snapshot.one_step_wait_choice!=="TIE") throw new Error("snapshot objective should tie");
if(x.histories.H1.next_choice!=="B") throw new Error("H1 should restore toward B");
if(x.histories.H2.next_choice!=="A") throw new Error("H2 should restore toward A");
if(x.histories.H1.fairness_balance!==8 || x.histories.H2.fairness_balance!==-8) throw new Error("bad fairness balances");
console.log("E051 selftest PASS");
