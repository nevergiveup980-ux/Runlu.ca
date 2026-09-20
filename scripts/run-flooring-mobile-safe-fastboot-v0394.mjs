import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const fastboot=read('flooring/mobile-safe-fastboot-v0403h.js');
const historical=read('flooring/index-v094-fastboot.html');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Safe Fast Boot orchestrator compiles',()=>new Function(fastboot));
test('Safe Core waits only for the tiny Fast Boot orchestrator',()=>{
  assert(v71.includes('mobile-safe-fastboot-v0403h.js?v=0403h'));
  for(const src of [
    'mobile-safe-phase1-v0403b.js?v=0403b',
    'mobile-safe-phase2-v0403c.js?v=0403c',
    'mobile-safe-phase3-v0403d.js?v=0403d',
    'mobile-safe-phase4-v0403e.js?v=0403e',
    'mobile-safe-phase5-v0403f.js?v=0403f'
  ])assert.equal(v71.includes(src),false,src);
});
test('Fast Boot preserves the five V0.3.94 launcher layers before later phases',()=>{
  for(const src of [
    'mobile-safe-phase1-v0403b.js?v=0403b',
    'mobile-safe-phase2-v0403c.js?v=0403c',
    'mobile-safe-phase3-v0403d.js?v=0403d',
    'mobile-safe-phase4-v0403e.js?v=0403e',
    'mobile-safe-phase5-v0403f.js?v=0403f'
  ])assert(fastboot.includes(src),src);
  for(let i=1;i<=5;i++)assert(fastboot.includes(`name:'phase${i}'`));
});
test('Fast Boot never pulls heavy business modules at startup',()=>{
  for(const banned of [
    'pricing-cost-control-v078.js',
    'management-review-v080.js',
    'po-history-v085.js',
    'material-work-sync-v091.js',
    'mixed-order-routing-v091-safe.js',
    'carpet-rc-tracking-v092-safe.js',
    'carpet-line-rc-v093-safe.js',
    'integration-hub-v079r1.js',
    'staff-board-v083.js'
  ])assert.equal(fastboot.includes(banned),false,banned);
  assert(fastboot.includes('heavyBusinessModulesAtStartup:false'));
});
test('Launcher hydration is deferred so Core can reveal first',()=>{
  assert(fastboot.includes("const kick=()=>setTimeout(()=>start().catch(()=>{}),80)"));
  assert(fastboot.includes("state:'scheduled'"));
  assert(fastboot.includes("startup:'core-first-background-launchers'"));
});
test('Background launcher hydration is one-shot and failure-tolerant',()=>{
  assert(fastboot.includes('if(startPromise)return startPromise'));
  assert(fastboot.includes('Promise.allSettled(modules.map(loadOne))'));
  assert(fastboot.includes("report.failed.length?'ready-with-launcher-errors':'ready'"));
});
test('Safe Core keeps the V0.3.94 core-first boot contract through later phases',()=>{
  assert(/n=s\?"mobile-safe-0403[gh]":Date\.now\(\)/.test(v71));
  assert(release.includes("mobileSafe&&v==='core'?'mobile-safe-0403g':Date.now()")||release.includes("mobileSafe&&v==='core'?'mobile-safe-0403h':Date.now()"));
});
test('iPhone production route still bypasses V090 and V078 wrappers',()=>{
  assert(release.includes("mobileSafe?'index-v071-pricing-workspace.html"));
  assert.equal(release.includes("mobileSafe?'index-v094-fastboot.html"),false);
});
test('Desktop full diagnostics still preserve the frozen V090 stack',()=>{
  assert(release.includes("index-v090r1-stable-frozen.html?prod=1&release=090r1"));
  assert(release.includes("const forceFull=qp.get('full')==='1'"));
});
test('Historical V0.3.94 preview remains preserved as an archive/reference',()=>{
  assert(historical.includes("version:'0.3.94'"));
  assert(historical.includes("outer.src='index-v078-business-cost-control.html?v=094'"));
  assert(historical.includes('BACKGROUND ENHANCEMENTS'));
});
test('Frozen Quote production route remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Fast Boot exposes real-device diagnostic status',()=>{
  assert(fastboot.includes('RUNLUMobileSafeFastBootV0394'));
  assert(fastboot.includes("version:VERSION"));
  assert(fastboot.includes("loaded:[...report.loaded]"));
  assert(fastboot.includes("failed:[...report.failed]"));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
