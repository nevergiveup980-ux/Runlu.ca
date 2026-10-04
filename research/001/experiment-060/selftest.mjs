#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"dependency_graph.mjs")],{encoding:"utf8"}));
if(Math.abs(x.action_support.A.effective_diversity-1)>1e-12) throw new Error("A Neff mismatch");
if(!(x.action_support.B.effective_diversity>1 && x.action_support.B.effective_diversity<=2)) throw new Error("B Neff range mismatch");
if(x.similarity_matrix.length!==5) throw new Error("matrix dimension mismatch");
console.log("E060 selftest PASS");