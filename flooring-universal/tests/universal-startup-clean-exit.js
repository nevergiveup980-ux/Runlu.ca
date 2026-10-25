'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','universal-startup-guard.js'),'utf8');
async function scenario(label,active,expectedOpen){
 let state={sessionId:'test',sessionOpen:true};
 const data={read(){return state},write(_key,value){state=value;return value},current(){return {raw(){return '{\"active\":[],\"history\":[]}'}}}};
 const window={RUNLUUniversalData:data,addEventListener(){},RUNLUUniversalLocalHealth:{health:async()=>({})}};
 if(active!==null)window.RUNLUUniversalCrashJournal={inspect(){return {active}}};
 vm.runInNewContext(source,{window,document:{getElementById(){return null}},setTimeout,console});
 window.RUNLUUniversalStartupGuard.markClean('pagehide');
 assert.equal(state.sessionOpen,expectedOpen,label);
 console.log('PASS '+label);
}

async function checkJournalCountMismatch(){
 let state={sessionOpen:false};
 const transactions=[0,1].map(i=>({id:'tx-'+i,type:'Recovery',action:'restore',startedAt:'2026-10-25T00:00:00Z'}));
 const data={read(key){return key.endsWith('_workspace')?{company:{organizationId:'test'}}:state},
  write(_key,value){state=value;return value},
  current(){return {raw(){return JSON.stringify({active:transactions,history:[]})}}}};
 const window={RUNLUUniversalData:data,addEventListener(){},
  RUNLUUniversalCrashJournal:{inspect(){return {active:0,pending:[]}}},
  RUNLUUniversalLocalHealth:{health:async()=>({corruptKeys:[]})},
  RUNLUUniversalDurableLocal:{status:async()=>({ready:true}),compareWithAdapter:async()=>({ok:true})}};
 vm.runInNewContext(source,{window,document:{getElementById(){return null}},setTimeout,console});
 const result=await window.RUNLUUniversalStartupGuard.ready();
 assert.equal(result.blocked,true);
 assert(result.issues.some(x=>x.code==='RECOVERY_JOURNAL_MISMATCH'));
 console.log('PASS stored journal transactions disagree with reported active count');
}

async function checkStartupJournal(mode){
 let state={sessionOpen:false};
 const workspace={company:{organizationId:'test'}};
 const data={read(key){return key.endsWith('_workspace')?workspace:state},write(_key,value){state=value;return value},current(){return {raw(){return mode==='corrupt'?'not-json':mode==='invalid'?'{}':mode==='brokenTx'?JSON.stringify({active:[{id:'tx1'}],history:[]}):null}}}};
 const window={RUNLUUniversalData:data,addEventListener(){},RUNLUUniversalLocalHealth:{health:async()=>({corruptKeys:[]})},
  RUNLUUniversalDurableLocal:{status:async()=>({ready:true}),compareWithAdapter:async()=>({ok:true})}};
 if(mode!=='missing')window.RUNLUUniversalCrashJournal={inspect(){if(mode==='throws')throw Error('unavailable');return {active:mode==='active'?1:0,pending:[]}}};
 vm.runInNewContext(source,{window,document:{getElementById(){return null}},setTimeout,console});
 const result=await window.RUNLUUniversalStartupGuard.ready();
 assert.equal(result.blocked,mode!=='clear');
 if(['missing','throws','corrupt','invalid','brokenTx'].includes(mode))assert(result.issues.some(x=>x.code==='RECOVERY_JOURNAL_UNAVAILABLE'));
 if(mode==='active')assert(result.issues.some(x=>x.code==='INCOMPLETE_BUSINESS_OPERATION'));
 console.log('PASS startup journal '+mode);
}

(async()=>{
 await scenario('pending journal keeps session open',2,true);
 await scenario('empty journal allows clean exit',0,false);
 await scenario('missing journal keeps session open',null,true);
 for(const mode of ['missing','throws','active','clear','corrupt','invalid','brokenTx'])await checkStartupJournal(mode);
 await checkJournalCountMismatch();
 console.log('Startup clean exit and journal inspection: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
