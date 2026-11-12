import test from 'node:test';
import assert from 'node:assert/strict';
import {filename} from './library.mjs';
test('song names preserve Unicode and remove path and header control characters',()=>{
 assert.equal(filename('夜色 / Love\r\n','V2'),'夜色 - Love---V2.mp3');
 assert.equal(filename('When the Lights Go Down','V1'),'When the Lights Go Down-V1.mp3');
});
