import assert from 'node:assert/strict';
import { reconcileAssets, PUBLIC_CATALOG_CANDIDATES } from './asset-ledger-reconcile.mjs';
const existing=[{asset_key:'runlu-brand',url:'https://runlu.ca/'}];
const result=reconcileAssets(existing,[
  {asset_key:'runlu-brand',name:'Brand',url:'https://runlu.ca/'},
  {asset_key:'new-book',name:'New Book',url:'https://runlu.ca/book.html'},
  {asset_key:'new-book',name:'Duplicate',url:'https://runlu.ca/other.html'},
  {asset_key:'runlu-brand',name:'Conflict',url:'https://runlu.ca/changed.html'},
  {asset_key:'bad',name:'External',url:'https://example.org/'},
]);
assert.equal(result.candidates.length,1);
assert.equal(result.candidates[0].status,'needs-review');
assert.equal(result.conflicts.length,3);
assert.ok(PUBLIC_CATALOG_CANDIDATES.length >= 3);
console.log('Asset Ledger V2 reconciliation tests passed');
