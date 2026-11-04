import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mixStageNarrationTimeline} from './stage-narration-mix.mjs';
import {muxStageNarration} from './stage-narration-mux.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
async function ffmpeg(args){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('fixture generation failed')));
 });
}
test('mixes separate voice scenes and muxes to playable H264 AAC MP4',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-mix-test-'));
 try{
  const video=join(dir,'video.mp4'),voice=join(dir,'voice.wav');
  await ffmpeg(['-f','lavfi','-i','color=c=green:s=160x120:r=10','-t','3','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',video]);
  await ffmpeg(['-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','0.5','-c:a','pcm_s16le','-y',voice]);
  const bytes=await readFile(voice);
  const mixed=await mixStageNarrationTimeline({segments:[{bytes,startSeconds:0},{bytes,startSeconds:2}],durationSeconds:3});
  const result=await muxStageNarration({videoBytes:await readFile(video),audioBytes:mixed});
  const info=await probeMp4Bytes(result);
  assert.ok(Number(info.duration)>2.8&&Number(info.duration)<3.3);
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects empty or invalid narration timelines',async()=>{
 await assert.rejects(mixStageNarrationTimeline({segments:[],durationSeconds:3}),/bounded/);
 await assert.rejects(mixStageNarrationTimeline({segments:[{bytes:Buffer.alloc(44),startSeconds:5}],durationSeconds:3}),/bounded/);
});
