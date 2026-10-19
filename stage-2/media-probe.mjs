// Safe ffprobe JSON interpretation only. The worker must execute ffprobe with
// an argument array (never a shell), a timeout, and a local private file path.
import { verifyDeliveryMp4 } from "./ingest-policy.mjs";
export function inspectMp4Probe(probe,{bytes,sha256,maxSeconds=3600}={}){
 if(!probe||typeof probe!=="object"||!Array.isArray(probe.streams))throw Error("Invalid ffprobe result");
 const video=probe.streams.filter(s=>s.codec_type==="video");
 if(video.length!==1)throw Error("Exactly one video stream required");
 const stream=video[0],format=probe.format;
 if(!format||typeof format.format_name!=="string"||!format.format_name.split(",").includes("mp4"))throw Error("MP4 container required");
 if(stream.codec_name!=="h264")throw Error("H264 video required");
 const width=Number(stream.width),height=Number(stream.height);
 const durationSeconds=Number(format.duration);
 if(!Number.isFinite(durationSeconds)||durationSeconds<=0)throw Error("Invalid probed duration");
 const meta={bytes,durationSeconds,width,height,mime:"video/mp4",codec:"h264",sha256};
 return verifyDeliveryMp4(meta,{maxSeconds});
}
