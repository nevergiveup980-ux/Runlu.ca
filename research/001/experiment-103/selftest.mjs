#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(d,"depth_selection_provenance.mjs")],{encoding:"utf8"}));
const g=id=>x.results.find(r=>r.id===id);
if(g("D_ARCH").selection_status!=="MECHANISM_JUSTIFIED_BOUNDARY")throw new Error("arch");
if(g("D_CAUSAL").selection_status!=="MECHANISM_JUSTIFIED_BOUNDARY")throw new Error("causal");
if(g("D_CONVENTION").selection_status!=="CONVENTION_JUSTIFIED_BOUNDARY")throw new Error("convention");
if(g("D_AVAILABILITY").selection_status!=="AVAILABILITY_LIMITED_BOUNDARY")throw new Error("availability");
if(g("D_POSTHOC").selection_status!=="POST_HOC_DEPTH_SELECTION")throw new Error("posthoc");
if(g("D_UNKNOWN").selection_status!=="DEPTH_SELECTION_UNRESOLVED")throw new Error("unknown");
console.log("E103 selftest PASS");