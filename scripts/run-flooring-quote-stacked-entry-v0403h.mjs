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

test('Quote engine compiles and keeps shared quote API',()=>{assert(A);assert(A.ensureTableRows);assert(A.stripBlankUILines)});
test('iPhone stacked entry uses ordinary native inputs',()=>{
  const i=js.indexOf('function iosStackCell('),j=js.indexOf('function renderTable()',i);
  const s=js.slice(i,j);
  assert(s.includes('q403mobileInput'));
  assert(s.includes('type="text"'));
  assert.equal(s.includes('<table'),false);
  assert.equal(s.includes('contenteditable'),false);
  assert.equal(s.includes('q403iosWrap'),false);
});
test('Stacked path has no horizontal scrolling container dependency',()=>{
  const r0=js.indexOf('function renderTable()'),i=js.indexOf("if(touchIOS){",r0),j=js.indexOf("return",i);
  const s=js.slice(i,j+100);
  assert(s.includes('iosStackGroup'));
  assert.equal(s.includes('scrollLeft'),false);
});
test('Each mobile row exposes Description Qty Unit List Price Quote Price Note',()=>{
  for(const key of ['description','qty','unit','listPrice','unitPrice','note'])assert(js.includes("iosStackCell(group,x,'"+key+"'"));
});
test('Numeric fields request decimal keyboard',()=>assert(js.includes('inputmode="decimal"')));
test('No touch handlers suppress native iPhone focus',()=>{
  assert.equal(js.includes("x.addEventListener('touchend'"),false);
  assert.equal(js.includes('e.preventDefault();x.focus'),false);
});
test('Enter advances across stacked fields',()=>{
  assert(js.includes('const root=by(\'q403table\')'));
  assert(js.includes("if(e.key==='Enter')"));
  assert(js.includes('focusNextCell(x)'));
});
test('Always-ready rows remain six Materials and three Labour',()=>{
  const q=A.ensureTableRows(A.normalizeQuote({}));
  assert.equal(q.materials.length,6);assert.equal(q.labour.length,3)
});
test('Untouched ready rows are not saved',()=>{
  const q=A.stripBlankUILines(A.ensureTableRows(A.normalizeQuote({})));
  assert.equal(q.materials.length,0);assert.equal(q.labour.length,0)
});
test('Stacked entry has no overflow wrapper in its own CSS path',()=>{
  assert(html.includes('.q403stackBlock{overflow:visible!important}'));
  assert(html.includes('.q403stackFields{display:grid'));
  assert(html.includes('.q403mobileInput{display:block'));
});
test('Mobile native inputs use 16px font',()=>assert(html.includes('font-size:16px')));
test('Top-level no-iframe diagnostic is still present',()=>assert(html.includes('TOP-LEVEL iPHONE QUOTE · NO IFRAME · V0.4.03h')));
test('Quote page requests V0.4.03h editor token',()=>assert(html.includes('quote-dual-entry-v0403.js?v=0403h')));

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
