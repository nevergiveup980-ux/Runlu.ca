import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Offline MVP: concatenate normalized H264/AAC MP4 segments. No shell, network,
// model calls or permanent files. Normalize inputs before invoking this worker.
export async function concatenateStageMp4({segments,ffmpeg='ffmpeg',timeoutMs=120000,maxOutputBytes=250*1024*1024}) {
 if(!Array.isArray(segments)||segments.length<1||segments.length>120||
    !segments.every(s=>Buffer.isBuffer(s)&&s.length>=16&&s.length<=50*1024*1024))
  throw Error('1-120 bounded MP4 segments required');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000||
    !Number.isSafeInteger(maxOutputBytes)||maxOutputBytes<1024)
  throw Error('Invalid render limits');
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-concat-'));
 try{
  const names=[];
  for(let i=0;i<segments.length;i++){
   const name='segment-'+String(i).padStart(3,'0')+'.mp4';
   await writeFile(join(dir,name),segments[i],{mode:0o600});names.push(name);
  }
  await writeFile(join(dir,'segments.txt'),names.map(n=>"file '"+n+"'").join('\n')+'\n',{mode:0o600});
  await new Promise((resolve,reject)=>{
   const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-f','concat','-safe','1','-i','segments.txt','-map','0:v:0','-map','0:a?','-c','copy','-movflags','+faststart','-y','output.mp4'],{cwd:dir,stdio:['ignore','ignore','pipe']});
   let settled=false,stderrBytes=0;
   const finish=(err)=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve();};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('MP4 concat timeout'));},timeoutMs);
   child.on('error',finish);
   child.stderr.on('data',chunk=>{stderrBytes+=chunk.length;if(stderrBytes>65536){child.kill('SIGKILL');finish(Error('MP4 concat error output too large'));}});
   child.on('close',code=>finish(code===0?null:Error('MP4 concat failed')));
  });
  const result=await readFile(join(dir,'output.mp4'));
  if(result.length>maxOutputBytes)throw Error('MP4 concat output too large');
  return result;
 }finally{await rm(dir,{recursive:true,force:true});}
}
