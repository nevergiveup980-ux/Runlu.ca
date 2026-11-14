import {createHash} from 'node:crypto';

// Internal object-storage adapter. Inject a server-side client that writes to a
// private bucket and refuses public ACLs. Never expose storage keys as URLs.
export function createPrivateMp4Storage({putObject,bucket,prefix='stage-videos'}) {
 if(typeof putObject!=='function'||typeof bucket!=='string'||!bucket.trim()||
    !/^[a-z0-9][a-z0-9-]*$/.test(prefix))throw Error('Private storage configuration required');
 return {async savePrivate({taskId,verified}) {
  if(typeof taskId!=='string'||!/^[-_a-zA-Z0-9]{1,128}$/.test(taskId))throw Error('Invalid task ID');
  const bytes=verified?.bytes;
  if(!Buffer.isBuffer(bytes)||bytes.length<16||verified?.valid!==true||verified?.format!=='mp4')
   throw Error('Verified MP4 bytes required');
  const sha256=createHash('sha256').update(bytes).digest('hex');
  const storageKey=`${prefix}/${taskId}/${sha256}.mp4`;
  await putObject({bucket,key:storageKey,body:bytes,contentType:'video/mp4',metadata:{sha256},private:true});
  return {storageKey,sha256,sizeBytes:bytes.length};
 }};
}
