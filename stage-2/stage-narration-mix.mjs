import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Assemble separate WAV voice assets on a common timeline.
// Input segments are measured/authorized by the caller; no paid TTS.
export async function mixStageNarrationTimeline({segments,durationSeconds,ffmpeg='ffmpeg',timeoutMs=120000,maxOutputBytes=100*1024*1024}) {
 if(!Array.isArray(segments)||segments.length<1||segments.length>120||
    !Number.isFinite(durationSeconds)||durationSeconds<=0||durationSeconds>900||
    !segments.every(s=>Buffer.isBuffer(s?.bytes)&&s.bytes.length>=44&&s.bytes.length<=30*1024*1024&&
     Number.isFinite(s.startSeconds)&&s.startSeconds>=0&&s.startSeconds<durationSeconds))
  throw Error('Valid bounded narration segments required');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000||
    !Number.isSafeInteger(maxOutputBytes)||maxOutputBytes<1024)throw Error('Invalid mix limits');
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-voice-mix-'));
 try{
  for(let i=0;i<segments.length;i++)await writeFile(join(dir,'voice-'+i+'.wav'),segments[i].bytes,{mode:0o600});
  const args=['-hide_banner','-loglevel','error','-nostdin'];
  for(let i=0;i<segments.length;i++)args.push('-i','voice-'+i+'.wav');
  const filters=segments.map((s,i)=>`[${i}:a]aresample=48000,adelay=${Math.round(s.startSeconds*1000)}:all=1[a${i}]`);
  filters.push(segments.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${segments.length}:duration=longest:normalize=0,atrim=duration=${durationSeconds},apad=whole_dur=${durationSeconds}[out]`);
  args.push('-filter_complex',filters.join(';'),'-map','[out]','-c:a','pcm_s16le','-ar','48000','-ac','1','-y','mixed.wav');
  await new Promise((resolve,reject)=>{
   const child=spawn(ffmpeg,args,{cwd:dir,stdio:['ignore','ignore','pipe']});
   let settled=false,diagnostics=0;
   const finish=err=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve();};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('Narration mix timeout'));},timeoutMs);
   child.on('error',finish);
   child.stderr.on('data',chunk=>{diagnostics+=chunk.length;if(diagnostics>65536){child.kill('SIGKILL');finish(Error('Narration mix diagnostics limit exceeded'));}});
   child.on('close',code=>finish(code===0?null:Error('Narration mix failed')));
  });
  const output=await readFile(join(dir,'mixed.wav'));
  if(output.length>maxOutputBytes)throw Error('Narration mix output too large');
  return output;
 }finally{await rm(dir,{recursive:true,force:true});}
}
