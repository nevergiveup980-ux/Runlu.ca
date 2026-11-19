import test from 'node:test';
import assert from 'node:assert/strict';
import {signRecoveryCursor,verifyRecoveryCursor} from './director-recovery-cursor.mjs';
const secret='server-side-only-secret-32-bytes-minimum-value';
const after={updatedAt:'2026-11-19T12:00:00.000Z',attemptId:'attempt_2'};
const args={episodeId:'episode_a',secret};
test('signed recovery cursor roundtrips only for its episode',()=>{
 const token=signRecoveryCursor({...args,after,issuedAt:1000});
 assert.deepEqual(verifyRecoveryCursor({...args,token,now:2000}),after);
 assert.throws(()=>verifyRecoveryCursor({...args,episodeId:'episode_b',token,now:2000}));
});
test('tampered and expired cursors fail closed',()=>{
 const token=signRecoveryCursor({...args,after,issuedAt:1000});
 const parts=token.split('.');
 const tampered=parts[0].slice(0,-1)+(parts[0].at(-1)==='A'?'B':'A')+'.'+parts[1];
 assert.throws(()=>verifyRecoveryCursor({...args,token:tampered,now:2000}));
 assert.throws(()=>verifyRecoveryCursor({...args,token,now:1000+900001}));
 assert.throws(()=>verifyRecoveryCursor({...args,token,now:999}));
});
test('rejects weak secrets and malformed tuple',()=>{
 assert.throws(()=>signRecoveryCursor({...args,secret:'weak',after}));
 assert.throws(()=>signRecoveryCursor({...args,after:{...after,attemptId:'bad;id'}}));
 assert.throws(()=>verifyRecoveryCursor({...args,token:'not-a-valid-token'}));
});
