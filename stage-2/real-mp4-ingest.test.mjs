import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {probeMp4Bytes,createVerifiedVideoMedia} from './ffprobe-media-service.mjs';
import {createPrivateMp4Storage} from './private-mp4-storage.mjs';

async function generateMp4(path){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:s=160x120:r=5','-t','1','-an','-c:v','mpeg4','-y',path],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('ffmpeg fixture failed')));
 });
}
test('real ffprobe inspects generated playable MP4 and rejects unsupported codec',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-real-video-'));
 try{
  const path=join(dir,'fixture.mp4');await generateMp4(path);
  const bytes=await readFile(path);
  const info=await probeMp4Bytes(bytes);
  assert.equal(info.streams[0].codec_type,'video');
  assert.equal(info.streams[0].width,160);
  assert.equal(info.streams[0].height,120);
  assert.ok(Number(info.duration)>0);
  const media=createVerifiedVideoMedia({downloader:{download:async()=>bytes}});
  await assert.rejects(media.fetchAndVerify('https://example.org/fixture.mp4'),/media validation failed/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('real FFprobe and private storage accept an H264 MP4',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-h264-'));
 try{
  const path=join(dir,'fixture.mp4');
  await new Promise((resolve,reject)=>{
   const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:s=160x120:r=5','-t','1','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',path],{stdio:'ignore'});
   child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('ffmpeg H264 fixture failed')));
  });
  const bytes=await readFile(path);
  const media=createVerifiedVideoMedia({downloader:{download:async()=>bytes}});
  const verified=await media.fetchAndVerify('https://example.org/fixture.mp4');
  assert.equal(verified.valid,true);assert.equal(verified.codec,'h264');
  let saved;
  const storage=createPrivateMp4Storage({bucket:'stage-private',putObject:async obj=>{saved=obj;}});
  const result=await storage.savePrivate({taskId:'test_task',verified});
  assert.equal(saved.private,true);assert.deepEqual(saved.body,bytes);
  assert.match(result.storageKey,/\.mp4$/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
