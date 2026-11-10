#!/usr/bin/env node
// End-to-end offline smoke test in an isolated temporary workspace.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const source=path.resolve(__dirname,".."),tmp=fs.mkdtempSync(path.join(os.tmpdir(),"runlu-e2e-"));
const run=(file,args=[])=>cp.spawnSync(process.execPath,[path.join(tmp,"scripts",file),...args],{encoding:"utf8"});
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
try{
 fs.mkdirSync(path.join(tmp,"scripts"),{recursive:true});fs.mkdirSync(path.join(tmp,"data"),{recursive:true});
 for(const name of ["allocate.cjs","archive.cjs","validate.cjs","check-publication.cjs"])fs.copyFileSync(path.join(source,"scripts",name),path.join(tmp,"scripts",name));
 for(const name of ["validate-publication.mjs","internal-review.mjs","schema-validation.mjs","internal-review-fixtures.mjs"])fs.copyFileSync(path.join(source,name),path.join(tmp,name));
 fs.cpSync(path.join(source,"editorial"),path.join(tmp,"editorial"),{recursive:true});
 for(const name of ["records.json","published.json","schema.json","internal-reviews.json","internal-review-schema.json"])fs.copyFileSync(path.join(source,"data",name),path.join(tmp,"data",name));
 assert(run("validate.cjs").status===0,"Baseline validation failed");
 const sample=JSON.parse(fs.readFileSync(path.join(tmp,"data","records.json"),"utf8"))[0];
 sample.id="RK-0000";sample.status="inbox";
 const intake=path.join(tmp,"intake.json"),allocated=path.join(tmp,"allocated.json");
 fs.writeFileSync(intake,JSON.stringify(sample));
 assert(run("allocate.cjs",[intake,allocated]).status===0,"Allocation failed");
 const record=JSON.parse(fs.readFileSync(allocated,"utf8"));
 const occupied=JSON.parse(fs.readFileSync(path.join(tmp,"data","records.json"),"utf8")).map(r=>Number(r.id.slice(3)));
 const expected="RK-"+String(Math.max(0,...occupied)+1).padStart(4,"0");
 assert(record.id===expected&&record.status==="draft","Incorrect allocated record");
 record.status="approved";record.review={facts_verified:true,license_verified:true,translations_verified:true,reviewer:"Fixture reviewer",reviewed_at:"2026-10-26"};
 fs.writeFileSync(allocated,JSON.stringify(record));
 assert(run("archive.cjs",[allocated,"Initial fixture","Fixture reviewer"]).status===0,"Archive failed");
 const history=path.join(tmp,"history",record.id,"v0001.json");
 assert(fs.existsSync(history),"Archive snapshot missing");
 assert(run("archive.cjs",[allocated,"Duplicate","Fixture reviewer"]).status!==0,"Duplicate archive was accepted");
 const publicData=JSON.parse(fs.readFileSync(path.join(tmp,"data","published.json"),"utf8"));
 record.status="published";record.sources[0].license_status="permitted";
 record.sources[0].rights_basis="Synthetic fixture: original expression";
 record.sources[0].rights_evidence="test://evidence";
 record.review.evidence_ref="test://evidence";
 record.review.translation_reviewer="Synthetic language editor";
 const makeReviews=cp.spawnSync(process.execPath,['--input-type=module','-e',`import {fixtureReviews} from ${JSON.stringify(require('node:url').pathToFileURL(path.join(tmp,'internal-review-fixtures.mjs')).href)}; console.log(JSON.stringify(fixtureReviews(${JSON.stringify(record)})))`],{encoding:'utf8'});
 assert(!makeReviews.error && makeReviews.status===0,'Fixture signoff generation failed: '+makeReviews.stderr);
 fs.writeFileSync(path.join(tmp,'data/internal-reviews.json'),JSON.stringify({version:1,entries:JSON.parse(makeReviews.stdout)}));
 publicData.entries=[record];
 fs.writeFileSync(path.join(tmp,"data","published.json"),JSON.stringify(publicData));
 assert(run("check-publication.cjs").status===0,"Publication gate rejected reviewed fixture");
 assert(run("validate.cjs").status===0,"Validator rejected reviewed fixture");
 record.review.license_verified=false;
 publicData.entries=[record];fs.writeFileSync(path.join(tmp,"data","published.json"),JSON.stringify(publicData));
 assert(run("check-publication.cjs").status!==0,"Unreviewed fixture passed publication gate");
 // Reject duplicate draft IDs.
 const draftPath=path.join(tmp,"data","records.json");
 const originalDrafts=JSON.parse(fs.readFileSync(draftPath,"utf8"));
 fs.writeFileSync(draftPath,JSON.stringify([...originalDrafts,{...originalDrafts[0]}]));
 assert(run("validate.cjs").status!==0,"Duplicate draft IDs passed validation");
 fs.writeFileSync(draftPath,JSON.stringify(originalDrafts));
 console.log("RUNLU Knowledge E2E smoke test passed (temporary fixture only).");
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
