import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {normalizeStageClip} from './stage-video-normalize.mjs';
import {concatenateStageMp4} from './stage-mp4-concat.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
async function fixture(path,color,size,fps){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i',`color=c=${color}:s=${size}:r=${fps}`,'-t','1','-an','-c:v','mpeg4','-y',path],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('fixture failed')));
 });
}
test('normalizes mismatched clips before concatenating to H264 MP4',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-normalize-test-'));
 try{
  const a=join(dir,'a.mp4'),b=join(dir,'b.mp4');
  await fixture(a,'red','320x240',15);await fixture(b,'blue','240x320',30);
  const clips=await Promise.all([a,b].map(async p=>normalizeStageClip({bytes:await readFile(p),width:320,height:240,fps:24})));
  const info=await probeMp4Bytes(clips[1]);
  assert.equal(info.streams[0].codec_name,'h264');
  assert.equal(info.streams[0].width,320);assert.equal(info.streams[0].height,240);
  const joined=await concatenateStageMp4({segments:clips});
  const output=await probeMp4Bytes(joined);
  assert.ok(Number(output.duration)>1.8&&Number(output.duration)<2.5);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects invalid video profiles before invoking ffmpeg',async()=>{
 await assert.rejects(normalizeStageClip({bytes:Buffer.alloc(16),width:321}),/profile/);
 await assert.rejects(normalizeStageClip({bytes:Buffer.alloc(0)}),/source video/);
});
