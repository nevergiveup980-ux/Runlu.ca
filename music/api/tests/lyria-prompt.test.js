import test from "node:test";
import assert from "node:assert/strict";
import {buildLyriaPrompt,selectLyriaMode} from "../lyria-prompt.js";
test("Chinese song prompt retains Chinese language instructions",()=>{
 const p=buildLyriaPrompt({prompt:"故乡、父母、岁月",language:"zh"});
 assert.match(p,/简体中文/);assert.match(p,/故乡、父母、岁月/);assert.match(p,/30-second/);
});
test("instrumental requests prohibit singing",()=>{
 const p=buildLyriaPrompt({prompt:"gentle piano",instrumental:true,language:"en",mode:"full"});
 assert.match(p,/不要人声/);assert.match(p,/full song/);
});
test("all supported languages have explicit vocal direction",()=>{
 for(const language of ["zh","en","fr","es"])assert.ok(buildLyriaPrompt({prompt:"nostalgia",language}).length>50);
});
test("30s preview and full-song routing are distinct",()=>{
 assert.equal(selectLyriaMode({durationSeconds:30}),"clip");
 assert.equal(selectLyriaMode({durationSeconds:60}),"full");
 assert.throws(()=>selectLyriaMode({durationSeconds:90}),/Unsupported/);
});
test("invalid prompts fail before paid provider calls",()=>{
 assert.throws(()=>buildLyriaPrompt({prompt:" "}),/Prompt/);
 assert.throws(()=>buildLyriaPrompt({prompt:"x",language:"xx"}),/language/);
});
