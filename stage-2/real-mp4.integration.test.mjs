// Real local MP4 acceptance test: no provider API, network, or cloud storage.
import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdtemp,readFile,writeFile,rm,symlink} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {probeLocalMp4} from "./local-media-probe.mjs";
const available=name=>spawnSync(name,["-version"],{timeout:3000,stdio:"ignore"}).status===0;
const mediaToolsAvailable=available("ffmpeg")&&available("ffprobe");
test("real H264 MP4 passes private-file SHA256 and ffprobe delivery gates",async()=>{
 assert.equal(mediaToolsAvailable,true,"FFmpeg and ffprobe must be installed for real media integration");
 const root=await mkdtemp(join(tmpdir(),"stage-real-mp4-"));
 try{
  const filePath=join(root,"sample.mp4");
  const generated=spawnSync("ffmpeg",["-hide_banner","-loglevel","error","-f","lavfi","-i","color=c=black:s=320x240:r=1","-t","1","-an","-c:v","libx264","-pix_fmt","yuv420p","-y",filePath],{timeout:15000,encoding:"utf8"});
  assert.equal(generated.status,0,generated.stderr||"ffmpeg failed");
  const bytes=await readFile(filePath);
  const sha256=createHash("sha256").update(bytes).digest("hex");
  const result=await probeLocalMp4({filePath,privateRoot:root,sha256});
  assert.equal(result.deliveryFormat,"mp4-h264");
  assert.equal(result.width,320);
  assert.equal(result.height,240);
  assert.equal(result.bytes,bytes.length);
  await assert.rejects(probeLocalMp4({filePath,privateRoot:root,sha256:"0".repeat(64)}),/Media SHA256 mismatch/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test("private-root symlink escape is rejected before media probing",async()=>{
 const root=await mkdtemp(join(tmpdir(),"stage-private-"));
 const outside=await mkdtemp(join(tmpdir(),"stage-outside-"));
 try{
  await writeFile(join(outside,"sample.mp4"),"outside private storage");
  const link=join(root,"escape");
  await symlink(outside,link,"dir");
  await assert.rejects(probeLocalMp4({filePath:join(link,"sample.mp4"),privateRoot:root,sha256:"0".repeat(64)}),/Media outside private root/);
 }finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});

test("a non-video file with a correct SHA256 cannot pass media verification",async()=>{
 assert.equal(mediaToolsAvailable,true,"FFmpeg and ffprobe required");
 const root=await mkdtemp(join(tmpdir(),"stage-corrupt-mp4-"));
 try{
  const filePath=join(root,"fake.mp4");
  const bytes=Buffer.from("This file is not a playable MP4.");
  await writeFile(filePath,bytes);
  const sha256=createHash("sha256").update(bytes).digest("hex");
  await assert.rejects(probeLocalMp4({filePath,privateRoot:root,sha256}),/ffprobe failed|Invalid ffprobe|MP4 container required|Exactly one video stream required/);
 }finally{await rm(root,{recursive:true,force:true});}
});
