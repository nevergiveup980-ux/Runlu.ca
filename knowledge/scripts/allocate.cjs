#!/usr/bin/env node
// Offline intake allocator: does not publish or overwrite any record.
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const input=process.argv[2],output=process.argv[3];
if(!input||!output){console.error("Usage: node knowledge/scripts/allocate.cjs intake.json output.json");process.exit(2)}
function read(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
const drafts=read(path.join(root,"data/records.json"));
const published=read(path.join(root,"data/published.json")).entries;
const intake=read(input);
if(!intake||intake.status!=="inbox"||intake.id!=="RK-0000"){throw Error("Expected unassigned inbox draft RK-0000")}
if(!Array.isArray(intake.sources)||!intake.sources.length||!intake.titles?.en||!intake.summaries?.en)throw Error("Missing intake fields");
const used=new Set([...drafts,...published].map(r=>r.id));
const history=path.join(root,"history");
if(fs.existsSync(history))for(const d of fs.readdirSync(history))if(/^RK-\d+$/.test(d))used.add(d);
const numbers=[...used].map(id=>/^RK-(\d+)$/.exec(id)).filter(Boolean).map(m=>Number(m[1]));
const next=Math.max(0,...numbers)+1;
const id="RK-"+String(next).padStart(4,"0");
const target=path.resolve(output);
if(fs.existsSync(target))throw Error("Refusing to overwrite output");
const assigned={...intake,id,status:"draft",version:1,review:{facts_verified:false,license_verified:false,translations_verified:false}};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(assigned,null,2)+"\n",{flag:"wx"});
console.log("Allocated "+id+" -> "+target+" (NOT published).");
