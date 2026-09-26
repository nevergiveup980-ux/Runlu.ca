#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
function run(name){
  return JSON.parse(execFileSync(process.execPath,[path.join(dir,"sampling_audit.mjs"),path.join(dir,name)],{encoding:"utf8"}));
}
const bad=run("sample.biased.jsonl");
if(!bad.flags.includes("NO_NON_OPPORTUNITY_OBSERVATIONS")) throw new Error("biased sample should flag opportunity-only sampling");
if(!bad.flags.includes("SINGLE_CONTEXT_ONLY")) throw new Error("biased sample should flag single context");
if(!bad.flags.includes("NO_QUIET_QUEUE_OBSERVATIONS")) throw new Error("biased sample should flag missing quiet observations");
const good=run("sample.coverage.jsonl");
if(good.counts.total!==6) throw new Error("expected 6 coverage rows");
if(good.coverage.by_context.NORMAL!==2 || good.coverage.by_context.BUSY!==2 || good.coverage.by_context.SURGE!==2) throw new Error("context coverage mismatch");
console.log("E046 selftest PASS");
