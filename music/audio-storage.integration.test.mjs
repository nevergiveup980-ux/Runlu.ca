import test from "node:test";
import assert from "node:assert/strict";
import {getMusicAudioAccess} from "./audio-access.mjs";
import {createPrivateMusicStorage,MUSIC_BUCKET,musicObjectKey} from "./private-storage.mjs";

const owner="12345678-1234-1234-1234-123456789abc";
const stranger="87654321-4321-4321-4321-cba987654321";
const id="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const path=musicObjectKey(owner,id);

function harness({status="completed",objectKey=path,stored=true,signError=false}={}){
 const calls=[];
 const supabase={storage:{from(bucket){
   assert.equal(bucket,MUSIC_BUCKET);
   return {createSignedUrl:async(...args)=>{
     calls.push(args);
     return signError?{data:null,error:{message:"unavailable"}}:
       {data:{signedUrl:"https://example.test/private?token=short-lived"},error:null};
   }};
 }}};
 const storage=createPrivateMusicStorage({supabase});
 const store={get:async jobId=>jobId===id?{
   id,userId:owner,status,objectKey,audioStored:stored
 }:null};
 return {storage,store,calls};
}
test("actual private storage adapter signs owner path with 60s expiry",async()=>{
 const h=harness();
 const result=await getMusicAudioAccess({authenticatedUserId:owner,jobId:id,...h});
 assert.match(result.url,/^https:/);
 assert.equal(result.expires_in,60);
 assert.deepEqual(h.calls,[[path,60,{download:"runlu-music-"+id+".mp3"}]]);
 assert.equal(Object.hasOwn(result,"objectKey"),false);
});
test("stranger and missing job cannot reach Supabase signer",async()=>{
 const h=harness();
 await assert.rejects(getMusicAudioAccess({authenticatedUserId:stranger,jobId:id,...h}),/NOT_FOUND/);
 await assert.rejects(getMusicAudioAccess({authenticatedUserId:owner,jobId:stranger,...h}),/NOT_FOUND/);
 assert.equal(h.calls.length,0);
});
test("forged object path rejected before signing",async()=>{
 const h=harness({objectKey:musicObjectKey(stranger,id)});
 await assert.rejects(getMusicAudioAccess({authenticatedUserId:owner,jobId:id,...h}),/STORAGE_OWNERSHIP_MISMATCH/);
 assert.equal(h.calls.length,0);
});
test("incomplete, missing audio, or provider error never returns URL",async()=>{
 for(const options of [{status:"needs_review"},{stored:false},{objectKey:""},{signError:true}]){
  const h=harness(options);
  await assert.rejects(getMusicAudioAccess({authenticatedUserId:owner,jobId:id,...h}));
  if(!options.signError)assert.equal(h.calls.length,0);
 }
});
