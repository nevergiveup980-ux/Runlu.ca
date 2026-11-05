import test from 'node:test';
import assert from 'node:assert/strict';
import {createDramaEpisodePlan,updateDramaShot} from './episode-plan.mjs';
const input={title:'Pilot',sourceChapterIds:['chapter_001'],targetSeconds:180,
 shots:[{description:'The door opens',durationSeconds:90,dialogue:[{characterId:'lead',text:'Who is there?'}]},
 {description:'A figure enters',durationSeconds:90,dialogue:[]}]};
test('three-minute plan produces timed editable shots without provider calls',()=>{
 const p=createDramaEpisodePlan(input);
 assert.equal(p.totalSeconds,180);assert.equal(p.shots[1].startSeconds,90);
 assert.equal(p.reviewStatus,'DRAFT');assert.equal(p.shots[0].status,'DRAFT');
 assert.equal(updateDramaShot(p,{shotId:'shot_001',description:'A locked door opens'}).shots[0].description,'A locked door opens');
});
test('reject invalid shots and duplicate identifiers',()=>{
 assert.throws(()=>createDramaEpisodePlan({...input,shots:[{...input.shots[0],durationSeconds:0}]}));
 assert.throws(()=>createDramaEpisodePlan({...input,shots:input.shots.map(s=>({...s,id:'same'}))}));
 assert.throws(()=>createDramaEpisodePlan({...input,shots:[{...input.shots[0],dialogue:[{characterId:'lead',text:''}]}]}));
});
test('editing requires draft review status',()=>{
 const p=createDramaEpisodePlan(input);p.reviewStatus='APPROVED';
 assert.throws(()=>updateDramaShot(p,{shotId:'shot_001',description:'changed'}));
});
