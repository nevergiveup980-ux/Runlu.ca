import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const phase4=read('flooring/mobile-safe-phase4-v0403e.js');
const fastboot=read('flooring/mobile-safe-fastboot-v0403h.js');
const rc=read('flooring/carpet-rc-tracking-v092-safe.js');
const historical=read('flooring/carpet-rc-tracking-v092.js');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Phase 4 launcher compiles',()=>new Function(phase4));
test('Fast Boot registry keeps Phase 4 after Phases 1–3',()=>{
  const p1=fastboot.indexOf('mobile-safe-phase1-v0403b.js?v=0403b');
  const p2=fastboot.indexOf('mobile-safe-phase2-v0403c.js?v=0403c');
  const p3=fastboot.indexOf('mobile-safe-phase3-v0403d.js?v=0403d');
  const p4=fastboot.indexOf('mobile-safe-phase4-v0403e.js?v=0403e');
  assert(p1>0&&p2>p1&&p3>p2&&p4>p3);
});
test('Safe Core cache token remains compatible through Fast Boot',()=>{
  assert(/n=s\?"mobile-safe-0403[efgh]":Date\.now\(\)/.test(v71));
});
test('Phase 4 startup is launcher-only',()=>{
  const install=phase4.slice(phase4.indexOf('function install()'),phase4.indexOf('root.RUNLUMobileSafePhase4V0392'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase4.includes("b.addEventListener('click',launch)"));
});
test('Explicit tap loads only the hardened V0.3.92 RC module',()=>{
  assert(phase4.includes("const MODULE_SRC='carpet-rc-tracking-v092-safe.js?v=0403e-safe'"));
  assert(phase4.includes("const MODULE_GLOBAL='RUNLUCarpetRCTrackingV092'"));
  assert.equal(phase4.includes('carpet-line-rc-v093.js'),false);
  assert.equal(phase4.includes('people-to-call-review-v095.js'),false);
});
test('After load, Phase 4 opens the installed RC Tracking page',()=>{
  const launch=phase4.slice(phase4.indexOf('async function launch()'),phase4.indexOf('function ensureLauncher()'));
  assert(launch.includes('await load()'));
  assert(launch.includes('openInstalled()'));
  assert(phase4.includes("root[MODULE_GLOBAL]?.open"));
});
test('Hardened V0.3.92 uses local business date for assigned date defaults',()=>{
  assert(rc.includes("const today=()=>{const d=new Date();return d.getFullYear()+'-'"));
  assert.equal(rc.includes("const today=()=>new Date().toISOString().slice(0,10)"),false);
});
test('RC inventory, operations and registry reads use bounded pagination',()=>{
  assert(rc.includes('async function pagedDataset'));
  assert(rc.includes(".range(from,Math.min(from+pageSize-1,maxRows-1))"));
  assert(rc.includes('pagedDataset(INVENTORY_DATASET,{maxRows:5000})'));
  assert(rc.includes('pagedDataset(OPERATIONS_DATASET,{maxRows:5000})'));
  assert(rc.includes('pagedDataset(REGISTRY_DATASET,{maxRows:5000})'));
  assert.equal(rc.includes('.limit(500)'),false);
});
test('RC save writes only a Finance RC registry record and never overwrites an existing RC',()=>{
  assert(rc.includes("dataset_key:REGISTRY_DATASET,record_id:rc"));
  assert(rc.includes("from('warehouse_records').insert(insert)"));
  assert(rc.includes('is already in the Finance RC Registry. Nothing was overwritten.'));
  assert(rc.includes('/duplicate|23505/i'));
  assert.equal(rc.includes("from('warehouse_records').update("),false);
  assert.equal(rc.includes("from('warehouse_records').upsert("),false);
  assert.equal(rc.includes("from('warehouse_records').delete("),false);
});
test('RC module keeps Carpet Inventory read-only and does not auto-generate RC numbers',()=>{
  assert(rc.includes('readOnlyInventory:true'));
  assert(rc.includes('autoGenerateRC:false'));
  assert(rc.includes("workflow:'COMPANY_SIMULATION_FINANCE_ASSIGNED'"));
});
test('RC lifecycle links registry and physical Carpet Inventory by exact RC',()=>{
  assert(rc.includes('function rcOfInventory'));
  assert(rc.includes('norm(rcOfInventory(r))===rc'));
  assert(rc.includes("linkedInventoryRecordId:linked?.record_id||''"));
});
test('Historical V0.3.92 preview remains untouched while Safe Core uses a separate hardened file',()=>{
  assert(historical.includes("version:'0.3.92'"));
  assert(historical.includes('.limit(500)'));
  assert(rc.includes("version:'0.3.92-safe'"));
});
test('Frozen Quote production route remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Phase 4 exposes a diagnostic status API',()=>{
  assert(phase4.includes('RUNLUMobileSafePhase4V0392'));
  assert(phase4.includes("module:'carpet-rc-tracking-v0392'"));
  assert(phase4.includes("startup:'launcher-only'"));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
