import test from 'node:test';
import assert from 'node:assert/strict';
import {pollRunwayTask} from './runway-poll-service.mjs';
function setup(raw){const events=[];return {events,provider:{getTask:async id=>{events.push('poll');return raw;}},repository:{recordTaskState:async (...args)=>events.push(args)}};}
test('pending task is persisted and returned without URL',async()=>{const s=setup({id:'t1',status:'RUNNING'});const r=await pollRunwayTask({...s,providerTaskId:'t1'});assert.equal(r.state,'WAITING');assert.deepEqual(s.events,['poll',['t1','WAITING',[]]]);});
test('successful task keeps temporary URL internal',async()=>{const s=setup({id:'t1',status:'SUCCEEDED',output:['https://example.com/private.mp4']});const r=await pollRunwayTask({...s,providerTaskId:'t1'});assert.equal(r.requiresIngest,true);assert.equal(JSON.stringify(r).includes('private.mp4'),false);assert.equal(s.events[1][2][0],'https://example.com/private.mp4');});
test('mismatched task IDs cannot be recorded',async()=>{const s=setup({id:'other',status:'RUNNING'});await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/mismatch/);assert.equal(s.events.length,1);});
test('invalid output URLs fail closed',async()=>{const s=setup({id:'t1',status:'SUCCEEDED',output:['http://bad.example']});await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/Invalid output/);});
test('database failure does not report success',async()=>{const s=setup({id:'t1',status:'RUNNING'});s.repository.recordTaskState=async()=>{throw Error('db offline')};await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/db offline/);});
test('invalid dependencies are rejected',async()=>{await assert.rejects(pollRunwayTask({providerTaskId:'t1'}),/Dependencies/);});
