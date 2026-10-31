/**
 * RUNLU MUSIC STUDIO — authenticated MP3 download helper.
 * Integration pending: private R2 binding, server-derived identity, deployed Worker.
 */
const json=(data,status)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const validId=v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
const mp3Prefix=bytes=>bytes.length>=3&&bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33 ||
 bytes.length>=2&&bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
export function sanitizeFilename(title){
 const cleaned=String(title||"track").replace(/[\\/\x00-\x1f\x7f<>:"|?*]/g,"").replace(/\s+/g," ").trim().slice(0,100);
 return (cleaned||"track")+".mp3";
}
export async function downloadOwnedTrack({db,bucket,ownerId,trackId}){
 if(!db?.prepare||!bucket?.get)return json({error:"STORAGE_NOT_CONFIGURED"},503);
 if(!validId(ownerId)||!validId(trackId))return json({error:"INVALID_TRACK"},400);
 // ownerId MUST come from verified server-side session, never request body/query.
 const track=await db.prepare("SELECT id,title,format,storage_key,byte_length FROM music_tracks WHERE id=? AND owner_id=?")
  .bind(trackId,ownerId).first();
 if(!track)return json({error:"NOT_FOUND"},404);
 if(track.format!=="mp3"||!track.storage_key||!Number.isSafeInteger(track.byte_length)||track.byte_length<=0)
  return json({error:"INVALID_TRACK_METADATA"},500);
 const object=await bucket.get(track.storage_key);
 if(!object)return json({error:"ASSET_MISSING"},404);
 if(object.size!==track.byte_length)return json({error:"ASSET_SIZE_MISMATCH"},500);
 const buffer=await object.arrayBuffer();
 const bytes=new Uint8Array(buffer);
 if(!mp3Prefix(bytes))return json({error:"NOT_MP3"},422);
 const filename=sanitizeFilename(track.title);
 // RFC 5987 encoding prevents header injection and supports Chinese filenames.
 return new Response(buffer,{status:200,headers:{
  "content-type":"audio/mpeg",
  "content-length":String(bytes.byteLength),
  "content-disposition":"attachment; filename=\"runlu-track.mp3\"; filename*=UTF-8''"+encodeURIComponent(filename),
  "cache-control":"private, no-store",
  "x-content-type-options":"nosniff"
 }});
}
