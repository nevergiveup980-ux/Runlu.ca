import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const phase5=read('flooring/mobile-safe-phase5-v0403f.js');
const fastboot=read('flooring/mobile-safe-fastboot-v0403j.js');
const rcLine=read('flooring/carpet-line-rc-v093-safe.js');
const historical=read('flooring/carpet-line-rc-v093.js');
const rcTracking=read('flooring/carpet-rc-tracking-v092-safe.js');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Phase 5 launcher compiles',()=>new Function(phase5));
test('Hardened V0.3.93 module compiles',()=>new Function(rcLine));
test('Fast Boot registry keeps Phase 5 after Phases 1–4',()=>{
  const ps=['mobile-safe-phase1-v0403b.js?v=0403b','mobile-safe-phase2-v0403c.js?v=0403c','mobile-safe-phase3-v0403d.js?v=0403d','mobile-safe-phase4-v0403e.js?v=0403e','mobile-safe-phase5-v0403f.js?v=0403f'].map(x=>fastboot.indexOf(x));
  assert(ps.every(x=>x>0));
  for(let i=1;i<ps.length;i++)assert(ps[i]>ps[i-1]);
});
test('Safe Core cache token remains compatible through Fast Boot',()=>{
  assert(/n=s\?"mobile-safe-0403[fghj]":Date\.now\(\)/.test(v71));
});
test('Phase 5 startup is launcher-only',()=>{
  const install=phase5.slice(phase5.indexOf('function install()'),phase5.indexOf('root.RUNLUMobileSafePhase5V0393'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase5.includes("b.addEventListener('click',launch)"));
});
test('Explicit tap loads V0.3.92 dependency before V0.3.93',()=>{
  const load=phase5.slice(phase5.indexOf('async function load()'),phase5.indexOf('async function launch()'));
  assert(load.includes('await ensureRCDependency()'));
  assert(load.includes('return loadModule()'));
  assert(phase5.includes('RUNLUMobileSafePhase4V0392?.load'));
  assert(phase5.includes("const MODULE_SRC='carpet-line-rc-v093-safe.js?v=0403f-safe'"));
});
test('After load, Phase 5 opens Jobs and refreshes the line checker',()=>{
  assert(phase5.includes('data-page="jobs"'));
  assert(phase5.includes("root[MODULE_GLOBAL]?.decorate?.()"));
  assert(phase5.includes("root[MODULE_GLOBAL]?.refresh?.()"));
});
test('V0.3.93 stays read-only against RC and Carpet Inventory',()=>{
  assert(rcLine.includes('Read-only against Carpet Inventory / RC Tracking'));
  assert(rcLine.includes('readOnlyInventory:true'));
  for(const banned of ['.insert(','.update(','.upsert(','.delete(','.rpc(','fetch(','XMLHttpRequest'])assert.equal(rcLine.includes(banned),false,banned);
});
test('RC number and planned cuts remain Job-line fields only',()=>{
  assert(rcLine.includes("setLineItemField(index,'rcNumber'"));
  assert(rcLine.includes("setLineItemField(index,'plannedCuts'"));
  assert(rcLine.includes("const JOBS_STORE='runlu_deerfoot_flooring_jobs_v1'"));
  assert(rcLine.includes('Saved with this Job line when you press Save Job.'));
});
test('Cut planning preserves the Warehouse +3 inch per cut rule',()=>{
  assert(rcLine.includes('const CUT_ALLOWANCE_FT=0.25'));
  assert(rcLine.includes('allowance=cuts.length*CUT_ALLOWANCE_FT'));
  assert(rcLine.includes('including ${cuts.length} × 3″ allowance'));
});
test('Availability check handles enough, shortage, width and awaiting-receiving states',()=>{
  for(const token of ['WIDTH CHECK','LENGTH NOT AVAILABLE','ENOUGH','SHORT ','AWAITING RECEIVING','RC NOT FOUND'])assert(rcLine.includes(token),token);
});
test('iPhone input surface uses native 16px fields and single-column entry',()=>{
  assert(rcLine.includes('@media(max-width:600px){.rc093top{grid-template-columns:1fr}'));
  assert(rcLine.includes('.rc093top input{min-height:48px;font-size:16px'));
});
test('Safe V0.3.93 removes continuous startup polling and scopes its MutationObserver to Jobs editor',()=>{
  assert.equal(rcLine.includes('setInterval('),false);
  assert(rcLine.includes("const editor=by('itemsEditor');if(!editor)return"));
  assert(rcLine.includes("observer.observe(editor,{childList:true,subtree:true})"));
  assert(rcLine.includes('[180,650,1600].forEach'));
});
test('RC datalist is bounded for Safari while exact manual RC lookup remains available',()=>{
  assert(rcLine.includes('const MAX_DATALIST_OPTIONS=1200'));
  assert(rcLine.includes('.slice(0,MAX_DATALIST_OPTIONS)'));
  assert(rcLine.includes('combined().find(x=>norm(x?.rc)===key)'));
});
test('V0.3.93 consumes the hardened V0.3.92 combined-data API',()=>{
  assert(rcLine.includes('window.RUNLUCarpetRCTrackingV092'));
  assert(rcLine.includes("typeof api.combined==='function'"));
  assert(rcTracking.includes("version:'0.3.92-safe'"));
});
test('Historical V0.3.93 file remains untouched',()=>{
  assert(historical.includes("version:'0.3.93'"));
  assert(historical.includes('setInterval('));
  assert(rcLine.includes("version:'0.3.93-safe'"));
});
test('Frozen Quote production route remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Phase 5 exposes diagnostic status',()=>{
  assert(phase5.includes('RUNLUMobileSafePhase5V0393'));
  assert(phase5.includes("module:'carpet-line-rc-v0393'"));
  assert(phase5.includes("startup:'launcher-only'"));
  assert(phase5.includes("dependency:'v0392'"));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
