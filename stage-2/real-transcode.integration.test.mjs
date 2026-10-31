// Real local transcoding integration, no paid provider or cloud service.
import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {transcodeToH264Mp4} from "./local-transcode.mjs";
import {probeLocalMp4} from "./local-media-probe.mjs";
test("real MOV source transcodes to H264 MP4 then passes SHA256 and ffprobe",async()=>{
 assert.equal(spawnSync("ffmpeg",["-version"],{stdio:"ignore",timeout:3000}).status,0,"ffmpeg required");
 const root=await mkdtemp(join(tmpdir(),"stage-transcode-real-"));
 try{
  const sourcePath=join(root,"source.mov");
  const generated=spawnSync("ffmpeg",["-hide_banner","-loglevel","error","-f","lavfi","-i","color=c=blue:s=320x240:r=2","-t","1","-an","-c:v","mpeg4","-y",sourcePath],{timeout:15000,encoding:"utf8"});
  assert.equal(generated.status,0,generated.stderr||"source generation failed");
  const result=await transcodeToH264Mp4({sourcePath,privateRoot:root,outputName:"test-output.mp4"});
  assert.equal(result.verified,false);
  assert.equal(result.requiresProbe,true);
  const bytes=await readFile(result.outputPath);
  const sha256=createHash("sha256").update(bytes).digest("hex");
  const checked=await probeLocalMp4({filePath:result.outputPath,privateRoot:root,sha256});
  assert.equal(checked.deliveryFormat,"mp4-h264");
  assert.equal(checked.codec,"h264");
  await assert.rejects(transcodeToH264Mp4({sourcePath,privateRoot:root,outputName:"test-output.mp4"}),/Output already exists/);
 }finally{await rm(root,{recursive:true,force:true});}
});
