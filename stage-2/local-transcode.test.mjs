import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {transcodeToH264Mp4} from "./local-transcode.mjs";
test("reject invalid output names",async()=>assert.rejects(transcodeToH264Mp4({sourcePath:"a",privateRoot:"b",outputName:"../evil.mp4"}),/Invalid output filename/));
test("reject source outside private root before invoking ffmpeg",async()=>{
 const root=await mkdtemp(join(tmpdir(),"stage-transcode-"));
 const outside=await mkdtemp(join(tmpdir(),"stage-source-"));
 try{
  const sourcePath=join(outside,"source.mov");await writeFile(sourcePath,"not video");
  await assert.rejects(transcodeToH264Mp4({sourcePath,privateRoot:root}),/Source outside private root/);
 }finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});
test("reject invalid transcode timeout",async()=>assert.rejects(transcodeToH264Mp4({sourcePath:"a",privateRoot:"b",timeoutMs:0}),/Invalid timeout/));
