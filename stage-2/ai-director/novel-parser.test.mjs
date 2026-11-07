import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNovelTxt,NOVEL_MAX_BYTES} from './novel-parser.mjs';
const encode=s=>new TextEncoder().encode(s);
test('English chapters retain original text and line positions',()=>{
 const v=parseNovelTxt({filename:'novel.txt',bytes:encode('Chapter 1\nThe door opened.\n\nChapter 2: The Glass\nShe answered.')});
 assert.equal(v.chapterCount,2);assert.equal(v.chapters[0].startLine,1);
 assert.equal(v.chapters[1].title,'Chapter 2: The Glass');
 assert.equal(v.chapters[1].text,'She answered.');
});
test('Chinese chapter headers and CRLF supported',()=>{
 const v=parseNovelTxt({filename:'book.TXT',bytes:encode('第一章 初见\r\n你好\r\n第二章\r\n再见')});
 assert.equal(v.chapterCount,2);
});
test('plain text without headers becomes opening chapter',()=>{
 assert.equal(parseNovelTxt({filename:'a.txt',bytes:encode('A short story.')}).chapters[0].title,'Opening');
});
test('reject binary, invalid encoding, oversize, and unsupported formats',()=>{
 for(const [filename,bytes] of [['a.epub',encode('Chapter 1')],['a.txt',new Uint8Array([0xff])],['a.txt',encode('hi\0there')],['a.txt',new Uint8Array(NOVEL_MAX_BYTES+1)]])
  assert.throws(()=>parseNovelTxt({filename,bytes}));
});
