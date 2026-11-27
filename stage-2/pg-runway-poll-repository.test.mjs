import test from 'node:test';
import assert from 'node:assert/strict';
import {PgRunwayPollRepository} from './pg-runway-poll-repository.mjs';
function pool(rows=[{id:'attempt'}]){const calls=[];return {calls,query:async(sql,args)=>{calls.push({sql,args});return {rows}}};}
test('records pending state without leaking output URLs',async()=>{const p=pool();await new PgRunwayPollRepository(p).recordTaskState('t','WAITING',[]);assert.deepEqual(p.calls[0].args,['t','WAITING']);});
test('records ingest-ready state but not signed URL',async()=>{const p=pool();await new PgRunwayPollRepository(p).recordTaskState('t','READY_FOR_INGEST',['https://provider.invalid/signed-secret']);assert.equal(JSON.stringify(p.calls).includes('signed-secret'),false);});
test('rejects missing output for ingest',async()=>{const p=pool();await assert.rejects(new PgRunwayPollRepository(p).recordTaskState('t','READY_FOR_INGEST',[]));assert.equal(p.calls.length,0);});
test('rejects unknown state',async()=>{const p=pool();await assert.rejects(new PgRunwayPollRepository(p).recordTaskState('t','OTHER',[]));});
test('rejects missing database attempt',async()=>{await assert.rejects(new PgRunwayPollRepository(pool([])).recordTaskState('t','WAITING',[]),/not eligible/);});
