// RUNLU STAGE — validate downloaded media before private storage.
// Probe is an injected server-side ffprobe implementation; no shell invocation here.
export async function verifyMp4({bytes,probe,maxBytes=100_000_000,maxSeconds=60}) {
 if(!Buffer.isBuffer(bytes)||bytes.length<16||bytes.length>maxBytes)throw Error('Invalid video size');
 if(bytes.toString('ascii',4,8)!=='ftyp')throw Error('MP4 signature missing');
 if(typeof probe!=='function')throw Error('Media probe required');
 const info=await probe(bytes);
 const duration=Number(info?.duration);
 const videoStreams=Array.isArray(info?.streams)?info.streams.filter(s=>s.codec_type==='video'):[];
 if(!Number.isFinite(duration)||duration<=0||duration>maxSeconds||
    videoStreams.length!==1||!Number.isInteger(videoStreams[0].width)||
    !Number.isInteger(videoStreams[0].height)||videoStreams[0].width<64||
    videoStreams[0].height<64||!['h264','hevc','av1'].includes(videoStreams[0].codec_name))
   throw Error('MP4 media validation failed');
 return {valid:true,format:'mp4',durationSeconds:duration,width:videoStreams[0].width,height:videoStreams[0].height,codec:videoStreams[0].codec_name};
}
