import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {concatenateStageMp4} from './stage-mp4-concat.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
async function fixture(path,color){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c='+color+':s=160x120:r=10','-t','1','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',path],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('fixture failed')));
 });
}
test('joins two real normalized MP4 clips into playable 2-second MP4',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-concat-test-'));
 try{
  const a=join(dir,'a.mp4'),b=join(dir,'b.mp4');
  await fixture(a,'red');await fixture(b,'blue');
  const result=await concatenateStageMp4({segments:[await readFile(a),await readFile(b)]});
  const info=await probeMp4Bytes(result);
  assert.ok(Number(info.duration)>1.8&&Number(info.duration)<2.5);
  assert.equal(info.streams[0].codec_name,'h264');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects empty and oversized clip collections',async()=>{
 await assert.rejects(concatenateStageMp4({segments:[]}),/bounded/);
 await assert.rejects(concatenateStageMp4({segments:Array(121).fill(Buffer.alloc(16))}),/bounded/);
});
