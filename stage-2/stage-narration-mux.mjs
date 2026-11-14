import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Compose an already-normalized silent MP4 with a single narration WAV track.
// Caller verifies media ownership and duration before this privileged worker.
export async function muxStageNarration({videoBytes,audioBytes,ffmpeg='ffmpeg',timeoutMs=120000,maxOutputBytes=250*1024*1024}) {
 if(!Buffer.isBuffer(videoBytes)||videoBytes.length<16||videoBytes.length>200*1024*1024||
    !Buffer.isBuffer(audioBytes)||audioBytes.length<44||audioBytes.length>100*1024*1024)
  throw Error('Bounded MP4 video and WAV audio bytes required');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000||
    !Number.isSafeInteger(maxOutputBytes)||maxOutputBytes<1024)
  throw Error('Invalid mux limits');
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-mux-'));
 try{
  await Promise.all([
   writeFile(join(dir,'video.mp4'),videoBytes,{mode:0o600}),
   writeFile(join(dir,'voice.wav'),audioBytes,{mode:0o600})
  ]);
  await new Promise((resolve,reject)=>{
   const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-nostdin',
    '-i','video.mp4','-i','voice.wav','-map','0:v:0','-map','1:a:0',
    '-c:v','copy','-c:a','aac','-b:a','128k','-af','apad',
    '-shortest','-movflags','+faststart','-y','result.mp4'],
    {cwd:dir,stdio:['ignore','ignore','pipe']});
   let settled=false,diagnostics=0;
   const finish=err=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve();};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('Narration mux timeout'));},timeoutMs);
   child.on('error',finish);
   child.stderr.on('data',chunk=>{diagnostics+=chunk.length;if(diagnostics>65536){child.kill('SIGKILL');finish(Error('Narration mux diagnostics limit exceeded'));}});
   child.on('close',code=>finish(code===0?null:Error('Narration mux failed')));
  });
  const result=await readFile(join(dir,'result.mp4'));
  if(result.length>maxOutputBytes)throw Error('Narrated MP4 exceeds output limit');
  return result;
 }finally{await rm(dir,{recursive:true,force:true});}
}
