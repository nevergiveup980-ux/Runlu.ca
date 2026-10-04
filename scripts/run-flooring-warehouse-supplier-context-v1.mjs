import fs from'node:fs';import assert from'node:assert/strict';import{spawnSync}from'node:child_process';
const js=fs.readFileSync('flooring/warehouse-po-handoff-v001.js','utf8');
const syntax=spawnSync(process.execPath,['--check','flooring/warehouse-po-handoff-v001.js'],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
assert(js.includes("SUPPLIER_STORE='runlu_flooring_supplier_master_v1'"));assert(js.includes('supplierForPO=po=>'));assert(js.includes('if(po?.supplierId)'));assert(js.includes('supplierContext=po=>'));
for(const x of ['Supplier ID: ','Freight Rule: ','Minimum Order: ','Discount Rule: ','supplierId:supplier.supplierId','freightRule:supplier.freightRule','minimumOrder:supplier.minimumOrder','discountRule:supplier.discountRule'])assert(js.includes(x),x);
assert(!js.includes('localStorage.setItem(SUPPLIER_STORE'));assert(!/password|credential|mfa/i.test(js));
assert(js.includes('[PO_STORE,SUPPLIER_STORE].includes(ev.key)'));
console.log('PASS Warehouse handoff Supplier context: stable-ID-first master lookup, non-secret receiving rules, no Supplier Master writes');