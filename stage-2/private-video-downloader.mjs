// Private server-side worker: provider URLs must be host-allowlisted.
export function createPrivateVideoDownloader({fetchImpl=fetch,allowedHosts,maxBytes=100_000_000,timeoutMs=30_000}) {
 if(typeof fetchImpl!=='function'||!Array.isArray(allowedHosts)||!allowedHosts.length||
    !allowedHosts.every(x=>typeof x==='string'&&x.length>0)||
    !Number.isSafeInteger(maxBytes)||maxBytes<16||
    !Number.isSafeInteger(timeoutMs)||timeoutMs<1)throw Error('Invalid downloader configuration');
 const hosts=new Set(allowedHosts);
 return {async download(url){
  let parsed;
  try{parsed=new URL(url)}catch{throw Error('Invalid provider URL')}
  if(parsed.protocol!=='https:'||!hosts.has(parsed.hostname)||parsed.username||parsed.password||parsed.port)
   throw Error('Provider URL not allowed');
  const response=await fetchImpl(parsed.href,{redirect:'error',signal:AbortSignal.timeout(timeoutMs),headers:{accept:'video/mp4'}});
  if(!response.ok)throw Error('Provider download failed');
  const declared=response.headers.get('content-length');
  if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw Error('Video size limit exceeded');
  if(!response.body)throw Error('Missing video body');
  const reader=response.body.getReader(),chunks=[];let total=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
   if(total>maxBytes)throw Error('Video size limit exceeded');chunks.push(value);}}
  finally{await reader.cancel().catch(()=>{});}
  if(total<16)throw Error('Video body too small');
  return Buffer.concat(chunks,total);
 }};
}
