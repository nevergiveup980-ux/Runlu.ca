// RUNLU MUSIC: private audio storage adapter. Server/worker only.
// The injected bucket must be private; do not expose the service-role key.
export const MUSIC_BUCKET="runlu-music-private";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function musicObjectKey(userId,jobId){
  if(!UUID.test(userId)||!UUID.test(jobId))throw Error("INVALID_STORAGE_ID");
  return userId+"/"+jobId+".mp3";
}
export function createPrivateMusicStorage({supabase,bucket=MUSIC_BUCKET}){
  if(!supabase?.storage?.from)throw Error("STORAGE_CLIENT_REQUIRED");
  if(bucket!==MUSIC_BUCKET)throw Error("UNEXPECTED_BUCKET");
  const storage=supabase.storage.from(bucket);
  return Object.freeze({
    async savePrivate({userId,jobId,bytes,contentType}){
      const path=musicObjectKey(userId,jobId);
      if(contentType!=="audio/mpeg"||!(bytes instanceof Uint8Array)||bytes.length<4
        ||bytes.length>50*1024*1024)throw Error("INVALID_AUDIO");
      // ID3 header or MPEG audio sync; validation of complete playable MP3
      // should also occur before publishing a completed job.
      const id3=bytes[0]===73&&bytes[1]===68&&bytes[2]===51;
      const frame=bytes[0]===255&&(bytes[1]&0xe0)===0xe0;
      if(!id3&&!frame)throw Error("INVALID_MP3_HEADER");
      const {error}=await storage.upload(path,bytes,{contentType:"audio/mpeg",upsert:false,cacheControl:"private, max-age=0"});
      if(error)throw Error("PRIVATE_UPLOAD_FAILED");
      return path;
    },
    async createDownload({userId,jobId,storedPath,expiresIn=120}){
      const expected=musicObjectKey(userId,jobId);
      if(storedPath!==expected)throw Error("STORAGE_OWNERSHIP_MISMATCH");
      if(!Number.isInteger(expiresIn)||expiresIn<30||expiresIn>300)throw Error("INVALID_EXPIRY");
      const {data,error}=await storage.createSignedUrl(expected,expiresIn,{download:"runlu-music-"+jobId+".mp3"});
      if(error||!data?.signedUrl)throw Error("DOWNLOAD_UNAVAILABLE");
      return data.signedUrl;
    }
  });
}
