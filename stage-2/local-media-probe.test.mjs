import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {probeLocalMp4} from "./local-media-probe.mjs";
const sha256="a".repeat(64);
test("reject file outside private root before invoking ffprobe",async()=>{
 const root=await mkdtemp(join(tmpdir(),"stage-probe-"));
 const other=await mkdtemp(join(tmpdir(),"stage-outside-"));
 try{
  const path=join(other,"video.mp4");await writeFile(path,"not a video");
  await assert.rejects(probeLocalMp4({filePath:path,privateRoot:root,sha256}),/outside private root/);
 }finally{await rm(root,{recursive:true,force:true});await rm(other,{recursive:true,force:true});}
});
test("reject empty file before invoking ffprobe",async()=>{
 const root=await mkdtemp(join(tmpdir(),"stage-probe-"));
 try{
  const path=join(root,"empty.mp4");await writeFile(path,"");
  await assert.rejects(probeLocalMp4({filePath:path,privateRoot:root,sha256}),/Invalid media size/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test("reject unsafe timeout",async()=>assert.rejects(probeLocalMp4({filePath:"x",privateRoot:"y",sha256,timeoutMs:0}),/Invalid probe timeout/));
