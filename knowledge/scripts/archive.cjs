#!/usr/bin/env node
// Offline immutable snapshot writer. Requires explicit reason and reviewer.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const [,,input,reason,reviewer]=process.argv;
if(!input||!reason?.trim()||!reviewer?.trim()){console.error("Usage: node knowledge/scripts/archive.cjs record.json 'revision reason' 'reviewer'");process.exit(2)}
const r=JSON.parse(fs.readFileSync(input,"utf8"));
if(!/^RK-\d{4,}$/.test(r.id||"")||!Number.isInteger(r.version)||r.version<1)throw Error("Invalid record ID/version");
if(!["approved","published","retired"].includes(r.status))throw Error("Only reviewed lifecycle records may be archived");
if(!r.review?.facts_verified||!r.review?.license_verified||!r.review?.translations_verified||!r.review?.reviewer||!r.review?.reviewed_at)throw Error("Review evidence missing");
const folder=path.join(root,"history",r.id),name="v"+String(r.version).padStart(4,"0")+".json";
fs.mkdirSync(folder,{recursive:true});
const file=path.join(folder,name);
const previous=fs.readdirSync(folder).filter(x=>/^v\d+\.json$/.test(x)).map(x=>Number(x.slice(1,-5)));
const log=path.join(folder,"manifest.jsonl");
const snapshots=fs.readdirSync(folder).filter(x=>/^v\d+\.json$/.test(x));
const events=fs.existsSync(log)?fs.readFileSync(log,"utf8").trim().split("\n").filter(Boolean).map(line=>JSON.parse(line)):[];
if(snapshots.length!==events.length)throw Error("Archive/manifest mismatch: manual recovery required");
const listed=new Set();
for(const event of events){
 if(event.id!==r.id||!Number.isInteger(event.version)||event.version<1||event.filename!=="v"+String(event.version).padStart(4,"0")+".json")throw Error("Invalid archive manifest event");
 if(listed.has(event.filename))throw Error("Duplicate archive manifest entry");
 listed.add(event.filename);
 const snapshot=path.join(folder,event.filename);
 if(!/^v\d+\.json$/.test(event.filename||"")||!fs.existsSync(snapshot))throw Error("Manifest snapshot missing");
 const digest=crypto.createHash("sha256").update(fs.readFileSync(snapshot)).digest("hex");
 if(digest!==event.sha256)throw Error("Archive hash mismatch: manual recovery required");
}
if(snapshots.some(name=>!listed.has(name)))throw Error("Unlisted archive snapshot: manual recovery required");
if(fs.existsSync(file))throw Error("Snapshot already exists; refusing overwrite");
if(previous.length&&r.version!==Math.max(...previous)+1)throw Error("Version must increment by exactly one");
if(!previous.length&&r.version!==1)throw Error("First archived version must be 1");
const content=JSON.stringify(r,null,2)+"\n";
const hash=crypto.createHash("sha256").update(content).digest("hex");
const event={id:r.id,version:r.version,filename:name,sha256:hash,archived_at:new Date().toISOString(),reason:reason.trim(),reviewer:reviewer.trim()};
fs.writeFileSync(file,content,{flag:"wx"});
fs.appendFileSync(log,JSON.stringify(event)+"\n");
console.log("Archived "+r.id+" v"+r.version+" sha256="+hash);
