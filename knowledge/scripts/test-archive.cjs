#!/usr/bin/env node
// Test only the versioning rules with an isolated temporary fixture.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const source=fs.readFileSync(path.join(__dirname,"archive.cjs"),"utf8");
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"rk-archive-"));
try{
 fs.mkdirSync(path.join(temp,"scripts"));fs.writeFileSync(path.join(temp,"scripts","archive.cjs"),source);
 const record={id:"RK-9999",version:1,status:"approved",review:{facts_verified:true,license_verified:true,translations_verified:true,reviewer:"Tester",reviewed_at:"2026-10-26"}};
 const input=path.join(temp,"record.json");fs.writeFileSync(input,JSON.stringify(record));
 const run=()=>cp.spawnSync(process.execPath,[path.join(temp,"scripts","archive.cjs"),input,"Initial review","Tester"],{encoding:"utf8"});
 if(run().status!==0)throw Error("First archive failed");
 if(run().status===0)throw Error("Overwrite unexpectedly allowed");
 record.version=3;fs.writeFileSync(input,JSON.stringify(record));
 if(run().status===0)throw Error("Version skip unexpectedly allowed");
 record.version=2;fs.writeFileSync(input,JSON.stringify(record));
 if(run().status!==0)throw Error("Second version failed");
 const manifest=fs.readFileSync(path.join(temp,"history","RK-9999","manifest.jsonl"),"utf8").trim().split("\n");
 if(manifest.length!==2)throw Error("Incorrect manifest count");
 // Simulate an interrupted write: snapshot exists without a matching manifest event.
 record.version=3;fs.writeFileSync(input,JSON.stringify(record));
 const orphan=path.join(temp,"history","RK-9999","v0003.json");
 fs.writeFileSync(orphan,JSON.stringify(record));
 record.version=4;fs.writeFileSync(input,JSON.stringify(record));
 const orphanResult=run();
 if(orphanResult.status===0||!orphanResult.stderr.includes("Archive/manifest mismatch"))throw Error("Orphaned snapshot was not specifically detected: "+orphanResult.stderr);
 fs.unlinkSync(orphan);
 // Simulate corruption of a previously archived snapshot.
 const archived=path.join(temp,"history","RK-9999","v0002.json");
 fs.appendFileSync(archived,"tampered");
 record.version=3;fs.writeFileSync(input,JSON.stringify(record));
 const tamperedResult=run();
 if(tamperedResult.status===0||!tamperedResult.stderr.includes("Archive hash mismatch"))throw Error("Tampered archive was not specifically detected: "+tamperedResult.stderr);
 // Duplicate manifest events must be rejected even when counts match.
 const folder=path.join(temp,"history","RK-9999");
 const lines=fs.readFileSync(path.join(folder,"manifest.jsonl"),"utf8").trim().split("\n");
 fs.writeFileSync(path.join(folder,"manifest.jsonl"),lines[0]+"\n"+lines[0]+"\n");
 const duplicateResult=run();
 if(duplicateResult.status===0||!duplicateResult.stderr.includes("Duplicate archive manifest entry"))throw Error("Duplicate manifest was not specifically rejected: "+duplicateResult.stderr);
 console.log("Archive smoke tests passed.");
}finally{fs.rmSync(temp,{recursive:true,force:true})}
