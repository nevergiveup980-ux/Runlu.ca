/**
 * RUNLU MUSIC STUDIO — private MP3 ingest service.
 * Integration pending: authenticated job owner, real provider, D1 and private R2.
 * File signature checks are preliminary; production must additionally decode/scan audio.
 */
export class TrackIngestError extends Error{
 constructor(code,message){super(message);this.name="TrackIngestError";this.code=code;}
}
const validId=s=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(s);
const validSha=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
function looksLikeMp3(bytes){
 return bytes.length>=3&&bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33 ||
 bytes.length>=2&&bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
}
export async function ingestMp3({db,bucket,ownerId,trackId,title,audio,now,durationSeconds,rightsMetadata={}}){
 if(!db?.prepare||!bucket?.put||!bucket?.delete)throw new TrackIngestError("STORAGE_NOT_CONFIGURED","D1 and R2 required");
 if(!validId(ownerId)||!validId(trackId)||typeof title!=="string"||!title.trim()||title.length>200||!Number.isSafeInteger(now)||now<0||!Number.isFinite(durationSeconds)||durationSeconds<=0)
  throw new TrackIngestError("INVALID_INPUT","Invalid track metadata");
 if(!(audio instanceof ArrayBuffer)||audio.byteLength<128||audio.byteLength>25*1024*1024)
  throw new TrackIngestError("INVALID_AUDIO","Audio must be 128 bytes to 25 MB");
 const bytes=new Uint8Array(audio);
 if(!looksLikeMp3(bytes))throw new TrackIngestError("NOT_MP3","MP3 signature not found");
 if(!globalThis.crypto?.subtle)throw new TrackIngestError("CRYPTO_UNAVAILABLE","SHA-256 unavailable");
 const digest=await crypto.subtle.digest("SHA-256",audio);
 const sha256Hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 if(!validSha(sha256Hex))throw new TrackIngestError("HASH_FAILED","Invalid SHA-256");
 const storageKey="music/"+ownerId+"/"+trackId+".mp3";
 // Store privately before metadata commit. If D1 write fails, attempt to clean up orphaned R2 object.
 await bucket.put(storageKey,audio,{httpMetadata:{contentType:"audio/mpeg"},customMetadata:{sha256:sha256Hex}});
 try{
  await db.prepare("INSERT INTO music_tracks (id,owner_id,title,duration_seconds,format,storage_key,byte_length,sha256_hex,rights_metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
   .bind(trackId,ownerId,title.trim(),durationSeconds,"mp3",storageKey,audio.byteLength,sha256Hex,JSON.stringify(rightsMetadata),now).run();
 }catch(error){
  try{await bucket.delete(storageKey);}catch{throw new TrackIngestError("CLEANUP_FAILED","Database failed; orphaned storage object may remain");}
  throw new TrackIngestError("DB_WRITE_FAILED","Track metadata could not be persisted");
 }
 return Object.freeze({id:trackId,storageKey,byteLength:audio.byteLength,sha256Hex});
}
