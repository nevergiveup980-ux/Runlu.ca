#!/usr/bin/env node
import fs from "node:fs";

function fail(msg){ console.error(msg); process.exit(1); }
const file=process.argv[2];
if(!file) fail("Usage: node calibrate.mjs <observations.jsonl|observations.csv>");

const text=fs.readFileSync(file,"utf8").trim();
if(!text) fail("Input is empty.");

function parseCSV(s){
  const lines=s.split(/\r?\n/).filter(Boolean);
  const head=lines.shift().split(",").map(x=>x.trim());
  return lines.map(line=>{
    const vals=line.split(",").map(x=>x.trim());
    const o={}; head.forEach((h,i)=>o[h]=vals[i] ?? "");
    if("side_a_queue" in o) o.side_a_queue=Number(o.side_a_queue);
    if("side_b_queue" in o) o.side_b_queue=Number(o.side_b_queue);
    if("opportunity" in o) o.opportunity=/^(true|1|yes)$/i.test(o.opportunity);
    return o;
  });
}
function parseInput(s,name){
  if(name.toLowerCase().endsWith(".csv")) return parseCSV(s);
  return s.split(/\r?\n/).filter(Boolean).map((line,i)=>{
    try{return JSON.parse(line);}catch(e){fail("Invalid JSONL line "+(i+1)+": "+e.message);}
  });
}
function valid(o){
  return o && Number.isInteger(o.side_a_queue) && o.side_a_queue>=0 &&
    Number.isInteger(o.side_b_queue) && o.side_b_queue>=0 &&
    typeof o.opportunity==="boolean" && typeof o.site_context==="string";
}
function regretForCuts(rows,cuts){
  let total=0;
  const bucket=q=>cuts.reduce((n,c)=>n+(q>=c),0);
  for(const o of rows){
    const a=o.side_a_queue,b=o.side_b_queue;
    if(bucket(a)===bucket(b)) total+=Math.abs(a-b)/2;
  }
  return rows.length ? total/rows.length : null;
}
function fixedRoleRegret(rows,side="A"){
  let total=0;
  for(const o of rows){
    const a=o.side_a_queue,b=o.side_b_queue;
    total += side==="A" ? Math.max(a,b)-a : Math.max(a,b)-b;
  }
  return rows.length ? total/rows.length : null;
}
function combos(maxQ,k){
  const out=[];
  function rec(start,left,acc){
    if(left===0){out.push([...acc]);return;}
    for(let c=start;c<=maxQ-(left-1);c++){
      acc.push(c); rec(c+1,left-1,acc); acc.pop();
    }
  }
  if(k===0) return [[]];
  rec(1,k,[]);
  return out;
}
function bestCuts(rows,buckets){
  if(!rows.length) return null;
  const maxQ=Math.max(...rows.flatMap(o=>[o.side_a_queue,o.side_b_queue]));
  if(maxQ===0) return {cuts:[],regret:0};
  const need=buckets-1;
  if(maxQ<need) return {cuts:Array.from({length:need},(_,i)=>i+1),regret:regretForCuts(rows,Array.from({length:need},(_,i)=>i+1))};
  let best=null;
  for(const cuts of combos(maxQ,need)){
    const r=regretForCuts(rows,cuts);
    if(!best || r<best.regret-1e-12) best={cuts,regret:r};
  }
  return best;
}
function hist(rows,key){
  const m={};
  for(const r of rows){const q=r[key];m[q]=(m[q]||0)+1;}
  return m;
}

const raw=parseInput(text,file);
const invalid=raw.filter(o=>!valid(o));
const accepted=raw.filter(o=>valid(o) && o.opportunity===true);
const contexts=[...new Set(accepted.map(o=>o.site_context))].sort();
const byContext=Object.fromEntries(contexts.map(c=>[c,accepted.filter(o=>o.site_context===c)]));

const oneBit=bestCuts(accepted,2);
const twoBit=bestCuts(accepted,4);

let contextOptima={};
for(const c of contexts) contextOptima[c]=bestCuts(byContext[c],4);

let robust=null;
if(accepted.length){
  const maxQ=Math.max(...accepted.flatMap(o=>[o.side_a_queue,o.side_b_queue]));
  const candidates=maxQ>=3 ? combos(maxQ,3) : [Array.from({length:3},(_,i)=>i+1)];
  for(const cuts of candidates){
    const per={}; let worst=-Infinity;
    for(const c of contexts){
      const rr=regretForCuts(byContext[c],cuts); per[c]=rr; worst=Math.max(worst,rr);
    }
    if(!robust || worst<robust.worst_regret-1e-12) robust={cuts,worst_regret:worst,per_context:per};
  }
}
const headroom={};
if(robust) for(const c of contexts) headroom[c]=robust.per_context[c]-contextOptima[c].regret;

const out={
  schema:"e045-output-v1",
  input:{records:raw.length,invalid:invalid.length,accepted_opportunities:accepted.length,contexts},
  histograms:{side_a:hist(accepted,"side_a_queue"),side_b:hist(accepted,"side_b_queue")},
  zero_payload:{fixed_A_regret:fixedRoleRegret(accepted,"A"),fixed_B_regret:fixedRoleRegret(accepted,"B")},
  one_bit:oneBit,
  two_bit:twoBit,
  context_optima:contextOptima,
  robust_static_two_bit:robust,
  oracle_headroom_vs_robust:headroom
};
console.log(JSON.stringify(out,null,2));
