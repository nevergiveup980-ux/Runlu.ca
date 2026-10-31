#!/usr/bin/env node
// Run allocator checks in an isolated copy of the knowledge workspace.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),temp=fs.mkdtempSync(path.join(os.tmpdir(),"runlu-knowledge-"));
try{
 fs.mkdirSync(path.join(temp,"scripts"));fs.mkdirSync(path.join(temp,"data"));
 fs.copyFileSync(path.join(root,"scripts","allocate.cjs"),path.join(temp,"scripts","allocate.cjs"));
 for(const name of ["records.json","published.json"])fs.copyFileSync(path.join(root,"data",name),path.join(temp,"data",name));
 const input=path.join(temp,"in.json"),output=path.join(temp,"out.json");
 const records=JSON.parse(fs.readFileSync(path.join(temp,"data","records.json"),"utf8"));
 const published=JSON.parse(fs.readFileSync(path.join(temp,"data","published.json"),"utf8")).entries;
 const sample={...records[0],id:"RK-0000",status:"inbox"};
 fs.writeFileSync(input,JSON.stringify(sample));
 const run=(dest)=>cp.spawnSync(process.execPath,[path.join(temp,"scripts","allocate.cjs"),input,dest],{encoding:"utf8"});
 const result=run(output);
 if(result.status!==0)throw Error(result.stderr);
 const assigned=JSON.parse(fs.readFileSync(output,"utf8"));
 const ids=[...records,...published].map(r=>Number(/^RK-(\d+)$/.exec(r.id)?.[1]||0));
 const expected="RK-"+String(Math.max(0,...ids)+1).padStart(4,"0");
 if(assigned.id!==expected||assigned.status!=="draft")throw Error("Unexpected allocated ID/status "+assigned.id);
 if(run(output).status===0)throw Error("Overwrite was not blocked");
 const invalid={...sample,id:"RK-0099"};fs.writeFileSync(input,JSON.stringify(invalid));
 if(run(path.join(temp,"bad.json")).status===0)throw Error("Assigned intake was accepted");
 console.log("Allocator smoke tests passed.");
}finally{fs.rmSync(temp,{recursive:true,force:true})}
