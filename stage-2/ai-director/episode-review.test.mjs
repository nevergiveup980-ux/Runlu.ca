import test from 'node:test';
import assert from 'node:assert/strict';
import {createDramaEpisodePlan} from './episode-plan.mjs';
import {createCharacterBible} from './character-bible.mjs';
import {prepareEpisodeReview,approveEpisodeReview,createApprovedShotJobs} from './episode-review.mjs';
const plan=()=>createDramaEpisodePlan({title:'Pilot',sourceChapterIds:['chapter_001'],targetSeconds:60,
 shots:[{description:'The locked door',durationSeconds:60,characterIds:['lead'],
 dialogue:[{characterId:'lead',text:'Open the door.'}]}]});
const bible=()=>createCharacterBible({characters:[{id:'lead',name:'Lead',visualPrompt:'Dark coat and brown hair'}]});
test('approved episode creates ready jobs with locked character revision references',()=>{
 const review=prepareEpisodeReview({plan:plan(),bible:bible()});
 assert.equal(review.reviewStatus,'AWAITING_REVIEW');
 assert.throws(()=>createApprovedShotJobs({approval:review}));
 const approved=approveEpisodeReview({review,reviewerId:'editor',approvedShotIds:['shot_001']});
 const jobs=createApprovedShotJobs({approval:approved,plan:plan(),bible:bible()});
 assert.equal(jobs[0].state,'READY');
 assert.deepEqual(jobs[0].characterRevisionIds,['lead_v1']);
});
test('reject missing character references and unreviewed shots',()=>{
 const p=plan();p.shots[0].dialogue[0].characterId='missing';
 assert.throws(()=>prepareEpisodeReview({plan:p,bible:bible()}));
 const review=prepareEpisodeReview({plan:plan(),bible:bible()});
 assert.throws(()=>approveEpisodeReview({review,reviewerId:'editor',approvedShotIds:[]}));
});
test('reject duration outside target tolerance',()=>{
 const p=plan();p.withinTarget=false;
 assert.throws(()=>prepareEpisodeReview({plan:p,bible:bible()}));
});

test('approved content digest rejects modified dialogue and character appearance',()=>{
 const originalPlan=plan(),originalBible=bible();
 const review=prepareEpisodeReview({plan:originalPlan,bible:originalBible});
 const approval=approveEpisodeReview({review,reviewerId:'editor',approvedShotIds:['shot_001']});
 assert.equal(createApprovedShotJobs({approval,plan:originalPlan,bible:originalBible}).length,1);
 const changedPlan=plan();changedPlan.shots[0].dialogue[0].text='Different dialogue';
 assert.throws(()=>createApprovedShotJobs({approval,plan:changedPlan,bible:originalBible}));
 const changedBible={...bible(),characters:[{...bible().characters[0],visualPrompt:'Changed appearance'}]};
 assert.throws(()=>createApprovedShotJobs({approval,plan:originalPlan,bible:changedBible}));
 assert.throws(()=>createApprovedShotJobs({approval}));
});
