// Local-only ffprobe execution boundary. Never pass user input to a shell.
import {spawn} from "node:child_process";
import {realpath,stat} from "node:fs/promises";
import {resolve,relative,isAbsolute} from "node:path";
import {inspectMp4Probe} from "./media-probe.mjs";
export async function probeLocalMp4({filePath,privateRoot,sha256,timeoutMs=15000,maxBytes=500_000_000}){
 if(typeof filePath!=="string"||typeof privateRoot!=="string"||!filePath||!privateRoot)throw Error("Private local paths required");
 if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>60000)throw Error("Invalid probe timeout");
 const root=await realpath(resolve(privateRoot));
 const file=await realpath(resolve(filePath));
 const rel=relative(root,file);
 if(!rel||rel===".."||rel.startsWith("../")||rel.startsWith("..\\")||isAbsolute(rel))throw Error("Media outside private root");
 const info=await stat(file);
 if(!info.isFile()||info.size<=0||info.size>maxBytes)throw Error("Invalid media size");
 const raw=await new Promise((accept,reject)=>{
  const child=spawn("ffprobe",["-v","error","-show_entries","format=format_name,duration:stream=codec_type,codec_name,width,height","-of","json","--",file],{shell:false,stdio:["ignore","pipe","pipe"]});
  let stdout="",stderr="",settled=false;
  const fail=e=>{if(!settled){settled=true;reject(e);}};
  const timer=setTimeout(()=>{child.kill("SIGKILL");fail(Error("ffprobe timed out"));},timeoutMs);
  child.stdout.on("data",d=>{stdout+=d;if(stdout.length>1_000_000){child.kill("SIGKILL");fail(Error("ffprobe output too large"));}});
  child.stderr.on("data",d=>{stderr+=d;if(stderr.length>10000)stderr=stderr.slice(-10000);});
  child.on("error",fail);
  child.on("close",code=>{clearTimeout(timer);if(settled)return;settled=true;if(code!==0)reject(Error("ffprobe failed"));else accept(stdout);});
 });
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error("Invalid ffprobe JSON");}
 return inspectMp4Probe(parsed,{bytes:info.size,sha256});
}
