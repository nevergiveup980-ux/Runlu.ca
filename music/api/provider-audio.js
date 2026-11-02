/**
 * RUNLU MUSIC STUDIO — provider audio response validator.
 * Signature checks are not full decoding; production needs an audio decoder and measured duration.
 */
import {MusicProviderError} from "./provider-contract.js";
const MAX_BYTES=25*1024*1024;
export function decodeProviderMp3({audioBase64,mimeType}){
 if(mimeType!=="audio/mpeg"&&mimeType!=="audio/mp3")
  throw new MusicProviderError("UNSUPPORTED_AUDIO","Provider did not return MP3");
 if(typeof audioBase64!=="string"||!audioBase64.length||audioBase64.length>Math.ceil(MAX_BYTES*4/3)+8||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(audioBase64)||audioBase64.length%4!==0)
  throw new MusicProviderError("INVALID_AUDIO_DATA","Invalid base64 audio");
 let binary;
 try{binary=atob(audioBase64);}catch{throw new MusicProviderError("INVALID_AUDIO_DATA","Could not decode audio");}
 if(binary.length<128||binary.length>MAX_BYTES)throw new MusicProviderError("INVALID_AUDIO_SIZE","Audio size outside accepted range");
 const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 const isID3=bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33;
 const isFrame=bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
 if(!isID3&&!isFrame)throw new MusicProviderError("INVALID_MP3_SIGNATURE","MP3 header not found");
 return bytes.buffer;
}
