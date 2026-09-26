#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"evidence_graph.mjs")],{encoding:"utf8"}));
const edge=(a,b)=>x.edges.find(e=>e.a===a&&e.b===b);
if(edge("A","B").relation!=="REANALYSIS")throw new Error("A-B");
if(edge("A","C").relation!=="PARTIAL_REPLICATION")throw new Error("A-C");
if(edge("D","E").relation!=="INDEPENDENT_REPLICATION_CANDIDATE")throw new Error("D-E");
console.log("E084 selftest PASS");