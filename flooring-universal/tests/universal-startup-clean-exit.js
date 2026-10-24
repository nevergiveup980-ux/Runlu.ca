'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','universal-startup-guard.js'),'utf8');
async function scenario(label,active,expectedOpen){
 let state={sessionId:'test',sessionOpen:true};
 const data={read(){return state},write(_key,value){state=value;return value}};
 const window={RUNLUUniversalData:data,addEventListener(){},RUNLUUniversalLocalHealth:{health:async()=>({})}};
 if(active!==null)window.RUNLUUniversalCrashJournal={inspect(){return {active}}};
 vm.runInNewContext(source,{window,document:{getElementById(){return null}},setTimeout,console});
 window.RUNLUUniversalStartupGuard.markClean('pagehide');
 assert.equal(state.sessionOpen,expectedOpen,label);
 console.log('PASS '+label);
}

async function checkStartupJournal(mode){
 let state={sessionOpen:false};
 const workspace={company:{organizationId:'test'}};
 const data={read(key){return key.endsWith('_workspace')?workspace:state},write(_key,value){state=value;return value}};
 const window={RUNLUUniversalData:data,addEventListener(){},RUNLUUniversalLocalHealth:{health:async()=>({corruptKeys:[]})},
  RUNLUUniversalDurableLocal:{status:async()=>({ready:true}),compareWithAdapter:async()=>({ok:true})}};
 if(mode!=='missing')window.RUNLUUniversalCrashJournal={inspect(){if(mode==='throws')throw Error('unavailable');return {active:mode==='active'?1:0,pending:[]}}};
 vm.runInNewContext(source,{window,document:{getElementById(){return null}},setTimeout,console});
 const result=await window.RUNLUUniversalStartupGuard.ready();
 assert.equal(result.blocked,mode!=='clear');
 if(mode==='missing'||mode==='throws')assert(result.issues.some(x=>x.code==='RECOVERY_JOURNAL_UNAVAILABLE'));
 if(mode==='active')assert(result.issues.some(x=>x.code==='INCOMPLETE_BUSINESS_OPERATION'));
 console.log('PASS startup journal '+mode);
}

(async()=>{
 await scenario('pending journal keeps session open',2,true);
 await scenario('empty journal allows clean exit',0,false);
 await scenario('missing journal keeps session open',null,true);
 for(const mode of ['missing','throws','active','clear'])await checkStartupJournal(mode);
 console.log('Startup clean exit and journal inspection: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
