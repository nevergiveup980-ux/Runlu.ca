import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyMp4} from './mp4-validator.mjs';

// ffprobe runs without a shell on a temporary private file.
export async function probeMp4Bytes(bytes,{binary='ffprobe',timeoutMs=15000}={}) {
 if(!Buffer.isBuffer(bytes)||bytes.length<16)throw Error('Video bytes required');
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-probe-'));
 const path=join(dir,'input.mp4');
 try {
  await writeFile(path,bytes,{mode:0o600});
  const output=await new Promise((resolve,reject)=>{
   const child=spawn(binary,['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',path],{stdio:['ignore','pipe','pipe']});
   let stdout='',stderr='',settled=false;
   const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
   const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('ffprobe timeout'));},timeoutMs);
   child.on('error',e=>finish(e));
   child.stdout.on('data',chunk=>{stdout+=chunk;if(stdout.length>100000){child.kill('SIGKILL');finish(Error('ffprobe output too large'));}});
   child.stderr.on('data',chunk=>{stderr+=chunk;if(stderr.length>100000){child.kill('SIGKILL');finish(Error('ffprobe error output too large'));}});
   child.on('close',code=>code===0?finish(null,stdout):finish(Error('ffprobe failed')));
  });
  const parsed=JSON.parse(output);
  return {duration:parsed?.format?.duration,streams:parsed?.streams};
 }finally{await rm(dir,{recursive:true,force:true});}
}
export function createVerifiedVideoMedia({downloader,probe=probeMp4Bytes}) {
 if(typeof downloader?.download!=='function'||typeof probe!=='function')throw Error('Media dependencies required');
 return {async fetchAndVerify(url){
  const bytes=await downloader.download(url);
  const metadata=await verifyMp4({bytes,probe});
  return {...metadata,bytes};
 }};
}
