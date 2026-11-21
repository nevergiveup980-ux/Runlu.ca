import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('./live-smoke.mjs',import.meta.url));
const environment={...process.env};
delete environment.GEMINI_API_KEY;delete environment.OPENAI_API_KEY;
test('live smoke is opt-in and missing Gemini key fails before any call',()=>{
 const r=spawnSync(process.execPath,[script],{env:environment,encoding:'utf8'});
 assert.equal(r.status,2);assert.equal(r.stdout,'');
 const d=JSON.parse(r.stderr);assert.equal(d.provider_calls,0);assert.deepEqual(d.variables,['GEMINI_API_KEY']);
});
test('dual live smoke requires both keys without displaying configured values',()=>{
 const r=spawnSync(process.execPath,[script,'--dual'],{env:{...environment,GEMINI_API_KEY:'synthetic-test-value-do-not-print'},encoding:'utf8'});
 assert.equal(r.status,2);assert.equal(r.stderr.includes('synthetic-test-value'),false);
 const d=JSON.parse(r.stderr);assert.deepEqual(d.variables,['OPENAI_API_KEY']);assert.equal(d.provider_calls,0);
});
