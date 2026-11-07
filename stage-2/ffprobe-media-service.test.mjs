import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifiedVideoMedia} from './ffprobe-media-service.mjs';
const bytes=Buffer.alloc(32);bytes.write('ftyp',4);
test('passes verified bytes to private storage caller',async()=>{
 const media=createVerifiedVideoMedia({downloader:{download:async()=>bytes},probe:async()=>({duration:5,streams:[{codec_type:'video',codec_name:'h264',width:1280,height:720}]})});
 const r=await media.fetchAndVerify('https://example.org/a.mp4');
 assert.equal(r.valid,true);assert.deepEqual(r.bytes,bytes);
});
test('rejects unrecognized media',async()=>{
 const media=createVerifiedVideoMedia({downloader:{download:async()=>Buffer.alloc(32)},probe:async()=>({duration:5,streams:[]})});
 await assert.rejects(media.fetchAndVerify('https://example.org/a'),/signature/);
});
test('requires downloader',()=>assert.throws(()=>createVerifiedVideoMedia({}),/dependencies/));
