#!/usr/bin/env node
import fs from "node:fs";

function fail(msg){ console.error(msg); process.exit(1); }
const file=process.argv[2];
const cap=Number(process.argv[3] ?? 4);
const highThreshold=Number(process.argv[4] ?? 8);
const highMultiplier=Number(process.argv[5] ?? 2);
if(!file) fail("Usage: node loss_sensitivity.mjs <observations.jsonl|observations.csv> [cap=4] [high_threshold=8] [high_multiplier=2]");
if(!Number.isFinite(cap)||cap<=0) fail("cap must be > 0");
if(!Number.isFinite(highThreshold)||highThreshold<0) fail("high_threshold must be >= 0");
if(!Number.isFinite(highMultiplier)||highMultiplier<1) fail("high_multiplier must be >= 1");

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
  rec(1,k,[]);
  return out;
}
const accepted=parseInput(rawText,file).filter(o=>valid(o)&&o.opportunity===true);
if(accepted.length<2) fail("Need at least 2 accepted opportunity observations.");
const maxQ=Math.max(...accepted.flatMap(o=>[o.side_a_queue,o.side_b_queue]));

const losses={
  LINEAR_GAP:(hi,lo)=>hi-lo,
  CAPPED_GAP:(hi,lo)=>Math.min(hi-lo,cap),
  HIGH_QUEUE_WEIGHTED:(hi,lo)=>(hi-lo)*(hi>=highThreshold?highMultiplier:1)
};

function regret(rows,cuts,loss){
  const bucket=q=>cuts.reduce((n,c)=>n+(q>=c),0);
  let total=0;
  for(const o of rows){
    const a=o.side_a_queue,b=o.side_b_queue;
    if(bucket(a)===bucket(b)){
      const hi=Math.max(a,b),lo=Math.min(a,b);
      total+=loss(hi,lo)/2;
    }
  }
  return total/rows.length;
}
function best(rows,buckets,loss){
  const need=buckets-1;
  const candidates=maxQ>=need ? combos(maxQ,need) : [Array.from({length:need},(_,i)=>i+1)];
  const ranked=candidates.map(cuts=>({cuts,regret:regret(rows,cuts,loss)}))
    .sort((a,b)=>a.regret-b.regret || a.cuts.join(",").localeCompare(b.cuts.join(",")));
  return {best:ranked[0],top:ranked.slice(0,10)};
}

const results={};
for(const [name,loss] of Object.entries(losses)){
  results[name]={one_bit:best(accepted,2,loss),two_bit:best(accepted,4,loss)};
}

function sig(x){return JSON.stringify(x);}
const oneDistinct=new Set(Object.values(results).map(x=>sig(x.one_bit.best.cuts)));
const twoDistinct=new Set(Object.values(results).map(x=>sig(x.two_bit.best.cuts)));

const out={
  schema:"e049-loss-sensitivity-v1",
  input:{accepted:accepted.length,cap,high_threshold:highThreshold,high_multiplier:highMultiplier},
  identifiable_losses:results,
  preferred_codebook_variation:{
    one_bit_distinct_optima:oneDistinct.size,
    two_bit_distinct_optima:twoDistinct.size,
    objective_sensitive:oneDistinct.size>1 || twoDistinct.size>1
  },
  not_identifiable_from_e044_v1:{
    TRUE_DELAY_WEIGHTED:"requires waiting-time/age telemetry",
    TRUE_STARVATION:"requires temporal service history or waiting-age state"
  },
  note:"HIGH_QUEUE_WEIGHTED is a queue-level proxy only; it is not a measured starvation or delay objective."
};
console.log(JSON.stringify(out,null,2));
