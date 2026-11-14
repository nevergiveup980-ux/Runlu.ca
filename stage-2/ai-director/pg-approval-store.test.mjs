import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorApprovalStore} from './pg-approval-store.mjs';
import {createDramaEpisodePlan} from './episode-plan.mjs';
import {createCharacterBible} from './character-bible.mjs';
import {prepareEpisodeReview,approveEpisodeReview} from './episode-review.mjs';
const plan=createDramaEpisodePlan({title:'Pilot',sourceChapterIds:['chapter_001'],targetSeconds:60,shots:[{description:'Door',durationSeconds:60,characterIds:['lead'],dialogue:[]}]});
const bible=createCharacterBible({characters:[{id:'lead',name:'Lead',visualPrompt:'Black coat'}]});
const review=prepareEpisodeReview({plan,bible});
const approval=approveEpisodeReview({review,reviewerId:'editor',approvedShotIds:['shot_001']});
function mock({failAt=Infinity,duplicate=false}={}){const calls=[];let inserts=0;
 const client={query:async(sql,args=[])=>{calls.push({sql,args});if(sql.startsWith('INSERT')){inserts++;if(inserts===failAt)throw Error('Simulated DB failure');if(duplicate&&inserts===1)return {rows:[]};return {rows:[{episode_id:'pilot_1'}]};}return {rows:[]};},release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
test('atomic approval and job creation commits once',async()=>{
 const m=mock();const result=await new PgDirectorApprovalStore(m.pool).saveApprovedEpisode({episodeId:'pilot_1',approval,plan,bible});
 assert.equal(result.shotCount,1);assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,2);
});
test('partial failure rolls back and releases client',async()=>{
 const m=mock({failAt:2});
 await assert.rejects(new PgDirectorApprovalStore(m.pool).saveApprovedEpisode({episodeId:'pilot_1',approval,plan,bible}));
 assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));assert.equal(m.calls.at(-1).sql,'RELEASE');
});
test('duplicate episode ID fails closed',async()=>{
 const m=mock({duplicate:true});
 await assert.rejects(new PgDirectorApprovalStore(m.pool).saveApprovedEpisode({episodeId:'pilot_1',approval,plan,bible}),/already approved/);
 assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
});
test('changed content is rejected before opening DB transaction',async()=>{
 const m=mock();const changed={...plan,title:'Modified'};
 await assert.rejects(new PgDirectorApprovalStore(m.pool).saveApprovedEpisode({episodeId:'pilot_1',approval,plan:changed,bible}));
 assert.equal(m.calls.length,0);
});
