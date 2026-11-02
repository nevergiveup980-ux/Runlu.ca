/**
 * RUNLU MUSIC STUDIO — conservative MP3 duration estimator.
 * Supports ID3v2 skip + MPEG Layer III CBR frame sampling; rejects VBR/unsupported headers.
 * A full decoder is required before production; this estimator is only a guarded development fallback.
 */
export class Mp3DurationError extends Error{
 constructor(code,message){super(message);this.name="Mp3DurationError";this.code=code;}
}
function skipId3(b){
 if(b.length<10||b[0]!==73||b[1]!==68||b[2]!==51)return 0;
 const s=b.slice(6,10);if(s.some(v=>v&128))throw new Mp3DurationError("BAD_ID3","Invalid ID3 size");
 return 10+((s[0]<<21)|(s[1]<<14)|(s[2]<<7)|s[3]);
}
export function estimateCbrMp3Duration(arrayBuffer){
 if(!(arrayBuffer instanceof ArrayBuffer))throw new Mp3DurationError("INVALID_AUDIO","ArrayBuffer required");
 const b=new Uint8Array(arrayBuffer);let offset=skipId3(b);
 if(b.length-offset<1024)throw new Mp3DurationError("TOO_SHORT","MP3 sample too short");
 const rates={3:[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320],2:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]};
 let frames=0,bitrate=null,sampleRate=null,frameSamples=null;
 while(offset+4<=b.length){
  if(b[offset]!==255||(b[offset+1]&0xe0)!==0xe0)throw new Mp3DurationError("INVALID_FRAME","Unexpected frame header");
  const version=(b[offset+1]>>3)&3,layer=(b[offset+1]>>1)&3;
  if(version===1||layer!==1)throw new Mp3DurationError("UNSUPPORTED_MP3","Only MPEG Layer III supported");
  const bitrateIndex=(b[offset+2]>>4)&15,rateIndex=(b[offset+2]>>2)&3,padding=(b[offset+2]>>1)&1;
  if(bitrateIndex===0||bitrateIndex===15||rateIndex===3)throw new Mp3DurationError("INVALID_FRAME","Invalid bitrate or sample rate");
  const versionKey=version===3?3:2;
  const kbps=rates[versionKey][bitrateIndex];
  const hz=[44100,48000,32000][rateIndex]/(version===3?1:version===2?2:4);
  const samples=version===3?1152:576;
  if(bitrate!==null&&(bitrate!==kbps||sampleRate!==hz))throw new Mp3DurationError("VBR_UNSUPPORTED","Variable bitrate MP3 needs decoder");
  bitrate=kbps;sampleRate=hz;frameSamples=samples;
  const frameSize=Math.floor((version===3?144:72)*kbps*1000/hz)+padding;
  if(offset+frameSize>b.length)throw new Mp3DurationError("TRUNCATED_FRAME","Truncated MP3 frame");
  offset+=frameSize;frames++;
 }
 if(offset!==b.length||frames<3)throw new Mp3DurationError("INVALID_FRAME","Trailing data or too few frames");
 return frames*frameSamples/sampleRate;
}
