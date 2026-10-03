#!/usr/bin/env node
import fs from "node:fs";

function fail(msg){ console.error(msg); process.exit(1); }
const file=process.argv[2];
if(!file) fail("Usage: node sampling_audit.mjs <observations.jsonl|observations.csv>");

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
function finiteDate(v){ const t=Date.parse(v); return Number.isFinite(t) ? t : null; }

const rows=parseInput(rawText,file);
const total=rows.length;

const duplicateIds=[];
const seen=new Set();
for(const r of rows){
  if(r.event_id && seen.has(r.event_id)) duplicateIds.push(r.event_id);
  if(r.event_id) seen.add(r.event_id);
}

const invalidTime=rows.filter(r=>finiteDate(r.observed_at)===null).length;
const missingContext=rows.filter(r=>!r.site_context).length;
const missingSource=rows.filter(r=>!r.source_mode).length;
const missingQuality=rows.filter(r=>!r.quality).length;

const byContext={};
const bySource={};
const byQuality={};
let opportunityTrue=0, opportunityFalse=0, opportunityMissing=0;

for(const r of rows){
  byContext[r.site_context ?? "MISSING"]=(byContext[r.site_context ?? "MISSING"]||0)+1;
  bySource[r.source_mode ?? "MISSING"]=(bySource[r.source_mode ?? "MISSING"]||0)+1;
  byQuality[r.quality ?? "MISSING"]=(byQuality[r.quality ?? "MISSING"]||0)+1;
  if(r.opportunity===true) opportunityTrue++;
  else if(r.opportunity===false) opportunityFalse++;
  else opportunityMissing++;
}

const timed=rows.map(r=>({r,t:finiteDate(r.observed_at)})).filter(x=>x.t!==null).sort((a,b)=>a.t-b.t);
const gaps=[];
for(let i=1;i<timed.length;i++){
  const minutes=(timed[i].t-timed[i-1].t)/60000;
  gaps.push(minutes);
}
const sortedGaps=[...gaps].sort((a,b)=>a-b);
const quantile=(arr,p)=>{
  if(!arr.length) return null;
  const idx=(arr.length-1)*p, lo=Math.floor(idx), hi=Math.ceil(idx);
  return lo===hi ? arr[lo] : arr[lo]+(arr[hi]-arr[lo])*(idx-lo);
};

const hourBuckets={};
for(const x of timed){
  const h=new Date(x.t).getUTCHours().toString().padStart(2,"0");
  hourBuckets[h]=(hourBuckets[h]||0)+1;
}

const queuePairs=rows.filter(r=>Number.isInteger(r.side_a_queue)&&r.side_a_queue>=0&&Number.isInteger(r.side_b_queue)&&r.side_b_queue>=0);
const extreme=queuePairs.filter(r=>Math.max(r.side_a_queue,r.side_b_queue)>=10).length;
const quiet=queuePairs.filter(r=>Math.max(r.side_a_queue,r.side_b_queue)<=2).length;

const flags=[];
if(duplicateIds.length) flags.push("DUPLICATE_EVENT_IDS");
if(invalidTime>0) flags.push("INVALID_TIMESTAMPS");
if(missingContext>0) flags.push("MISSING_CONTEXT");
if(missingSource>0) flags.push("MISSING_SOURCE_MODE");
if(opportunityMissing>0) flags.push("MISSING_OPPORTUNITY_LABEL");
if(total>0 && opportunityFalse===0) flags.push("NO_NON_OPPORTUNITY_OBSERVATIONS");
if(Object.keys(byContext).filter(k=>k!=="MISSING").length<2) flags.push("SINGLE_CONTEXT_ONLY");
if(Object.keys(bySource).filter(k=>k!=="MISSING").length<1) flags.push("NO_VALID_SOURCE_MODE");
if(queuePairs.length>0 && quiet===0) flags.push("NO_QUIET_QUEUE_OBSERVATIONS");
if(queuePairs.length>0 && extreme/queuePairs.length>0.75) flags.push("EXTREME_QUEUE_DOMINATED_SAMPLE");

const result={
  schema:"e046-audit-v1",
  counts:{
    total,
    duplicate_event_ids:duplicateIds.length,
    invalid_timestamps:invalidTime,
    missing_context:missingContext,
    missing_source_mode:missingSource,
    missing_quality:missingQuality,
    opportunity_true:opportunityTrue,
    opportunity_false:opportunityFalse,
    opportunity_missing:opportunityMissing
  },
  coverage:{
    by_context:byContext,
    by_source_mode:bySource,
    by_quality:byQuality,
    utc_hour_buckets:hourBuckets,
    first_observed_at:timed.length?new Date(timed[0].t).toISOString():null,
    last_observed_at:timed.length?new Date(timed[timed.length-1].t).toISOString():null
  },
  cadence_minutes:{
    count:gaps.length,
    median:quantile(sortedGaps,.5),
    p90:quantile(sortedGaps,.9),
    max:sortedGaps.length?sortedGaps[sortedGaps.length-1]:null
  },
  queue_mix:{
    valid_pairs:queuePairs.length,
    quiet_max_le_2:quiet,
    extreme_max_ge_10:extreme
  },
  flags,
  interpretation: flags.length
    ? "Calibration outputs require caution until flagged sampling/integrity issues are reviewed."
    : "No built-in structural warning fired. This is not proof of representativeness."
};
console.log(JSON.stringify(result,null,2));
