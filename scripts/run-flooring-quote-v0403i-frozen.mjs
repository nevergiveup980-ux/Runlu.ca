import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const frozenHtmlPath='flooring/index-v0403i-quote-stable-frozen.html';
const frozenJsPath='flooring/quote-dual-entry-v0403i-stable-frozen.js';
const html=read(frozenHtmlPath);
const js=read(frozenJsPath);
const release=read('flooring/index-v0403-release.html');
const manifest=read('flooring/QUOTE_V0403I_FROZEN.md');

const EXPECTED_HTML_BLOB='db4105a87d1cfc9d25f7c061d395f34792fcde8b';
const EXPECTED_JS_BLOB='a39540ca0ca85dd11a8ab078be829645dbb425df';
const blob=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Frozen HTML blob is immutable baseline',()=>assert.equal(blob(frozenHtmlPath),EXPECTED_HTML_BLOB));
test('Frozen JS blob is immutable baseline',()=>assert.equal(blob(frozenJsPath),EXPECTED_JS_BLOB));
test('Manifest records both frozen blob SHAs',()=>{
  assert(manifest.includes(EXPECTED_HTML_BLOB));
  assert(manifest.includes(EXPECTED_JS_BLOB));
  assert(manifest.includes('Do not edit the two frozen artifacts in place.'));
});
test('Production desktop Quote route points to frozen page',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
});
test('Production iPhone Quote route points to frozen top-level page',()=>{
  assert(release.includes("index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&mobile=top"));
  assert(release.includes('location.assign(q)'));
});
test('Frozen page loads only the frozen Quote engine',()=>{
  assert(html.includes('quote-dual-entry-v0403i-stable-frozen.js?v=0403i-frozen'));
  assert.equal(html.includes('quote-dual-entry-v0403.js?v=0403i'),false);
});
test('Frozen page remains top-level iPhone Quote with no iframe',()=>{
  assert(html.includes('TOP-LEVEL iPHONE QUOTE · NO IFRAME · V0.4.03i'));
  assert.equal(html.includes('<iframe'),false);
});
test('Frozen Quote keeps direct large-form entry',()=>{
  assert(html.includes('Quote Form Entry'));
  assert(js.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
  assert(js.includes("if(touchIOS)mode='table'"));
  assert(js.includes('function renderPaperForm()'));
});
test('Frozen Quote keeps one Job-bound source of truth',()=>{
  assert(js.includes("const JOBS='runlu_deerfoot_flooring_jobs_v1'"));
  assert(js.includes('applyQuoteToJob'));
  assert(js.includes('const clean=stripBlankUILines(draft)'));
});
test('Frozen Quote keeps live totals and clean printing',()=>{
  assert(js.includes('function refreshPaperTotals()'));
  assert(js.includes('data-paper-sum="grandTotal"'));
  assert(js.includes('function printQuote()'));
  assert(js.includes('renderReadOnlyPreview()'));
  assert(js.includes("window.addEventListener('afterprint'"));
});
test('Frozen Quote does not introduce network or Supabase writes',()=>{
  for(const banned of ['fetch(','XMLHttpRequest','new WebSocket','supabase.from(','insert(','upsert('])assert.equal(js.includes(banned),false,banned);
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
