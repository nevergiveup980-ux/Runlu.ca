#!/usr/bin/env node
import fs from "node:fs";

function fail(msg){ console.error(msg); process.exit(1); }
const file=process.argv[2];
const epsilon=Number(process.argv[3] ?? 0);
if(!file) fail("Usage: node near_optimal.mjs <observations.jsonl|observations.csv> [absolute_epsilon=0]");
if(!Number.isFinite(epsilon) || epsilon<0) fail("epsilon must be a finite number >= 0");

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
function regretForCuts(rows,cuts){
  const bucket=q=>cuts.reduce((n,c)=>n+(q>=c),0);
  let total=0;
  for(const o of rows){
    if(bucket(o.side_a_queue)===bucket(o.side_b_queue))
      total+=Math.abs(o.side_a_queue-o.side_b_queue)/2;
  }
  return total/rows.length;
}
function enumerate(rows,buckets){
  const maxQ=Math.max(...rows.flatMap(o=>[o.side_a_queue,o.side_b_queue]));
  const need=buckets-1;
  const candidates=maxQ>=need ? combos(maxQ,need) : [Array.from({length:need},(_,i)=>i+1)];
  const ranked=candidates.map(cuts=>({cuts,regret:regretForCuts(rows,cuts)}))
    .sort((a,b)=>a.regret-b.regret || a.cuts.join(",").localeCompare(b.cuts.join(",")));
  const best=ranked[0].regret;
  for(const x of ranked) x.gap=x.regret-best;
  const equivalent=ranked.filter(x=>x.gap<=epsilon+1e-12);
  const outside=ranked.find(x=>x.gap>epsilon+1e-12) ?? null;
  const span=[];
  for(let i=0;i<need;i++){
    const vals=equivalent.map(x=>x.cuts[i]).filter(Number.isFinite);
    span.push(vals.length?{min:Math.min(...vals),max:Math.max(...vals)}:null);
  }
  return {
    best:ranked[0],
    epsilon,
    equivalent_count:equivalent.length,
    equivalent,
    threshold_span:span,
    first_outside_tolerance:outside,
    ranked
  };
}

const accepted=parseInput(rawText,file).filter(o=>valid(o)&&o.opportunity===true);
if(accepted.length<2) fail("Need at least 2 accepted opportunity observations.");

const out={
  schema:"e048-near-optimal-v1",
  input:{accepted:accepted.length,epsilon},
  one_bit:enumerate(accepted,2),
  two_bit:enumerate(accepted,4),
  note:"Equivalence is relative to the declared absolute regret tolerance; choose epsilon from an operational decision budget, not convenience."
};
console.log(JSON.stringify(out,null,2));
