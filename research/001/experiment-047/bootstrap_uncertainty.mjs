#!/usr/bin/env node
import fs from "node:fs";

function fail(msg){ console.error(msg); process.exit(1); }
const file=process.argv[2];
const B=Number(process.argv[3] ?? 2000);
const seed=Number(process.argv[4] ?? 47001);
if(!file) fail("Usage: node bootstrap_uncertainty.mjs <observations.jsonl|observations.csv> [replicates=2000] [seed=47001]");
if(!Number.isInteger(B) || B<100) fail("replicates must be an integer >= 100");
if(!Number.isInteger(seed)) fail("seed must be an integer");

const rawText=fs.readFileSync(file,"utf8").trim();
if(!rawText) fail("Input is empty.");

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
    typeof o.opportunity==="boolean";
}
function mulberry32(a){
  return function(){
    let t=a+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
function combos(maxQ,k){
  const out=[];
  function rec(start,left,acc){
    if(left===0){out.push([...acc]);return;}
    for(let c=start;c<=maxQ-(left-1);c++){
      acc.push(c);rec(c+1,left-1,acc);acc.pop();
    }
  }
  if(k===0) return [[]];
  rec(1,k,[]);
  return out;
}
function regretForCuts(rows,cuts){
  const bucket=q=>cuts.reduce((n,c)=>n+(q>=c),0);
  let total=0;
  for(const o of rows){
    if(bucket(o.side_a_queue)===bucket(o.side_b_queue))
      total+=Math.abs(o.side_a_queue-o.side_b_queue)/2;
  }
  return total/rows.length;
}
function bestCuts(rows,buckets){
  const maxQ=Math.max(...rows.flatMap(o=>[o.side_a_queue,o.side_b_queue]));
  const need=buckets-1;
  if(maxQ===0) return {cuts:[],regret:0};
  const candidates=maxQ>=need ? combos(maxQ,need) : [Array.from({length:need},(_,i)=>i+1)];
  let best=null;
  for(const cuts of candidates){
    const rr=regretForCuts(rows,cuts);
    if(!best || rr<best.regret-1e-12 ||
      (Math.abs(rr-best.regret)<=1e-12 && cuts.join(",")<best.cuts.join(","))){
      best={cuts,regret:rr};
    }
  }
  return best;
}
function fixedRoleRegret(rows){
  let total=0;
  for(const o of rows) total+=Math.max(o.side_a_queue,o.side_b_queue)-o.side_a_queue;
  return total/rows.length;
}
function percentile(values,p){
  const a=[...values].sort((x,y)=>x-y);
  const idx=(a.length-1)*p, lo=Math.floor(idx), hi=Math.ceil(idx);
  return lo===hi ? a[lo] : a[lo]+(a[hi]-a[lo])*(idx-lo);
}
function interval(values){
  return {p025:percentile(values,.025),median:percentile(values,.5),p975:percentile(values,.975)};
}
function frequencies(keys){
  const m={};
  for(const k of keys)m[k]=(m[k]||0)+1;
  return Object.entries(m)
    .map(([cuts,count])=>({cuts:cuts===""?[]:cuts.split(",").map(Number),count,share:count/keys.length}))
    .sort((a,b)=>b.count-a.count || a.cuts.join(",").localeCompare(b.cuts.join(",")));
}

const accepted=parseInput(rawText,file).filter(o=>valid(o)&&o.opportunity===true);
if(accepted.length<2) fail("Need at least 2 accepted opportunity observations.");

const point1=bestCuts(accepted,2);
const point2=bestCuts(accepted,4);
const rng=mulberry32(seed);

const fixed=[], oneReg=[], twoReg=[], oneKey=[], twoKey=[];
for(let b=0;b<B;b++){
  const sample=Array.from({length:accepted.length},()=>accepted[Math.floor(rng()*accepted.length)]);
  const x1=bestCuts(sample,2), x2=bestCuts(sample,4);
  fixed.push(fixedRoleRegret(sample));
  oneReg.push(x1.regret); twoReg.push(x2.regret);
  oneKey.push(x1.cuts.join(",")); twoKey.push(x2.cuts.join(","));
}
const f1=frequencies(oneKey), f2=frequencies(twoKey);

const out={
  schema:"e047-bootstrap-v1",
  input:{accepted:accepted.length,replicates:B,seed},
  point_estimate:{one_bit:point1,two_bit:point2,fixed_A_regret:fixedRoleRegret(accepted)},
  uncertainty:{
    fixed_A_regret:interval(fixed),
    optimal_one_bit_regret:interval(oneReg),
    optimal_two_bit_regret:interval(twoReg)
  },
  threshold_stability:{
    one_bit:{distinct:f1.length,dominant:f1[0],top:f1.slice(0,10)},
    two_bit:{distinct:f2.length,dominant:f2[0],top:f2.slice(0,10)}
  },
  note:"Bootstrap uncertainty reflects this observed sample and resampling design; it does not correct sampling bias or prove external validity."
};
console.log(JSON.stringify(out,null,2));
