'use strict';
// Run with: node flooring-universal/tests/universal-backup-fault-injection.js
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const prefix='runlu_flooring_universal_',a=prefix+'u0_workspace',c=prefix+'orders';
async function scenario(label,failAt,expectRollback,options={}){
 const store=new Map([[a,JSON.stringify({company:{organizationId:'org-old'}})],[c,JSON.stringify([{id:'old'}])]]);
 const original=new Map(store);let writes=0;
 const storage={
  setItem(k,v){writes++;if(writes===failAt||(options.failRollback&&writes>=failAt))throw new Error('Injected QuotaExceededError');store.set(k,String(v))},
  getItem:k=>store.get(k)??null,
  removeItem:k=>store.delete(k),
  key:i=>[...store.keys()][i]??null,
  get length(){return store.size}
 };
 const adapter={
  id:'local',rawKeys:()=>[...store.keys()],raw:k=>storage.getItem(k),
  read:(k,d)=>{const v=storage.getItem(k);return v===null?d:JSON.parse(v)},
  write:(k,v)=>storage.setItem(k,JSON.stringify(v)),remove:k=>storage.removeItem(k)
 };
 const journal={phases:[],begin:()=>({id:'tx-1'}),phase(_id,p){this.phases.push(p)},commit(){this.phases.push('COMMITTED')}};
 const data={current:()=>adapter,backendConfig:()=>({mode:'local'})};
 const window={RUNLUUniversalData:data,RUNLUUniversalLocalHealth:{capture:()=>({id:'verified'})},RUNLUUniversalCrashJournal:journal,
  RUNLUUniversalDurableLocal:{replaceMirrorFromLocal:async()=>{if(options.mirrorThrows)throw new Error('Injected IndexedDB transaction failure');return options.mirrorFailure?{ok:false,comparison:{ok:false}}:{ok:true,comparison:{ok:true}}}}};
 const ctx={window,localStorage:storage,Blob,URL,document:{},setTimeout};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','universal-backup.js'),'utf8'),ctx,{filename:'universal-backup.js'});
 const incoming={format:'runlu-flooring-universal-backup',version:1,schemaVersion:0,data:{[a]:{company:{organizationId:'org-new'}},[c]:[{id:'new'}]}};
 if(options.mirrorMissing)delete window.RUNLUUniversalDurableLocal;
 if(failAt===null&&!options.mirrorFailure&&!options.mirrorMissing&&!options.mirrorThrows){
  const result=await window.RUNLUUniversalBackup.restore(incoming);
  assert.equal(result.restoredKeys,2);assert.equal(adapter.read(c,[])[0].id,'new');
  assert(journal.phases.includes('COMMITTED'));
 }else{
  await assert.rejects(()=>window.RUNLUUniversalBackup.restore(incoming),options.mirrorFailure||options.mirrorMissing?/verified durable mirror reconciliation/:options.mirrorThrows?/Injected IndexedDB transaction failure/:/Backup restore failed/);
  if(expectRollback){
   assert.deepEqual([...store].sort(),[...original].sort(),label+' must preserve byte-for-byte original records');
   assert(journal.phases.includes('LOCAL_ROLLED_BACK'));
  }
  assert(!journal.phases.includes('COMMITTED'),'failed restore must not commit');
 }
 console.log('PASS '+label);
}
(async()=>{
 await scenario('normal backup restore',null,false);
 await scenario('first write fails, rollback verified',1,true);
 await scenario('second write fails, rollback verified',2,true);
 await scenario('rollback write fails, must not commit',1,false,{failRollback:true});
 await scenario('mirror parity failure, must not commit',null,false,{mirrorFailure:true});
 await scenario('mirror module missing, must not commit',null,false,{mirrorMissing:true});
 await scenario('mirror transaction rejects, must not commit',null,false,{mirrorThrows:true});
 console.log('Backup fault injection: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
