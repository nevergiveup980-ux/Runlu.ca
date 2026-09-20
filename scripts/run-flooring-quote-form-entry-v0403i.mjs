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

test('Quote engine compiles and preserves the shared quote API',()=>{assert(A);assert(A.ensureTableRows);assert(A.stripBlankUILines)});
test('iPhone defaults to direct Quote Form Entry mode',()=>{
  assert(js.includes("if(touchIOS)mode='table'"))
});
test('Quote Form Entry renders inside the actual large paper preview',()=>{
  assert(js.includes('function renderPaperForm()'));
  assert(js.includes("const p=by('q403preview')"));
  assert(js.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'))
});
test('The separate card editor is not used by Quote Form Entry mode',()=>{
  const i=js.indexOf('function renderEditor()'),j=js.indexOf('function quoteRows',i),s=js.slice(i,j);
  assert(s.includes('Quote Form Entry active · V0.4.03i'));
  assert.equal(s.includes('renderTable()'),false)
});
test('Large form exposes quote header and customer fields directly',()=>{
  for(const key of ['salesperson','quoteNumber','quoteDate','customerName','projectAddress','projectName','installer'])assert(js.includes("paperField('")&&js.includes("'"+key+"'"))
  assert(js.includes('data-q403-paper-select="fulfillment"'))
});
test('Large form exposes material and labour line fields directly',()=>{
  for(const key of ['description','qty','unit','listPrice','unitPrice','note'])assert(js.includes("paperLineField(group,x,'"+key+"'"));
  assert(js.includes("paperLineRows('materials','Materials')"));
  assert(js.includes("paperLineRows('labour','Installation / Labour')"))
});
test('Direct paper inputs update the same in-memory draft object',()=>{
  assert(js.includes('draft=setQuoteField(draft,x.dataset.q403PaperField'));
  assert(js.includes('draft=updateLine(draft,x.dataset.q403PaperLine,x.dataset.id,x.dataset.key,x.value)'))
});
test('Large form totals update without rebuilding focused inputs on each keystroke',()=>{
  assert(js.includes('function refreshPaperTotals()'));
  assert(js.includes('data-paper-sum="grandTotal"'));
  const binder=js.slice(js.indexOf('function bindPaperForm'),js.indexOf('function renderPaperForm'));
  const lineBind=binder.slice(binder.indexOf("p.querySelectorAll('[data-q403-paper-line]')"),binder.indexOf("p.querySelectorAll('[data-q403-paper-add]')"));
  assert(lineBind.includes('refreshPaperTotals()'));
  assert.equal(lineBind.includes('renderSummaryAndPreview()'),false)
});
test('Ready rows remain six Materials and three Labour and blank rows are not saved',()=>{
  const q=A.ensureTableRows(A.normalizeQuote({}));
  assert.equal(q.materials.length,6);assert.equal(q.labour.length,3);
  const clean=A.stripBlankUILines(q);assert.equal(clean.materials.length,0);assert.equal(clean.labour.length,0)
});
test('Quote Form Entry includes notes, valid days, GST rate and deposit control',()=>{
  assert(js.includes("paperField('Valid Days','validDays'"));
  assert(js.includes("paperField('GST Rate','gstRate'"));
  assert(js.includes('data-q403-paper-check="depositRequired"'));
  assert(js.includes('data-q403-paper-notes'))
});
test('Printing temporarily renders the clean read-only Quote',()=>{
  assert(js.includes('function printQuote()'));
  assert(js.includes('renderReadOnlyPreview()'));
  assert(js.includes("window.addEventListener('afterprint'"));
  assert(js.includes("by('q403print2')"))
});
test('Quote page labels the second view Quote Form Entry',()=>{
  assert(html.includes('data-q403-mode="table">Quote Form Entry</button>'));
  assert(html.includes('Database Fields and Quote Form Entry are two editing views'))
});
test('Large Quote appears before summary and action buttons',()=>{
  const p=html.indexOf('id="q403preview"'),s=html.indexOf('id="q403summary"'),a=html.indexOf('id="q403save2"');
  assert(p>0&&s>p&&a>s)
});
test('Mobile direct-form inputs use Safari-safe 16px sizing with no iframe',()=>{
  assert(html.includes('.q403paperField input'));
  assert(html.includes('font-size:16px'));
  assert(html.includes('TOP-LEVEL iPHONE QUOTE · NO IFRAME · V0.4.03i'));
  assert.equal(html.includes('<iframe'),false)
});
test('Quote page requests V0.4.03i editor token',()=>assert(html.includes('quote-dual-entry-v0403.js?v=0403i')));

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
