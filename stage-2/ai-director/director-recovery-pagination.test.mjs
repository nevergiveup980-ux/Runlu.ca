import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRecoveryPageRequest,projectRecoveryPage} from './director-recovery-pagination.mjs';
test('page request defaults to bounded 50 records',()=>{
 assert.deepEqual(parseRecoveryPageRequest('/api/stage/director/recovery?episodeId=ep1'),{episodeId:'ep1',pageSize:50,cursor:null});
});
test('accepts valid bounded pages and opaque cursor',()=>{
 assert.deepEqual(parseRecoveryPageRequest('/api/stage/director/recovery?episodeId=ep1&pageSize=100&cursor=Ab_12-'),{episodeId:'ep1',pageSize:100,cursor:'Ab_12-'});
});
test('rejects oversized, malformed and duplicate-unsafe cursor syntax',()=>{
 for(const query of ['pageSize=101','pageSize=0','pageSize=-1','pageSize=1.5','pageSize=99999999999999999999','cursor=%20','cursor=%2F','cursor='+('a'.repeat(513))]){
  assert.throws(()=>parseRecoveryPageRequest('/api/stage/director/recovery?episodeId=ep1&'+query));
 }
});
test('page projection rejects overfull response and invalid next cursor',()=>{
 assert.throws(()=>projectRecoveryPage({episodeId:'ep1',items:Array(51).fill({}),pageSize:50}));
 assert.throws(()=>projectRecoveryPage({episodeId:'ep1',items:[],pageSize:50,nextCursor:'../'}));
 const page=projectRecoveryPage({episodeId:'ep1',items:[{attemptId:'a1'}],pageSize:50,nextCursor:'opaque_1'});
 assert.equal(page.hasMore,true);
 assert.equal(page.nextCursor,'opaque_1');
 assert.equal(projectRecoveryPage({episodeId:'ep1',items:[],pageSize:50}).hasMore,false);
});
