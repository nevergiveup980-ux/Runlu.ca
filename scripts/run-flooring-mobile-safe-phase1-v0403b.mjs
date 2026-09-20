import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const router=read('flooring/mobile-safe-phase1-v0403b.js');
const fastboot=read('flooring/mobile-safe-fastboot-v0403h.js');
const pricing=read('flooring/pricing-cost-control-v078.js');
const management=read('flooring/management-review-v080.js');
const history=read('flooring/po-history-v085.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Phase 1 router compiles',()=>new Function(router));
test('Phase 1 contains exactly the three approved lazy modules',()=>{
  assert(router.includes("pricing-cost-control-v078.js?v=0403b"));
  assert(router.includes("management-review-v080.js?v=0403b"));
  assert(router.includes("po-history-v085.js?v=0403b"));
  assert.equal(router.includes('warehouse-work-sync'),false);
  assert.equal(router.includes('material-work-sync'),false);
  assert.equal(router.includes('integration-hub'),false);
  assert.equal(router.includes('staff-board'),false);
});
test('Router does not load Phase 1 business modules at startup',()=>{
  const boot=router.slice(router.indexOf("document.addEventListener('click'"));
  assert.equal(/load\(['"](?:pricing|management|history)['"]\)/.test(boot.split("setTimeout(prewarmFromActivePage,500)")[0]),false);
  assert(router.includes("setTimeout(()=>load(name)"));
});
test('Pricing opens Pricing Cost Control on demand',()=>{
  assert(router.includes("pricing:['pricing','price','price book','product & cost','cost control']"));
});
test('Accounting opens Management Review on demand',()=>{
  assert(router.includes("management:['accounting','management','a/r','commission']"));
});
test('Purchasing opens PO History on demand',()=>{
  assert(router.includes("history:['purchasing','po / supplier','supplier orders','po history','archive']"));
});
test('Safe Core receives Phase 1 through the Fast Boot background launcher registry',()=>{
  assert(v71.includes('new URLSearchParams(location.search).get("mobile")==="safe"'));
  assert(v71.includes('mobile-safe-fastboot-v0403i.js?v=0403i'));
  assert(fastboot.includes("mobile-safe-phase1-v0403b.js?v=0403b"));
});
test('Desktop V071 does not set the mobile-safe flag',()=>{
  assert(v71.includes('if(s){i.__RUNLU_MOBILE_SAFE__=!0'));
  assert.equal(v71.includes('i.__RUNLU_MOBILE_SAFE__=!0;await o(c,"mobile-safe-fastboot-v0403i.js?v=0403i"') && !v71.includes('if(s)'),false);
});
test('Safe V071 uses stable inner cache token',()=>{
  assert(/n=s\?"mobile-safe-0403[bcdefghi]":Date\.now\(\)/.test(v71));
  assert(v71.includes('e.src="index-v040.html?v=077&t="+n'));
});
test('Pricing Cost Control no longer polls every 500ms for 30 seconds',()=>{
  assert.equal(pricing.includes('setInterval(()=>{decorateShell();render(false)'),false);
  assert(pricing.includes('[250,900,2200].forEach'));
});
test('Management Review no longer polls every 500ms for 30 seconds',()=>{
  assert.equal(management.includes('setInterval(()=>{decorate();if(!by(\'v080management\'))'),false);
  assert(management.includes('[250,900,2200].forEach'));
});
test('Management Review uses local calendar date for term math',()=>{
  assert(management.includes('const localDate='));
  assert.equal(management.includes("return x.toISOString().slice(0,10)"),false);
});
test('PO History converts timestamps to local calendar dates',()=>{
  assert(history.includes("d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')"));
  assert.equal(history.includes("new Date(s).toISOString().slice(0,10)"),false);
});
test('Phase 1 router is one-shot per module',()=>{
  assert(router.includes("if(m.state==='loaded'||root[m.global])"));
  assert(router.includes("if(m.state==='loading'&&m.promise)"));
  assert(router.includes('scriptExists(m.marker)'));
});
test('Safe Plus status API exposes loaded and failed module state',()=>{
  assert(router.includes('RUNLUMobileSafePhase1V0403B'));
  assert(router.includes('loaded:[...report.loaded]'));
  assert(router.includes('failed:[...report.failed]'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
