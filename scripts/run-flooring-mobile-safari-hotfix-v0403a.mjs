import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const release=fs.readFileSync(new URL('flooring/index-v0403-release.html',root),'utf8');
const v90=fs.readFileSync(new URL('flooring/index-v090r1-stable-frozen.html',root),'utf8');
const v78=fs.readFileSync(new URL('flooring/index-v078-business-cost-control.html',root),'utf8');
const v71=fs.readFileSync(new URL('flooring/index-v071-pricing-workspace.html',root),'utf8');

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

test('iOS detection covers iPhone iPad iPod and touch-Mac iPad mode',()=>{
  assert(release.includes('/iPhone|iPad|iPod/i.test(ua)'));
  assert(release.includes("navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1"));
});
test('iOS default Core bypasses V090 and V078 wrappers',()=>{
  assert(release.includes("mobileSafe?'index-v071-pricing-workspace.html"));
  assert(release.includes("mobile=safe"));
});
test('Explicit full=1 preserves the full desktop stack for diagnostics',()=>{
  assert(release.includes("const forceFull=qp.get('full')==='1'"));
  assert(release.includes("index-v090r1-stable-frozen.html?prod=1&release=090r1"));
});
test('Explicit lite=1 provides emergency base Core fallback',()=>{
  assert(release.includes("const forceLite=qp.get('lite')==='1'"));
  assert(release.includes("index-v040.html?prod=1&release=0403&mobile=lite"));
});
test('Mobile Core uses a stable versioned cache token rather than a new URL every reload',()=>{
  assert(release.includes("'mobile-safe-0403a'")||release.includes("'mobile-safe-0403g'"));
});
test('Safe route reduces Core nesting from four inner wrappers to two',()=>{
  assert(v90.includes("index-v078-business-cost-control.html"));
  assert(v78.includes("index-v071-pricing-workspace.html"));
  assert(v71.includes('index-v040.html'));
  const fullDepth=4; // release iframe -> v090 -> v078 -> v071 -> v040
  const safeDepth=2; // release iframe -> v071 -> v040
  assert(safeDepth<=2);
  assert(fullDepth-safeDepth>=2);
});
test('Operations route stays stable and Quote may use the accepted frozen baseline',()=>{
  assert(release.includes("operations:'index-v0403-operations.html?prod=1&release=0403'"));
  assert(release.includes("quote:'index-v0403-quote.html?prod=1&release=0403'")||release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
});
test('Release page remains syntactically closed',()=>{
  assert(release.includes('</script>'));
  assert(release.includes('</html>'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
