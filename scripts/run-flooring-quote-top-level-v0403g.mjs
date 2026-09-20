import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const release=fs.readFileSync(new URL('flooring/index-v0403-release.html',root),'utf8');
const quote=fs.readFileSync(new URL('flooring/index-v0403-quote.html',root),'utf8');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('iPhone Quote leaves the release iframe and opens top-level',()=>{
  assert(release.includes("if(mobileSafe&&v==='quote')"));
  assert(release.includes("location.assign(q)"));
  assert(release.includes("mobile=top"));
});
test('Desktop Quote path remains available in the normal views map',()=>{
  assert(release.includes("quote:'index-v0403-quote.html?prod=1&release=0403'"));
});
test('Core and Operations still use the release iframe path',()=>{
  assert(release.includes("frame.src=views[v]+sep+'t='+cacheToken"));
});
test('Top-level Quote page has its own mobile navigation',()=>{
  assert(quote.includes('id="q403MobileNav"'));
  assert(quote.includes('index-v0403-release.html?view=core'));
  assert(quote.includes('index-v0403-release.html?view=operations'));
});
test('Top-level mode is explicit and diagnostic',()=>{
  assert(quote.includes("q.get('mobile')==='top'"));
  assert(/TOP-LEVEL iPHONE QUOTE · NO IFRAME · V0\.4\.03[gh]/.test(quote));
  assert(quote.includes("data-runlu-quote-top-level"));
});
test('Quote still loads the proven V0.4.03f native grid engine',()=>{
  assert(/quote-dual-entry-v0403\.js\?v=0403[fh]/.test(quote));
});
test('No sandboxed iframe is introduced on the Quote page',()=>{
  assert.equal(quote.includes('<iframe'),false);
});
test('Release shell marks mobile build V0.4.03g SAFE',()=>{
  assert(release.includes("'V0.4.03g SAFE'"));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
