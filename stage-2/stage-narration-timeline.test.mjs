import test from 'node:test';
import assert from 'node:assert/strict';
import {planStageStoryboard} from './stage-storyboard-planner.mjs';
import {alignStageNarration} from './stage-narration-timeline.mjs';
import {stageSubtitlesToSrt} from './stage-subtitles.mjs';
const plan=planStageStoryboard({title:'Narrated story',targetMinutes:0.5,scenes:[
 {description:'First',durationSeconds:10,narration:'欢迎来到润庐'},
 {description:'Second',durationSeconds:20,narration:'Welcome to RUNLU'}
]});
test('uses measured voice duration rather than entire scene for SRT',()=>{
 const result=alignStageNarration({scenes:plan.scenes,voiceTracks:[
  {sceneId:'scene_001',assetId:'voice_1',durationSeconds:4.25,language:'zh'},
  {sceneId:'scene_002',assetId:'voice_2',durationSeconds:8.5,language:'en'}
 ]});
 assert.equal(result.subtitleCues[0].endSeconds,4.25);
 assert.equal(result.subtitleCues[1].startSeconds,10);
 assert.equal(result.subtitleCues[1].endSeconds,18.5);
 const srt=stageSubtitlesToSrt(result.subtitleCues);
 assert.match(srt,/00:00:04,250/);assert.match(srt,/00:00:18,500/);
});
test('rejects narration longer than its scene',()=>{
 assert.throws(()=>alignStageNarration({scenes:plan.scenes,voiceTracks:[
  {sceneId:'scene_001',assetId:'voice_1',durationSeconds:11},
  {sceneId:'scene_002',assetId:'voice_2',durationSeconds:2}
 ]}),/exceeds scene/);
});
test('rejects missing audio, duplicate tracks and unknown scene IDs',()=>{
 assert.throws(()=>alignStageNarration({scenes:plan.scenes,voiceTracks:[]}),/Missing narration/);
 assert.throws(()=>alignStageNarration({scenes:plan.scenes,voiceTracks:[
  {sceneId:'scene_001',assetId:'a',durationSeconds:2},
  {sceneId:'scene_001',assetId:'b',durationSeconds:2}
 ]}),/duplicate/);
 assert.throws(()=>alignStageNarration({scenes:plan.scenes,voiceTracks:[
  {sceneId:'scene_001',assetId:'a',durationSeconds:2},
  {sceneId:'scene_002',assetId:'b',durationSeconds:2},
  {sceneId:'scene_003',assetId:'c',durationSeconds:2}
 ]}),/Unknown/);
});
