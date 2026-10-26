#!/usr/bin/env node
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),temp=fs.mkdtempSync(path.join(os.tmpdir(),"runlu-knowledge-"));
try{
 const input=path.join(temp,"in.json"),output=path.join(temp,"out.json");
 const sample=JSON.parse(fs.readFileSync(path.join(root,"data/records.json"),"utf8"))[0];
 sample.id="RK-0000";sample.status="inbox";
 fs.writeFileSync(input,JSON.stringify(sample));
 const result=cp.spawnSync(process.execPath,[path.join(__dirname,"allocate.cjs"),input,output],{encoding:"utf8"});
 if(result.status!==0)throw Error(result.stderr);
 const assigned=JSON.parse(fs.readFileSync(output,"utf8"));
 if(assigned.id!=="RK-0002"||assigned.status!=="draft")throw Error("Unexpected allocated ID/status "+assigned.id);
 const again=cp.spawnSync(process.execPath,[path.join(__dirname,"allocate.cjs"),input,output],{encoding:"utf8"});
 if(again.status===0)throw Error("Overwrite was not blocked");
 console.log("Allocator smoke tests passed.");
}finally{fs.rmSync(temp,{recursive:true,force:true})}
