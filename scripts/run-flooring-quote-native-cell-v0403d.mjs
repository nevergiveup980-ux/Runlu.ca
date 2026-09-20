import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const js=fs.readFileSync(new URL('../flooring/quote-dual-entry-v0403.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../flooring/index-v0403-quote.html',import.meta.url),'utf8');
const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('Quote engine compiles and keeps public API',()=>{
  const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
  vm.createContext(ctx.globalThis);vm.runInContext(js,ctx.globalThis);
  assert(ctx.globalThis.RUNLUQuoteV0403);
});

test('iPhone detection activates native cell path',()=>{
  assert(js.includes('const touchIOS='));
  assert(js.includes('/iPhone|iPad|iPod/i.test(ua)'));
  assert(js.includes("navigator.maxTouchPoints>1"));
});

test('iPhone entry path remains directly editable with native focusable controls',()=>{
  assert(js.includes('data-q403-line='));
  assert(js.includes('enterkeyhint="next"'));
  assert(js.includes('q403iosInput')||js.includes('contenteditable="true"')||js.includes('q403mobileInput'));
});

test('Numeric native cells request decimal keyboard',()=>{
  assert(js.includes("numeric?'decimal':'text'"));
  assert(js.includes('q403numCell'));
});

test('iPhone editor preserves native Safari tap-to-keyboard behavior',()=>{
  assert(js.includes('q403iosInput')||js.includes('contenteditable="true"')||js.includes('q403mobileInput'));
  assert.equal(js.includes("x.addEventListener('touchend'"),false);
  assert.equal(js.includes('e.preventDefault();x.focus'),false);
});

test('Native cell edits still update the shared quote draft and totals',()=>{
  assert(js.includes('draft=updateLine(draft,x.dataset.q403Line,x.dataset.id,x.dataset.key,editValue(x))'));
  assert(js.includes('renderSummaryAndPreview()'));
  assert(js.includes('data-q403-total'));
});

test('Enter advances between native cells',()=>{
  assert(js.includes("if(e.key==='Enter')"));
  assert(js.includes('focusNextCell(x)'));
});

test('iPhone hint exposes active native editor for real-device verification',()=>{
  assert(js.includes('iPhone Grid Entry active')||js.includes('iPhone Native Cell Editor active.')||js.includes('iPhone Stacked Entry active'));
});

test('Scrollable wrapper no longer uses iOS momentum-scroller mode',()=>{
  assert(html.includes('-webkit-overflow-scrolling:auto'));
  assert.equal(html.includes('-webkit-overflow-scrolling:touch'),false);
});

test('Native editable cells permit direct text selection and manipulation',()=>{
  assert(html.includes('.q403editCell{'));
  assert(html.includes('-webkit-user-select:text'));
  assert(html.includes('touch-action:manipulation'));
});

test('Native mobile sheet removes sticky Description interference',()=>{
  assert(html.includes('.q403nativeSheet .sticky-desc{position:static!important'));
  assert(js.includes("descHead=touchIOS?'':'sticky-desc'"));
});

test('Page requests V0.4.03d script token',()=>{
  assert(/quote-dual-entry-v0403\.js\?v=0403[defh]/.test(html));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);