import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {muxStageNarration} from './stage-narration-mux.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
async function ffmpeg(args){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('fixture generation failed')));
 });
}
test('produces a playable H264/AAC MP4 with shorter WAV narration',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-mux-test-'));
 try{
  const video=join(dir,'video.mp4'),audio=join(dir,'voice.wav');
  await ffmpeg(['-f','lavfi','-i','color=c=blue:s=160x120:r=10','-t','2','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',video]);
  await ffmpeg(['-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','1','-c:a','pcm_s16le','-y',audio]);
  const output=await muxStageNarration({videoBytes:await readFile(video),audioBytes:await readFile(audio)});
  const info=await probeMp4Bytes(output);
  assert.ok(Number(info.duration)>1.8&&Number(info.duration)<2.5);
  assert.ok(info.streams.some(s=>s.codec_type==='video'&&s.codec_name==='h264'));
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects missing video or audio before launching ffmpeg',async()=>{
 await assert.rejects(muxStageNarration({videoBytes:Buffer.alloc(0),audioBytes:Buffer.alloc(44)}),/Bounded/);
 await assert.rejects(muxStageNarration({videoBytes:Buffer.alloc(16),audioBytes:Buffer.alloc(0)}),/Bounded/);
});
