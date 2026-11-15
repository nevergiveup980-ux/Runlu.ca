import test from 'node:test';
import assert from 'node:assert/strict';
import {filename} from './library.mjs';
test('song names preserve Unicode and remove path and header control characters',()=>{
 assert.equal(filename('夜色 / Love\r\n','V2'),'夜色 - Love---V2.mp3');
 assert.equal(filename('When the Lights Go Down','V1'),'When the Lights Go Down-V1.mp3');
});
test('saved audio remains readable across legacy Blob and Safari ArrayBuffer records',async()=>{
 const {storedAudioBlob}=await import('./library.mjs');
 const bytes=new Uint8Array([73,68,51,1,2,3]);
 const legacy=new Blob([bytes],{type:'audio/mpeg'});
 assert.deepEqual(new Uint8Array(await storedAudioBlob(legacy).arrayBuffer()),bytes);
 assert.deepEqual(new Uint8Array(await storedAudioBlob(bytes.buffer).arrayBuffer()),bytes);
 assert.equal(storedAudioBlob(bytes.buffer).type,'audio/mpeg');
 assert.throws(()=>storedAudioBlob(undefined),/歌曲文件不可用/);
});
