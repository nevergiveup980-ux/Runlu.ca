'use strict';
// Run with: node flooring-universal/tests/universal-indexeddb-open-retry.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','universal-indexeddb.js'),'utf8');
let attempts=0,closed=0;
const db={
 objectStoreNames:{contains:()=>true},
 close(){closed++},
 transaction(){return {objectStore(){return {getAll(){const req={};queueMicrotask(()=>{req.result=[];req.onsuccess?.()});return req}}}}}
};
const indexedDB={open(){attempts++;const attempt=attempts,req={};queueMicrotask(()=>{if(attempt===1){req.error=new Error('transient IndexedDB open failure');req.onerror?.()}else{req.result=db;req.onsuccess?.()}});return req}};
const window={RUNLUUniversalData:{onMutation(){},backendConfig(){return {mode:'local'}},current(){return {rawKeys(){return []}}}}};
vm.runInNewContext(source,{window,indexedDB,setTimeout,clearTimeout,console},{filename:'universal-indexeddb.js'});
(async()=>{
 const first=await window.RUNLUUniversalDurableLocal.status();
 assert.equal(first.ready,false);assert.match(first.error,/transient IndexedDB/);
 const second=await window.RUNLUUniversalDurableLocal.status();
 assert.equal(second.ready,true);assert.equal(second.error,null);assert.equal(attempts,2);
 db.onversionchange();
 assert.equal(closed,1);
 const third=await window.RUNLUUniversalDurableLocal.status();
 assert.equal(third.ready,true);assert.equal(attempts,3);
 console.log('IndexedDB open retry and versionchange: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
