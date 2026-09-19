import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const js=fs.readFileSync(new URL('../flooring/quote-dual-entry-v0403.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../flooring/index-v0403-quote.html',import.meta.url),'utf8');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Quote engine still compiles and exports public API',()=>{
  const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
  vm.createContext(ctx.globalThis);vm.runInContext(js,ctx.globalThis);
  assert(ctx.globalThis.RUNLUQuoteV0403);
});

test('Table cells are real editable inputs',()=>{
  assert(js.includes('class="q403cell q403desc"'));
  assert(js.includes('data-key="description"'));
  assert(js.includes('data-key="qty"'));
  assert(js.includes('data-key="unit"'));
  assert(js.includes('data-key="listPrice"'));
  assert(js.includes('data-key="unitPrice"'));
  assert(js.includes('data-key="note"'));
});

test('Mobile table opens at the first columns instead of retaining a confusing horizontal offset',()=>{
  assert(js.includes("el.querySelectorAll('.q403tableWrap').forEach(w=>{w.scrollLeft=0})"));
});

test('Numeric cells select zero on focus for immediate overwrite',()=>{
  assert(js.includes("x.classList.contains('q403num')"));
  assert(js.includes("x.value==='0'||x.value==='0.00'"));
  assert(js.includes('x.select()'));
});

test('Enter moves to the next editable table cell',()=>{
  assert(js.includes("if(e.key==='Enter')"));
  assert(js.includes('focusNextCell(x)'));
});

test('Adding a row immediately focuses the new Description cell',()=>{
  assert(js.includes("data-key=\"description\""));
  assert(js.includes("target?.focus()"));
  assert(js.includes("target?.scrollIntoView"));
});

test('Editing still updates the shared quote draft and live total',()=>{
  assert(js.includes('draft=updateLine('));
  assert(js.includes('renderSummaryAndPreview()'));
  assert(js.includes('data-q403-total='));
});

test('Spreadsheet table uses sticky row number and Description columns',()=>{
  assert(html.includes('.q403tableBlock .sticky-num'));
  assert(html.includes('.q403tableBlock .sticky-desc'));
  assert(html.includes('position:sticky'));
});

test('Mobile inputs use 16px text to avoid iPhone Safari focus zoom',()=>{
  assert(html.includes('.q403tableBlock input.q403cell{height:46px;font-size:16px'));
});

test('Table uses touch-friendly horizontal scrolling',()=>{
  assert(html.includes('-webkit-overflow-scrolling:touch'));
  assert(html.includes('touch-action:pan-x pan-y'));
});

test('Visible hint tells user Table Entry is directly editable',()=>{
  assert(js.includes('Table Entry is editable.'));
  assert(js.includes('Tap any cell to type.'));
});

test('Quote page requests the hotfix script token',()=>{
  assert(html.includes('quote-dual-entry-v0403.js?v=0403c'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
