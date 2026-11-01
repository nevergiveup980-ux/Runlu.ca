#!/usr/bin/env node
// RUNLU Knowledge publication gate. Node 20+, no external dependencies.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const draft=JSON.parse(fs.readFileSync(path.join(root,"data/records.json"),"utf8"));
const published=JSON.parse(fs.readFileSync(path.join(root,"data/published.json"),"utf8"));
const errors=[];
const fail=(where,msg)=>errors.push(where+": "+msg);
const langs=["en","zh","fr","es"];
const statuses=new Set(["inbox","draft","verification","approved","published","retired"]);
const licenseStatuses=new Set(["unknown","permitted","restricted","prohibited"]);
const iso=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T00:00:00Z"));
const validUrl=s=>{try{const u=new URL(s);return u.protocol==="https:"||u.protocol==="http:"}catch{return false}};
function check(record,where,isPublic){
 if(!record||typeof record!=="object"){fail(where,"record must be object");return}
 if(!/^RK-\d{4,}$/.test(record.id||""))fail(where,"invalid id");
 if(!statuses.has(record.status))fail(where,"invalid status");
 if(!record.category||typeof record.category!=="string")fail(where,"missing category");
 if(!record.scope||!["global","regional","country","subnational"].includes(record.scope.type)||!Array.isArray(record.scope.codes))fail(where,"invalid scope");
 else if(record.scope.type!=="global"&&record.scope.codes.length===0)fail(where,"region codes required");
 for(const field of ["titles","summaries"]){
  if(!record[field]||typeof record[field].en!=="string"||!record[field].en.trim())fail(where,"missing English "+field);
  if(isPublic)for(const l of langs)if(!record[field]||typeof record[field][l]!=="string"||!record[field][l].trim())fail(where,"missing "+l+" "+field);
 }
 if(!iso(record.created_at)||!iso(record.updated_at))fail(where,"invalid dates");
 if(!Number.isInteger(record.version)||record.version<1)fail(where,"invalid version");
 if(!Array.isArray(record.sources)||record.sources.length===0)fail(where,"missing sources");
 else record.sources.forEach((s,i)=>{
  if(!validUrl(s.url))fail(where,"source "+i+" URL invalid");
  if(!s.publisher||typeof s.publisher!=="string")fail(where,"source "+i+" publisher missing");
  if(!iso(s.checked_at))fail(where,"source "+i+" checked_at invalid");
  if(!licenseStatuses.has(s.license_status))fail(where,"source "+i+" license status invalid");
  if(isPublic&&s.license_status!=="permitted")fail(where,"source "+i+" not cleared for publication");
 });
 if(isPublic){
  if(record.status!=="published")fail(where,"public entry must be published");
  for(const key of ["facts_verified","license_verified","translations_verified"])if(record.review?.[key]!==true)fail(where,key+" not verified");
  if(!record.review?.reviewer||!iso(record.review?.reviewed_at))fail(where,"reviewer and review date required");
 }
}
if(!Array.isArray(draft))fail("records.json","expected array");
else {
 const draftIds=new Set();
 draft.forEach((r,i)=>{
  check(r,"draft["+i+"]",false);
  if(draftIds.has(r.id))fail("draft["+i+"]","duplicate draft id "+r.id);
  draftIds.add(r.id);
 });
}
if(!published||!Array.isArray(published.entries))fail("published.json","expected entries array");
else {
 const ids=new Set();
 published.entries.forEach((r,i)=>{
  check(r,"published["+i+"]",true);
  if(ids.has(r.id))fail("published["+i+"]","duplicate id "+r.id);
  ids.add(r.id);
 });
 if(Array.isArray(draft))draft.forEach((r,i)=>{if(ids.has(r.id))fail("draft["+i+"]","id conflicts with published record")});
}
if(errors.length){console.error("RUNLU Knowledge validation failed:\n"+errors.map(e=>" - "+e).join("\n"));process.exitCode=1}
else console.log("RUNLU Knowledge validation passed. Drafts:",draft.length,"Published:",published.entries.length);
