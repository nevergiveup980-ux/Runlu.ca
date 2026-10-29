import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const reasoner={window:{}};
vm.createContext(reasoner);
vm.runInContext(fs.readFileSync(new URL('../guanshi-local-reasoner.js',import.meta.url),'utf8'),reasoner);
for(const language of ['en','zh','fr','es']){
  const fields={question:'?',facts:'Unknown',options:'Wait',constraints:'Unknown',horizon:'Unknown'};
  const r=reasoner.window.GUANSHI_LOCAL_REASONER.analyze({language,fields});
  assert.equal(r.completeness,100);
  assert.ok(!['low','低','faible','baja'].includes(r.uncertainty));
  assert.ok(!/Multiple alternatives are available|存在多个备选方案|Plusieurs alternatives existent|Hay varias alternativas/.test(r.text));
  const multiple=reasoner.window.GUANSHI_LOCAL_REASONER.analyze({language,fields:{...fields,options:'Wait\nPilot'}});
  assert.match(multiple.text,/Multiple alternatives are available|存在多个备选方案|Plusieurs alternatives existent|Hay varias alternativas/);
}
// Exercise the production functions without a browser or a cloud request.
const source=fs.readFileSync(new URL('../guanshi-validation.js',import.meta.url),'utf8');
const names=['canonicalOriginal','brierFor','consultationSnapshot','renderMetrics'];
const functions=names.map(name=>{
  const match=source.match(new RegExp('  function '+name+'\\([^]*?\\n  \\}'));
  assert.ok(match,`Missing production function ${name}`); return match[0];
}).join('\n');
let session=null;
const ctx={clean:v=>String(v??'').trim(),sessionStorage:{getItem:()=>session},LAST_KEY:'test',metricsBox:{innerHTML:''},esc:String,t:()=>({})};
vm.createContext(ctx);vm.runInContext(functions,ctx);
const c={id:'test',type:'binary',predicted_outcome:'yes',confidence:80,reviews:[{status:'final',actual_outcome:'yes'},{status:'final',actual_outcome:'no'}]};
ctx.renderMetrics([c]);
assert.deepEqual([...ctx.metricsBox.innerHTML.matchAll(/<b>(.*?)<\/b>/g)].map(x=>x[1]),['1','1','1','0%','0.640']);
c.reviews.push({status:'interim',actual_outcome:'yes'});ctx.renderMetrics([c]);assert.match(ctx.metricsBox.innerHTML,/0.640/);
c.reviews.push({status:'final',actual_outcome:'unknown'});ctx.renderMetrics([c]);assert.ok(!ctx.metricsBox.innerHTML.includes('0.640'));
const old={id:'legacy',created_at:'2026-01-01',route:'general',type:'binary',question:'Q',claim:'C',predicted_outcome:'yes',confidence:80,review_date:'2026-02-01',stakes:'low',recommendation:'A',reasons:'R',counterargument:'B',falsifier:'F',source_consultation:'Text'};
assert.equal(ctx.canonicalOriginal(old),JSON.stringify(old),'Legacy fingerprint payload must remain byte-identical');
session=JSON.stringify({full_text:'Text',question:'Q',mode:'general',knowledge_version:'kb1',fields:{facts:'reported'},local_baseline:{version:'engine1'},knowledge_used:[{id:'node',source:'source'}]});
const snapshot=ctx.consultationSnapshot('Text','Q','general');assert.equal(snapshot.engine_version,'engine1');assert.equal(snapshot.knowledge_version,'kb1');
assert.equal(ctx.consultationSnapshot('Edited','Q','general'),null);assert.equal(ctx.consultationSnapshot('Text','Other','general'),null);assert.equal(ctx.consultationSnapshot('Text','Q','traditional'),null);
const frozen={...old,consultation_snapshot:snapshot};const before=ctx.canonicalOriginal(frozen);snapshot.fields.facts='changed';assert.notEqual(ctx.canonicalOriginal(frozen),before);
session='invalid';assert.equal(ctx.consultationSnapshot('Text','Q','general'),null);
console.log('GUANSHI evidence checks passed: four languages, option count, per-case final scoring, legacy fingerprints, snapshot matching and integrity.');
