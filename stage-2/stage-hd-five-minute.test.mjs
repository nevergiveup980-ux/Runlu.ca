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
async function ffmpeg(args){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('Fixture generation failed')));
 });
}
test('five-minute 720p 24fps dynamic montage with 60 timed narrations and subtitles',
 {skip:!enabled,timeout:600000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-hd-5min-'));
 try{
  const scene=join(dir,'scene.mp4'),voice=join(dir,'voice.wav');
  // A short moving source is repeated to stress the 300-second container
  // timeline without requiring hundreds of MB of fixture storage.
  await ffmpeg(['-f','lavfi','-i','testsrc2=size=1280x720:rate=24',
   '-t','5','-an','-c:v','libx264','-preset','veryfast','-crf','32',
   '-pix_fmt','yuv420p','-y',scene]);
  await ffmpeg(['-f','lavfi','-i','sine=frequency=550:sample_rate=16000',
   '-t','0.5','-c:a','pcm_s16le','-y',voice]);
  const v=await readFile(scene),a=await readFile(voice);
  const started=performance.now();
  const result=await renderStageMontage({
   clips:Array.from({length:60},()=>v),
   voiceSegments:Array.from({length:60},(_,i)=>({bytes:a,startSeconds:i*5})),
   durationSeconds:300,
   subtitleCues:Array.from({length:60},(_,i)=>({
    startSeconds:i*5,endSeconds:i*5+0.5,text:'Scene '+(i+1)}))
  });
  const elapsedSeconds=(performance.now()-started)/1000;
  const info=await probeMp4Bytes(result);
  const video=info.streams.find(s=>s.codec_type==='video');
  assert.equal(video?.width,1280);assert.equal(video?.height,720);
  assert.ok(Number(info.duration)>=299&&Number(info.duration)<=301);
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
  assert.ok(info.streams.some(s=>s.codec_type==='subtitle'&&s.codec_name==='mov_text'));
  console.log(JSON.stringify({test:'stage-five-minute-HD-dynamic',
   elapsedSeconds:Number(elapsedSeconds.toFixed(2)),
   outputBytes:result.length,durationSeconds:Number(info.duration),
   width:video.width,height:video.height,fps:video.r_frame_rate,
   scenes:60,narrationSegments:60,subtitleCues:60}));
 }finally{await rm(dir,{recursive:true,force:true});}
});
