import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Video-only normalization for the initial montage pipeline.
// Audio/voice-over is added on a separate timeline in a later stage.
export async function normalizeStageClip({bytes,width=1280,height=720,fps=24,ffmpeg='ffmpeg',timeoutMs=120000,maxOutputBytes=100*1024*1024}) {
 if(!Buffer.isBuffer(bytes)||bytes.length<16||bytes.length>100*1024*1024)throw Error('Bounded source video bytes required');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<160||height<120||
    width>3840||height>2160||width%2||height%2||
    !Number.isInteger(fps)||fps<12||fps>60)throw Error('Invalid video profile');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000||
    !Number.isSafeInteger(maxOutputBytes)||maxOutputBytes<1024)throw Error('Invalid normalization limits');
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-normalize-'));
 try{
  await writeFile(join(dir,'source.mp4'),bytes,{mode:0o600});
  await new Promise((resolve,reject)=>{
   const filter=`fps=${fps},scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p`;
   const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-i','source.mp4','-map','0:v:0','-an','-vf',filter,'-c:v','libx264','-preset','veryfast','-crf','23','-movflags','+faststart','-y','normalized.mp4'],{cwd:dir,stdio:['ignore','ignore','pipe']});
   let settled=false,stderrBytes=0;
   const finish=err=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve();};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('Video normalization timeout'));},timeoutMs);
   child.on('error',finish);
   child.stderr.on('data',chunk=>{stderrBytes+=chunk.length;if(stderrBytes>65536){child.kill('SIGKILL');finish(Error('Video normalization diagnostic limit exceeded'));}});
   child.on('close',code=>finish(code===0?null:Error('Video normalization failed')));
  });
  const result=await readFile(join(dir,'normalized.mp4'));
  if(result.length>maxOutputBytes)throw Error('Normalized video exceeds output limit');
  return result;
 }finally{await rm(dir,{recursive:true,force:true});}
}
