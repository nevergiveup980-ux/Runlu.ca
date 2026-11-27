import test from 'node:test';
import assert from 'node:assert/strict';
import {planStageStoryboard} from './stage-storyboard-planner.mjs';
test('plans sequential scenes and MP4 export without rendering',()=>{
 const result=planStageStoryboard({title:'Our Story',targetMinutes:1,scenes:[
  {description:'Opening photo',durationSeconds:20,narration:'Welcome'},
  {description:'Second scene',durationSeconds:40}
 ]});
 assert.equal(result.totalSeconds,60);
 assert.equal(result.withinTarget,true);
 assert.deepEqual(result.scenes.map(s=>[s.startSeconds,s.endSeconds]),[[0,20],[20,60]]);
 assert.equal(result.export.status,'NOT_RENDERED');
});
test('rejects excessive length and invalid scene duration',()=>{
 assert.throws(()=>planStageStoryboard({title:'Long',scenes:Array.from({length:10},()=>({description:'Shot',durationSeconds:100}))}),/15-minute/);
 assert.throws(()=>planStageStoryboard({title:'Bad',scenes:[{description:'Shot',durationSeconds:-1}]}),/Invalid scene/);
});
test('supports portrait output and optional source photos',()=>{
 const result=planStageStoryboard({title:'Vertical',aspectRatio:'9:16',targetMinutes:0.5,scenes:[{description:'Photo',durationSeconds:30,sourceImageId:'image_1'}]});
 assert.equal(result.aspectRatio,'9:16');assert.equal(result.scenes[0].sourceImageId,'image_1');
});
