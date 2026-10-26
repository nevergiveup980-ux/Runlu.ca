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
 console.log("Archive smoke tests passed.");
}finally{fs.rmSync(temp,{recursive:true,force:true})}
