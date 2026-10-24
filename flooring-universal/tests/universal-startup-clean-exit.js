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
(async()=>{
 await scenario('pending journal keeps session open',2,true);
 await scenario('empty journal allows clean exit',0,false);
 await scenario('missing journal keeps session open',null,true);
 console.log('Startup clean exit: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
