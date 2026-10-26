#!/usr/bin/env node
// Guard public exports against duplicate IDs, draft leakage, and missing review evidence.
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const drafts=JSON.parse(fs.readFileSync(path.join(root,"data/records.json"),"utf8"));
const data=JSON.parse(fs.readFileSync(path.join(root,"data/published.json"),"utf8"));
if(!Array.isArray(data.entries)||!Array.isArray(drafts))throw Error("Invalid dataset");
const draftIds=new Set(drafts.map(r=>r.id));
const seen=new Set();
for(const r of data.entries){
 if(seen.has(r.id))throw Error("Duplicate public ID: "+r.id);
 if(draftIds.has(r.id))throw Error("Draft/public ID collision: "+r.id);
 seen.add(r.id);
 if(r.status!=="published")throw Error("Non-published record in public dataset: "+r.id);
 if(!r.review?.facts_verified||!r.review?.license_verified||!r.review?.translations_verified)throw Error("Unverified record: "+r.id);
 if(!r.review?.reviewer||!r.review?.reviewed_at)throw Error("Missing reviewer evidence: "+r.id);
 if(!r.sources?.length||r.sources.some(s=>s.license_status!=="permitted"))throw Error("Source rights not cleared: "+r.id);
 for(const lang of ["en","zh","fr","es"])if(!r.titles?.[lang]||!r.summaries?.[lang])throw Error("Missing language "+lang+": "+r.id);
}
console.log("Publication gate passed. Public entries:",data.entries.length);
