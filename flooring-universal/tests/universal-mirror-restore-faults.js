'use strict';
// Run: node flooring-universal/tests/universal-mirror-restore-faults.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','universal-indexeddb.js'),'utf8');
const key='runlu_flooring_universal_orders',old='[{"id":"original"}]';
async function run(label,options={}){
 const store=new Map([[key,old]]),phases=[];let reads=0,writes=0;
 const adapter={rawKeys:()=>[...store.keys()],raw:k=>store.get(k)??null,read:(k,d)=>store.has(k)?JSON.parse(store.get(k)):d,
  remove:k=>store.delete(k),write:(k,v)=>{writes++;if(options.failWrite&&writes===1)throw Error('Injected local write failure');store.set(k,JSON.stringify(v))}};
 const db={objectStoreNames:{contains:()=>true},transaction(){return {objectStore(){return {getAll(){const req={};reads++;const count=reads;
  queueMicrotask(()=>{req.result=[{key,value:[{id:count===1?'mirror':'changed-during-recovery'}]}];req.onsuccess?.()});return req}}}}}};
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result=db;req.onsuccess?.()});return req}};
 const journal={begin:()=>options.badJournal?null:{id:'tx'},phase(_id,phase){phases.push(phase)},commit(){phases.push('COMMITTED')}};
 const window={RUNLUUniversalData:{onMutation(){},backendConfig(){return {mode:'local'}},current(){return adapter}},
  RUNLUUniversalLocalHealth:{capture(){return {id:'checkpoint'}}},RUNLUUniversalCrashJournal:journal};
 const localStorage={setItem(k,v){store.set(k,String(v))}};
 vm.runInNewContext(source,{window,indexedDB,localStorage,setTimeout,console},{filename:'universal-indexeddb.js'});
 await assert.rejects(()=>window.RUNLUUniversalDurableLocal.replaceLocalFromMirror(),
  options.badJournal?/valid transaction/:options.failWrite?/Mirror restore failed; previous local records restored/:/Mirror parity failed; previous local records restored/);
 assert.equal(store.get(key),old,'original local bytes must survive');
 assert(!phases.includes('COMMITTED'),'failed recovery must not commit');
 if(!options.badJournal)assert(phases.includes('LOCAL_ROLLED_BACK'),'verified rollback phase required');
 console.log('PASS '+label);
}
(async()=>{
 await run('mirror changes between read and parity');
 await run('local write interrupted',{failWrite:true});
 await run('journal begin fails before replacement',{badJournal:true});
 console.log('IndexedDB mirror restore fault injection: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
