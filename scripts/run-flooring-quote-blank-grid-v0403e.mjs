import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const js=fs.readFileSync(new URL('../flooring/quote-dual-entry-v0403.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../flooring/index-v0403-quote.html',import.meta.url),'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);vm.runInContext(js,ctx.globalThis);
const A=ctx.globalThis.RUNLUQuoteV0403;
const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Quote engine exports always-ready grid helpers',()=>{
  assert(A.ensureTableRows);assert(A.stripBlankUILines);assert(A.meaningfulLine)
});
test('Empty quote gets six material and three labour ready rows',()=>{
  const q=A.ensureTableRows(A.normalizeQuote({}));
  assert.equal(q.materials.length,6);assert.equal(q.labour.length,3);
  assert(q.materials.every(x=>String(x.id).startsWith('ui-mat-')));
  assert(q.labour.every(x=>String(x.id).startsWith('ui-lab-')))
});
test('Untouched UI rows are not persisted',()=>{
  const q=A.ensureTableRows(A.normalizeQuote({}));
  const clean=A.stripBlankUILines(q);
  assert.equal(clean.materials.length,0);assert.equal(clean.labour.length,0)
});
test('Typed UI row survives cleanup',()=>{
  let q=A.ensureTableRows(A.normalizeQuote({}));
  q=A.updateLine(q,'materials',q.materials[0].id,'description','LVP');
  q=A.updateLine(q,'materials',q.materials[0].id,'qty','12');
  const clean=A.stripBlankUILines(q);
  assert.equal(clean.materials.length,1);assert.equal(clean.materials[0].description,'LVP');assert.equal(clean.materials[0].qty,12)
});
test('Always-ready table is created before table HTML is rendered',()=>{
  const i=js.indexOf('function renderTable()'),j=js.indexOf('function tableGroup',i);
  const s=js.slice(i,j);assert(s.includes('draft=ensureTableRows(draft)'))
});
test('iPhone hint says blank rows are live cells and no plus-row is required initially',()=>{
  assert(js.includes('The blank rows below are live cells.'));
  assert(js.includes('six ready rows')||js.includes('no + Row is required for the first entries.')||js.includes('Tap Description / Qty / Unit / Price directly')||js.includes('Tap any field directly.'));
});
test('iPhone still uses native directly editable controls',()=>{
  assert(js.includes('q403iosInput')||js.includes('contenteditable="true"')||js.includes('q403mobileInput'));
  assert(js.includes('data-q403-line='));
});
test('Blank scaffold numeric cells display empty instead of zero',()=>{
  assert(js.includes("numeric&&uiBlank&&num(value)===0"))
});
test('Preview hides untouched scaffold rows',()=>{
  assert(js.includes('.filter(meaningfulLine).map('))
});
test('Switching back to Database Fields prunes untouched UI rows',()=>{
  assert(js.includes("if(mode==='fields')draft=stripBlankUILines(draft)"))
});
test('Saving strips untouched UI rows before writing Job quote',()=>{
  const i=js.indexOf('function saveQuote()'),j=js.indexOf('function load()',i);
  assert(js.slice(i,j).includes('const clean=stripBlankUILines(draft)'))
});
test('Page requests V0.4.03e script token',()=>{
  assert(/quote-dual-entry-v0403\.js\?v=0403[efhi]/.test(html))
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
