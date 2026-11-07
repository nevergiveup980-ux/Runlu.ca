import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {concatenateStageMp4} from './stage-mp4-concat.mjs';
import {mixStageNarrationTimeline} from './stage-narration-mix.mjs';
import {muxStageNarration} from './stage-narration-mux.mjs';
import {stageSubtitlesToSrt} from './stage-subtitles.mjs';

// Offline prototype: normalized silent clips + timed WAV narration + optional
// selectable MP4 subtitle track (mov_text). Does not burn text into frames.
export async function renderStageMontage({clips,voiceSegments,durationSeconds,subtitleCues=[],ffmpeg='ffmpeg'}) {
 if(!Array.isArray(clips)||!clips.length||!Array.isArray(voiceSegments)||!voiceSegments.length||
    !Number.isFinite(durationSeconds)||durationSeconds<=0||durationSeconds>900)
  throw Error('Valid montage timeline required');
 const srt=stageSubtitlesToSrt(subtitleCues);
 const video=await concatenateStageMp4({segments:clips,ffmpeg});
 const audio=await mixStageNarrationTimeline({segments:voiceSegments,durationSeconds,ffmpeg});
 const narrated=await muxStageNarration({videoBytes:video,audioBytes:audio,ffmpeg});
 if(!srt)return narrated;
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-caption-'));
 try{
  await Promise.all([
   writeFile(join(dir,'input.mp4'),narrated,{mode:0o600}),
   writeFile(join(dir,'captions.srt'),srt,{mode:0o600})
  ]);
  await new Promise((resolve,reject)=>{
   const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-i','input.mp4',
    '-i','captions.srt','-map','0:v:0','-map','0:a:0','-map','1:s:0',
    '-c:v','copy','-c:a','copy','-c:s','mov_text','-metadata:s:s:0','language=und',
    '-movflags','+faststart','-y','captioned.mp4'],{cwd:dir,stdio:['ignore','ignore','pipe']});
   let settled=false,diagnostics=0;
   const finish=err=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve();};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('Caption mux timeout'));},120000);
   child.on('error',finish);
   child.stderr.on('data',chunk=>{diagnostics+=chunk.length;if(diagnostics>65536){child.kill('SIGKILL');finish(Error('Caption mux diagnostics limit exceeded'));}});
   child.on('close',code=>finish(code===0?null:Error('Caption mux failed')));
  });
  const output=await readFile(join(dir,'captioned.mp4'));
  if(output.length>250*1024*1024)throw Error('Captioned MP4 too large');
  return output;
 }finally{await rm(dir,{recursive:true,force:true});}
}
