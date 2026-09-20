import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const phase3=read('flooring/mobile-safe-phase3-v0403d.js');
const fastboot=read('flooring/mobile-safe-fastboot-v0403g.js');
const routing=read('flooring/mixed-order-routing-v091-safe.js');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Phase 3 launcher compiles',()=>new Function(phase3));
test('Fast Boot registry keeps Phase 3 after Phase 1 and Phase 2 launchers',()=>{
  const p1=fastboot.indexOf('mobile-safe-phase1-v0403b.js?v=0403b');
  const p2=fastboot.indexOf('mobile-safe-phase2-v0403c.js?v=0403c');
  const p3=fastboot.indexOf('mobile-safe-phase3-v0403d.js?v=0403d');
  assert(p1>0&&p2>p1&&p3>p2);
});
test('Safe Core cache token remains compatible through Fast Boot',()=>{
  assert(/n=s\?"mobile-safe-0403[defg]":Date\.now\(\)/.test(v71));
});
test('Phase 3 startup is launcher-only and does not fetch routing module automatically',()=>{
  const install=phase3.slice(phase3.indexOf('function install()'),phase3.indexOf('root.RUNLUMobileSafePhase3V0391'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase3.includes("b.addEventListener('click',launch)"));
});
test('Explicit tap loads only the hardened V0.3.91 routing module',()=>{
  assert(phase3.includes("const MODULE_SRC='mixed-order-routing-v091-safe.js?v=0403d-safe'"));
  assert(phase3.includes("const MODULE_GLOBAL='RUNLUMixedOrderRoutingV091'"));
  assert.equal(phase3.includes('carpet-rc-tracking-v092.js'),false);
  assert.equal(phase3.includes('people-to-call-review-v095.js'),false);
});
test('After load, Phase 3 opens the existing Jobs workspace',()=>{
  assert(phase3.includes('data-page="jobs"'));
  const launch=phase3.slice(phase3.indexOf('async function launch()'),phase3.indexOf('function ensureLauncher()'));
  assert(launch.includes('await load()'));
  assert(launch.includes('openJobs()'));
});
test('Hardened V0.3.91 module uses paged Product Master reads',()=>{
  assert(routing.includes('async function pagedWarehouseRecords'));
  assert(routing.includes(".range(from,Math.min(from+pageSize-1,maxRows-1))"));
  assert(routing.includes("pagedWarehouseRecords(['runlu_product_master_v21'])"));
  assert.equal(routing.includes(".limit(500)"),false);
});
test('Duplicate-work lookup is paged instead of stopping at 100 records',()=>{
  assert(routing.includes("pagedWarehouseRecords(['runlu_operations_log_v52','runlu_cutting_log_v52'],{contains:{po:String(po)}})"));
  assert.equal(routing.includes(".limit(100)"),false);
});
test('Routing can create planning Holds but never directly decrements physical inventory',()=>{
  assert(routing.includes("rpc('flooring_place_inventory_hold'"));
  assert(routing.includes('No physical inventory was deducted by Routing.'));
  for(const banned of ["from('warehouse_records').update(","from('warehouse_records').delete(","rpc('flooring_apply","rpc('flooring_execute"])assert.equal(routing.includes(banned),false,banned);
});
test('Routing preserves duplicate-work protection before creating new Holds',()=>{
  assert(routing.includes('await detectExisting(j,j.items)'));
  assert(routing.includes('if(x.routeExistingExecution){existingCount++;continue}'));
});
test('Service and non-stock lines remain outside Warehouse inventory',()=>{
  assert(routing.includes("x.routeStatus='ROUTED_TO_ACCOUNTING'"));
  assert(routing.includes("x.routeStatus='SUPPLIER_PO_REQUIRED'"));
  assert(routing.includes('Service lines stay on the Invoice and Accounting total; they never create Warehouse inventory movements.'));
});
test('Frozen Quote production route remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Phase 3 exposes a diagnostic status API',()=>{
  assert(phase3.includes('RUNLUMobileSafePhase3V0391'));
  assert(phase3.includes("module:'mixed-order-routing-v0391'"));
  assert(phase3.includes("startup:'launcher-only'"));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
