import test from "node:test";
import assert from "node:assert/strict";
import {decodeProviderMp3} from "../provider-audio.js";
const valid=()=>{const b=new Uint8Array(256);b.set([0x49,0x44,0x33,0x04]);return Buffer.from(b).toString("base64");};
test("decodes provider MP3 bytes",()=>{
 const b=decodeProviderMp3({audioBase64:valid(),mimeType:"audio/mpeg"});
 assert.equal(b.byteLength,256);assert.equal(new Uint8Array(b)[0],0x49);
});
test("rejects non-MP3 mime type",()=>assert.throws(()=>decodeProviderMp3({audioBase64:valid(),mimeType:"audio/wav"}),{code:"UNSUPPORTED_AUDIO"}));
test("rejects malformed base64",()=>assert.throws(()=>decodeProviderMp3({audioBase64:"@@@@",mimeType:"audio/mpeg"}),{code:"INVALID_AUDIO_DATA"}));
test("rejects spoofed MP3 with invalid header",()=>{
 const b=Buffer.alloc(256).toString("base64");
 assert.throws(()=>decodeProviderMp3({audioBase64:b,mimeType:"audio/mpeg"}),{code:"INVALID_MP3_SIGNATURE"});
});
test("rejects truncated MP3",()=>{
 const b=Buffer.from([0x49,0x44,0x33,0x04]).toString("base64");
 assert.throws(()=>decodeProviderMp3({audioBase64:b,mimeType:"audio/mpeg"}),{code:"INVALID_AUDIO_SIZE"});
});
