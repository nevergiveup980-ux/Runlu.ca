// Server-only Supabase Storage adapter for RUNLU STAGE private videos.
// Configure a PRIVATE bucket and keep service-role credentials off the client.
export function createStageSupabaseStorage({client,bucket}) {
 if(typeof bucket!=='string'||!/^[a-z0-9][a-z0-9-]{1,62}$/.test(bucket)||
    typeof client?.storage?.from!=='function')throw Error('Invalid Supabase storage configuration');
 const storage=client.storage.from(bucket);
 if(typeof storage?.upload!=='function'||typeof storage?.createSignedUrl!=='function')
  throw Error('Supabase storage methods required');
 return {
  async putObject({bucket:target,key,body,contentType,private:isPrivate}) {
   if(target!==bucket||isPrivate!==true||contentType!=='video/mp4'||
      !Buffer.isBuffer(body)||!/^stage-videos\/[-_a-zA-Z0-9]{1,128}\/[a-f0-9]{64}\.mp4$/.test(key))
    throw Error('Invalid private video upload');
   const {data,error}=await storage.upload(key,body,{contentType:'video/mp4',upsert:false,cacheControl:'private, no-store'});
   if(error)throw Error('Private video upload failed',{cause:error});
   if(data?.path!==key)throw Error('Storage upload confirmation mismatch');
   return {key};
  },
  async createSignedReadUrl({storageKey,ttlSeconds}) {
   if(typeof storageKey!=='string'||!/^stage-videos\/[-_a-zA-Z0-9]{1,128}\/[a-f0-9]{64}\.mp4$/.test(storageKey)||
      !Number.isSafeInteger(ttlSeconds)||ttlSeconds<30||ttlSeconds>300)
    throw Error('Invalid private video signing request');
   const {data,error}=await storage.createSignedUrl(storageKey,ttlSeconds);
   if(error||typeof data?.signedUrl!=='string')throw Error('Private video signing failed',{cause:error});
   return data.signedUrl;
  }
 };
}
