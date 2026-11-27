// Authenticated private-video delivery. No provider URL or raw storage key
// is returned to the browser. Both asset lookup and ownership are server-side.
export function createStageVideoDelivery({findAsset,createSignedReadUrl,ttlSeconds=120}) {
 if(typeof findAsset!=='function'||typeof createSignedReadUrl!=='function'||
    !Number.isSafeInteger(ttlSeconds)||ttlSeconds<30||ttlSeconds>300)
  throw Error('Invalid delivery dependencies');
 return {async getPlayback({userId,jobId}) {
  if(typeof userId!=='string'||!userId||typeof jobId!=='string'||!jobId)
   throw Error('Authenticated user and job required');
  const asset=await findAsset({jobId,userId});
  // Repository MUST filter by both job ID and authenticated owner ID.
  if(!asset||asset.ownerId!==userId||asset.jobId!==jobId||asset.state!=='VERIFIED'||
     typeof asset.storageKey!=='string'||!asset.storageKey)
   return {state:'NOT_FOUND'};
  const signed=await createSignedReadUrl({storageKey:asset.storageKey,ttlSeconds});
  let url;
  try{url=new URL(signed)}catch{throw Error('Invalid signed storage URL')}
  if(url.protocol!=='https:'||url.username||url.password||url.port)
   throw Error('Invalid signed storage URL');
  return {state:'READY',playbackUrl:url.href,expiresInSeconds:ttlSeconds,contentType:'video/mp4'};
 }};
}
