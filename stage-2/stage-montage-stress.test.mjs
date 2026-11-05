import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {renderStageMontage} from './stage-montage-render.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';

// Explicit opt-in to avoid consuming CI runner minutes on every small change.
// RUNLU_STAGE_STRESS=1 node --test stage-2/stage-montage-stress.test.mjs
const enabled=process.env.RUNLU_STAGE_STRESS==='1';
async function generate(args){
 await new Promise((resolve,reject)=>{
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('Stress fixture failed')));
 });
}
test('five-minute offline montage has complete video/audio/subtitle tracks',{skip:!enabled,timeout:600000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-5min-'));
 try{
  const clip=join(dir,'scene.mp4'),voice=join(dir,'voice.wav');
  // A 60-second normalized video fixture repeated five times; 1fps keeps
  // the stress test focused on timeline length rather than image quality.
  await generate(['-f','lavfi','-i','color=c=navy:s=160x120:r=1','-t','60',
   '-an','-c:v','libx264','-pix_fmt','yuv420p','-y',clip]);
  await generate(['-f','lavfi','-i','sine=frequency=440:sample_rate=8000',
   '-t','2','-c:a','pcm_s16le','-y',voice]);
  const clipBytes=await readFile(clip),voiceBytes=await readFile(voice);
  const started=performance.now();
  const output=await renderStageMontage({
   clips:Array.from({length:5},()=>clipBytes),
   voiceSegments:Array.from({length:5},(_,i)=>({bytes:voiceBytes,startSeconds:i*60})),
   durationSeconds:300,
   subtitleCues:Array.from({length:5},(_,i)=>({
    startSeconds:i*60,endSeconds:i*60+2,text:'RUNLU scene '+(i+1)
   }))
  });
  const elapsedSeconds=(performance.now()-started)/1000;
  const info=await probeMp4Bytes(output);
  assert.ok(Number(info.duration)>=299&&Number(info.duration)<=301,
   'Expected 300-second final media duration');
  assert.ok(info.streams.some(s=>s.codec_type==='video'&&s.codec_name==='h264'));
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
  assert.ok(info.streams.some(s=>s.codec_type==='subtitle'&&s.codec_name==='mov_text'));
  assert.ok(output.length>1024);
  console.log(JSON.stringify({test:'stage-five-minute-montage',
   elapsedSeconds:Number(elapsedSeconds.toFixed(2)),outputBytes:output.length,
   durationSeconds:Number(info.duration)}));
 }finally{await rm(dir,{recursive:true,force:true});}
});
