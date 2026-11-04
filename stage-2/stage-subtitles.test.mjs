import test from 'node:test';
import assert from 'node:assert/strict';
import {planStageStoryboard} from './stage-storyboard-planner.mjs';
import {buildStageSubtitles,stageSubtitlesToSrt} from './stage-subtitles.mjs';
test('generates timed SRT from storyboard narration',()=>{
 const plan=planStageStoryboard({title:'Story',targetMinutes:0.5,scenes:[
  {description:'First',durationSeconds:10,narration:'Welcome to RUNLU'},
  {description:'Second',durationSeconds:20,narration:'Our next scene\\nThe ending'}
 ]});
 const cues=buildStageSubtitles({scenes:plan.scenes});
 assert.equal(cues.length,3);
 assert.equal(cues[1].startSeconds,10);
 assert.equal(cues[2].startSeconds,20);
 const srt=stageSubtitlesToSrt(cues);
 assert.match(srt,/00:00:00,000 --> 00:00:10,000/);
 assert.match(srt,/00:00:20,000 --> 00:00:30,000/);
});
test('rejects overlapping or out-of-bounds cues',()=>{
 assert.throws(()=>buildStageSubtitles({scenes:[{startSeconds:0,endSeconds:901,narration:'No'}]}),/timing/);
 assert.throws(()=>buildStageSubtitles({scenes:[{startSeconds:0,endSeconds:10,narration:'A'},{startSeconds:9,endSeconds:11,narration:'B'}]}),/timing/);
});
test('does not create subtitles for silent scenes',()=>{
 assert.deepEqual(buildStageSubtitles({scenes:[{startSeconds:0,endSeconds:5,narration:''}]}),[]);
});

test('SRT export rejects overlapping and overlong cues even if caller bypasses planner',()=>{
 assert.throws(()=>stageSubtitlesToSrt([
  {startSeconds:0,endSeconds:5,text:'A'},
  {startSeconds:4,endSeconds:6,text:'B'}
 ]),/Invalid subtitle cue/);
 assert.throws(()=>stageSubtitlesToSrt([{startSeconds:899,endSeconds:901,text:'Too late'}]),/Invalid subtitle cue/);
});
test('exports Unicode subtitle text without corruption',()=>{
 const srt=stageSubtitlesToSrt([{startSeconds:0,endSeconds:1.25,text:'润庐 · RUNLU'}]);
 assert.match(srt,/00:00:00,000 --> 00:00:01,250/);
 assert.match(srt,/润庐 · RUNLU/);
});
