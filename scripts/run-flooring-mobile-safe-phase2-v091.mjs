import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const phase2=read('flooring/mobile-safe-phase2-v0403c.js');
const fastboot=read('flooring/mobile-safe-fastboot-v0403j.js');
const material=read('flooring/material-work-sync-v091.js');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Phase 2 launcher compiles',()=>new Function(phase2));
test('Fast Boot registry loads the tiny Phase 2 launcher after Phase 1',()=>{
  const p1=fastboot.indexOf('mobile-safe-phase1-v0403b.js?v=0403b');
  const p2=fastboot.indexOf('mobile-safe-phase2-v0403c.js?v=0403c');
  assert(p1>0&&p2>p1);
  assert(v71.includes('mobile-safe-fastboot-v0403j.js?v=0403j'));
});
test('Safe Core cache token advances for Phase 2',()=>{
  assert(/n=s\?"mobile-safe-0403[cdefghj]":Date\.now\(\)/.test(v71));
});
test('Phase 2 adds only the V0.9.1 Warehouse Fulfillment launcher',()=>{
  assert(phase2.includes("const MODULE_SRC='material-work-sync-v091.js?v=0403c-safe'"));
  assert(phase2.includes("const MODULE_GLOBAL='RUNLUMaterialWorkSyncV091'"));
  assert(phase2.includes("const PAGE='warehouseFulfillment'"));
  assert.equal(phase2.includes('warehouse-work-sync-v090.js'),false);
  assert.equal(phase2.includes('integration-hub-v079r1.js'),false);
  assert.equal(phase2.includes('staff-board-v083.js'),false);
});
test('V0.9.1 business module is not fetched during Safe Core startup',()=>{
  const install=phase2.slice(phase2.indexOf('function install()'),phase2.indexOf('root.RUNLUMobileSafePhase2V091'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase2.includes("b.addEventListener('click',launch)"));
});
test('Launcher identifies V0.9.1 as read-only fulfillment',()=>{
  assert(phase2.includes('Warehouse Fulfillment'));
  assert(phase2.includes('Stock Picking + Carpet Cutting'));
  assert(phase2.includes('read-only fulfillment'));
});
test('Module opens only after the explicit load resolves',()=>{
  const launch=phase2.slice(phase2.indexOf('async function launch()'),phase2.indexOf('function ensureLauncher()'));
  assert(launch.includes('await load()'));
  assert(launch.includes('openInstalled()'));
});
test('V0.9.1 module remains management/read-only and Warehouse stays execution authority',()=>{
  assert(material.includes('Read-only management view'));
  assert(material.includes('Warehouse OS is the execution authority'));
  assert(material.includes("from('flooring_warehouse_material_tasks').select('*')"));
  for(const banned of ['.insert(','.update(','.upsert(','.delete(','.rpc('])assert.equal(material.includes(banned),false,banned);
});
test('V0.9.1 only refreshes its cloud data when loaded and then while its page is active',()=>{
  assert(material.includes('if(active())refresh(false)'));
  assert(material.includes("setInterval(()=>{if(document.visibilityState==='visible'&&active())refresh(false)},20000)"));
});
test('V0.9.1 creates a dedicated Fulfillment page and launcher',()=>{
  assert(material.includes("const PAGE='warehouseFulfillment'"));
  assert(material.includes("b.textContent='Fulfillment'"));
  assert(material.includes("b.id='mw091module'"));
});
test('Phase 2 exposes status for real-device diagnostics',()=>{
  assert(phase2.includes('RUNLUMobileSafePhase2V091'));
  assert(phase2.includes("startup:'launcher-only'"));
  assert(phase2.includes("module:'material-work-v091'"));
});
test('Phase 1 stays unchanged and does not absorb V0.9.1',()=>{
  const phase1=read('flooring/mobile-safe-phase1-v0403b.js');
  assert.equal(phase1.includes('material-work-sync-v091.js'),false);
  assert(phase1.includes('pricing-cost-control-v078.js'));
  assert(phase1.includes('management-review-v080.js'));
  assert(phase1.includes('po-history-v085.js'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
