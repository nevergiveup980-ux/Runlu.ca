import fs from'node:fs';import assert from'node:assert/strict';import{spawnSync}from'node:child_process';
const js=fs.readFileSync('flooring/po-safe-v040.js','utf8');
const syntax=spawnSync(process.execPath,['--check','flooring/po-safe-v040.js'],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
assert(js.includes("SUPPLIER_STORE='runlu_flooring_supplier_master_v1'"));
assert(js.includes('function supplierMaster()'));assert(js.includes('function activeSuppliers()'));assert(js.includes('function supplierForName(name)'));assert(js.includes('function supplierIdForEntry(name,old)'));
assert(js.includes('id="poSupplierSafe" list="poSupplierMasterList"'));assert(js.includes('id="poSupplierMasterList"'));assert(js.includes('Company Supplier Master suggestions · free typing remains available.'));
assert(js.includes('supplierId:supplierIdForEntry('));assert(js.includes("return old?.supplierId&&String(old.supplier||'').trim().toLowerCase()===String(name||'').trim().toLowerCase()?old.supplierId:''"));
assert(!js.includes('localStorage.setItem(SUPPLIER_STORE'));assert(js.includes("localStorage.setItem(PO_STORE"));
console.log('PASS PO ↔ Supplier Master bridge: read-only master suggestions, stable Supplier ID when exact, stale ID fails closed, existing free typing preserved');