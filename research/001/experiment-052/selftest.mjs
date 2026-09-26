#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"counterexamples.mjs")],{encoding:"utf8"}));
if(x.raw_balance_counterexample.H1.under_served!=="A") throw new Error("H1 demand-normalized direction wrong");
if(x.raw_balance_counterexample.H2.under_served!=="B") throw new Error("H2 demand-normalized direction wrong");
if(x.opportunity_counterexample.O1.under_served!=="A") throw new Error("O1 opportunity direction wrong");
if(x.opportunity_counterexample.O2.under_served!=="B") throw new Error("O2 opportunity direction wrong");
if(x.eligibility_counterexample.by_raw_arrivals.under_served!=="A") throw new Error("raw-arrival example wrong");
if(x.eligibility_counterexample.by_eligible_demand.under_served!=="B") throw new Error("eligible-demand reversal missing");
console.log("E052 selftest PASS");
