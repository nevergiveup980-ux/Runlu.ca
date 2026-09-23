#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
function run(name,...args){
  return JSON.parse(execFileSync(process.execPath,[path.join(dir,"loss_sensitivity.mjs"),path.join(dir,name),...args],{encoding:"utf8"}));
}
const stable=run("sample.regular.jsonl","4","8","2");
if(stable.preferred_codebook_variation.objective_sensitive!==false) throw new Error("regular synthetic sample should be stable under tested proxy losses");
if(JSON.stringify(stable.identifiable_losses.LINEAR_GAP.two_bit.best.cuts)!=="[3,6,12]") throw new Error("unexpected regular optimum");

const sensitive=run("sample.objective-sensitive.jsonl","2","10","3");
if(sensitive.preferred_codebook_variation.objective_sensitive!==true) throw new Error("sensitive sample should change optimum across objectives");
const lin=sensitive.identifiable_losses.LINEAR_GAP.one_bit.best.cuts[0];
const cap=sensitive.identifiable_losses.CAPPED_GAP.one_bit.best.cuts[0];
if(lin===cap) throw new Error("linear and capped objectives should select different 1-bit cuts");
if(!sensitive.not_identifiable_from_e044_v1.TRUE_DELAY_WEIGHTED) throw new Error("delay identifiability guard missing");
console.log("E049 selftest PASS");
