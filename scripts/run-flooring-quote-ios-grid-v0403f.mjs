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

test('Quote engine compiles and exports shared draft helpers',()=>{assert(A);assert(A.ensureTableRows);assert(A.stripBlankUILines)});
test('iPhone path renders CSS-grid rows with native input elements',()=>{
  assert(js.includes('function iosGridGroup(')||js.includes('function iosStackGroup('));
  assert(js.includes('class="q403iosGrid q403iosRow"')||js.includes('class="q403stackRow"'));
  assert(js.includes('class="q403iosInput')||js.includes('q403mobileInput'));
  assert(js.includes('type="text"'));
  assert.equal(js.slice(js.indexOf('function iosGridGroup('),js.indexOf('function renderTable()')).includes('contenteditable="true"'),false);
});
test('iPhone grid exposes all required editable quote columns',()=>{
  for(const key of ['description','qty','unit','listPrice','unitPrice','note'])assert(js.includes("iosGridCell(group,x,'"+key+"'")||js.includes("iosStackCell(group,x,'"+key+"'"));
});
test('Numeric iPhone grid cells request decimal keyboard',()=>{
  assert(js.includes('inputmode="decimal"'));
});
test('iPhone render path does not use HTML table cells',()=>{
  const a=js.indexOf('function iosStackGroup(')>=0?js.indexOf('function iosStackGroup('):js.indexOf('function iosGridGroup('),s=js.slice(a,js.indexOf('function renderTable()'));
  assert.equal(s.includes('<table'),false);
  assert(s.includes('q403iosGrid')||s.includes('q403stackRow'));
});
test('iPhone render path keeps six Materials and three Labour ready rows',()=>{
  const q=A.ensureTableRows(A.normalizeQuote({}));
  assert.equal(q.materials.length,6);assert.equal(q.labour.length,3)
});
test('Native iPhone inputs rely on default Safari focus without touchend preventDefault',()=>{
  assert.equal(js.includes("x.addEventListener('touchend'"),false);
  assert.equal(js.includes('e.preventDefault();x.focus'),false);
});
test('Grid input updates the same shared draft and live totals',()=>{
  assert(js.includes('draft=updateLine(draft,x.dataset.q403Line,x.dataset.id,x.dataset.key,editValue(x))'));
  assert(js.includes('renderSummaryAndPreview()'));
});
test('Untouched scaffold rows are still stripped before save and preview',()=>{
  assert(js.includes('const clean=stripBlankUILines(draft)'));
  assert(js.includes('.filter(meaningfulLine).map('));
});
test('Render failure becomes visible instead of silently collapsing the editor',()=>{
  assert(js.includes("Table Entry render error."));
  assert(js.includes("console.error('[RUNLU Quote Table Entry]'"));
});
test('Mobile inputs use 16px native font and CSS grid columns',()=>{
  assert(html.includes('.q403iosGrid{display:grid')||html.includes('.q403stackFields{display:grid'));
  assert(html.includes('.q403iosInput{')||html.includes('.q403mobileInput{'));
  assert(html.includes('font-size:16px'));
});
test('Quote page requests V0.4.03f script token',()=>{
  assert(/quote-dual-entry-v0403\.js\?v=0403[fh]/.test(html));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
