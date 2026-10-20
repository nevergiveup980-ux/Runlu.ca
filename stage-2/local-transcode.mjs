// Local transcoding boundary. Never interpolate untrusted values into a shell.
// Output is always placed under the private root and MUST be re-probed before delivery.
import {spawn} from "node:child_process";
import {realpath,stat,mkdir} from "node:fs/promises";
import {resolve,relative,isAbsolute,join} from "node:path";
function inside(root,path){const rel=relative(root,path);return !!rel&&rel!==".."&&!rel.startsWith("../")&&!rel.startsWith("..\\")&&!isAbsolute(rel);}
export async function transcodeToH264Mp4({sourcePath,privateRoot,outputName="delivery.mp4",timeoutMs=120000,maxSourceBytes=500_000_000}){
 if(typeof sourcePath!=="string"||typeof privateRoot!=="string"||!sourcePath||!privateRoot)throw Error("Private paths required");
 if(typeof outputName!=="string"||!/^[a-zA-Z0-9_-]{1,60}\.mp4$/.test(outputName))throw Error("Invalid output filename");
 if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000)throw Error("Invalid timeout");
 const root=await realpath(resolve(privateRoot));
 const source=await realpath(resolve(sourcePath));
 if(!inside(root,source))throw Error("Source outside private root");
 const info=await stat(source);
 if(!info.isFile()||info.size<=0||info.size>maxSourceBytes)throw Error("Invalid source size");
 const outputDir=join(root,"transcoded");
 await mkdir(outputDir,{recursive:true,mode:0o700});
 const output=join(outputDir,outputName);
 // Never overwrite existing output: callers must choose a unique job-scoped name.
 const existing=await stat(output).catch(e=>{if(e.code==="ENOENT")return null;throw e;});
 if(existing)throw Error("Output already exists");
 await new Promise((resolveDone,reject)=>{
  const args=["-hide_banner","-loglevel","error","-nostdin","-i",source,"-map","0:v:0","-map","0:a:0?","-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart","-c:a","aac","-y",output];
  const child=spawn("ffmpeg",args,{shell:false,stdio:["ignore","ignore","pipe"]});
  let settled=false,stderr="";
  const fail=e=>{if(!settled){settled=true;reject(e);}};
  const timer=setTimeout(()=>{child.kill("SIGKILL");fail(Error("Transcode timed out"));},timeoutMs);
  child.stderr.on("data",d=>{stderr+=d;if(stderr.length>4096)stderr=stderr.slice(-4096);});
  child.on("error",fail);
  child.on("close",code=>{clearTimeout(timer);if(settled)return;settled=true;code===0?resolveDone():reject(Error("Transcode failed"));});
 });
 return {outputPath:output,verified:false,requiresProbe:true};
}
