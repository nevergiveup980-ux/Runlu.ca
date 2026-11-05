import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {renderStageMontage} from './stage-montage-render.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
const enabled=process.env.RUNLU_STAGE_STRESS==='1';
async function make(args){
 await new Promise((resolve,reject)=>{
  const p=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error('HD fixture generation failed')));
 });
}
test('HD 720p 24fps moving-video narration and subtitle export',{skip:!enabled,timeout:180000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-hd-'));
 try{
  const scene=join(dir,'scene.mp4'),voice=join(dir,'voice.wav');
  // Animated test pattern, not a static color: catches frame-rate/size regressions.
  await make(['-f','lavfi','-i','testsrc2=size=1280x720:rate=24',
   '-t','3','-an','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-y',scene]);
  await make(['-f','lavfi','-i','sine=frequency=550:sample_rate=48000',
   '-t','1','-c:a','pcm_s16le','-y',voice]);
  const v=await readFile(scene),a=await readFile(voice);
  const start=performance.now();
  const result=await renderStageMontage({clips:[v,v],
   voiceSegments:[{bytes:a,startSeconds:0},{bytes:a,startSeconds:3}],
   durationSeconds:6,
   subtitleCues:[{startSeconds:0,endSeconds:1,text:'First HD scene'},
    {startSeconds:3,endSeconds:4,text:'Second HD scene'}]});
  const info=await probeMp4Bytes(result);
  const video=info.streams.find(s=>s.codec_type==='video');
  assert.equal(video?.width,1280);assert.equal(video?.height,720);
  assert.ok(Number(info.duration)>=5.8&&Number(info.duration)<=6.3);
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
  assert.ok(info.streams.some(s=>s.codec_type==='subtitle'&&s.codec_name==='mov_text'));
  console.log(JSON.stringify({test:'stage-HD-motion-smoke',
   elapsedSeconds:Number(((performance.now()-start)/1000).toFixed(2)),
   outputBytes:result.length,durationSeconds:Number(info.duration),
   resolution:'1280x720',fps:video?.r_frame_rate}));
 }finally{await rm(dir,{recursive:true,force:true});}
});
