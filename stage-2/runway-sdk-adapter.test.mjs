import test from 'node:test';
import assert from 'node:assert/strict';
import {createRunwaySdkAdapter} from './runway-sdk-adapter.mjs';
const valid={model:'gen4_turbo',promptImage:'https://example.org/image.jpg',promptText:'A gentle camera move',ratio:'1280:720',duration:5};
function setup(){const calls=[];const sdk={imageToVideo:{create:async x=>{calls.push(['create',x]);return {id:'task-1'}}},tasks:{retrieve:async x=>{calls.push(['retrieve',x]);return {id:x,status:'PENDING'}}}};return {calls,adapter:createRunwaySdkAdapter(sdk)};}
test('creates image-to-video task through injected SDK',async()=>{const s=setup();assert.deepEqual(await s.adapter.createTask(valid),{id:'task-1'});assert.deepEqual(s.calls[0][1],valid);});
test('drops unexpected frontend properties',async()=>{const s=setup();await s.adapter.createTask({...valid,apiKey:'must-not-forward',cost:0});assert.equal('apiKey' in s.calls[0][1],false);});
test('rejects invalid image URLs before paid call',async()=>{const s=setup();await assert.rejects(s.adapter.createTask({...valid,promptImage:'file:///tmp/a.jpg'}));assert.equal(s.calls.length,0);});
test('rejects invalid duration before paid call',async()=>{const s=setup();await assert.rejects(s.adapter.createTask({...valid,duration:100}));assert.equal(s.calls.length,0);});
test('retrieves existing task',async()=>{const s=setup();assert.equal((await s.adapter.getTask('task-1')).status,'PENDING');assert.deepEqual(s.calls[0],['retrieve','task-1']);});
test('rejects SDK with missing methods',()=>{assert.throws(()=>createRunwaySdkAdapter({}),/SDK/);});
test('rejects missing task ID from provider',async()=>{const sdk={imageToVideo:{create:async()=>({})},tasks:{retrieve:async()=>({})}};await assert.rejects(createRunwaySdkAdapter(sdk).createTask(valid),/task ID/);});
