import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {renderStageMontage} from './stage-montage-render.mjs';
import {probeMp4Bytes} from './ffprobe-media-service.mjs';
async function fixture(args){
 await new Promise((resolve,reject)=>{
  const p=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:'ignore'});
  p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error('fixture failed')));
 });
}
test('renders two scenes, two timed voice clips and selectable MP4 subtitles',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-full-test-'));
 try{
  const a=join(dir,'a.mp4'),b=join(dir,'b.mp4'),voice=join(dir,'voice.wav');
  for(const [path,color] of [[a,'red'],[b,'blue']])
   await fixture(['-f','lavfi','-i',`color=c=${color}:s=160x120:r=10`,'-t','1','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',path]);
  await fixture(['-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','0.25','-c:a','pcm_s16le','-y',voice]);
  const wav=await readFile(voice);
  const result=await renderStageMontage({clips:[await readFile(a),await readFile(b)],
   voiceSegments:[{bytes:wav,startSeconds:0},{bytes:wav,startSeconds:1}],
   durationSeconds:2,subtitleCues:[
    {startSeconds:0,endSeconds:0.25,text:'RUNLU'},
    {startSeconds:1,endSeconds:1.25,text:'Second scene'}]});
  const info=await probeMp4Bytes(result);
  assert.ok(Number(info.duration)>1.8&&Number(info.duration)<2.5);
  assert.ok(info.streams.some(s=>s.codec_type==='video'&&s.codec_name==='h264'));
  assert.ok(info.streams.some(s=>s.codec_type==='audio'&&s.codec_name==='aac'));
  assert.ok(info.streams.some(s=>s.codec_type==='subtitle'&&s.codec_name==='mov_text'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects empty montage without rendering',async()=>{
 await assert.rejects(renderStageMontage({clips:[],voiceSegments:[],durationSeconds:2}),/timeline/);
});
