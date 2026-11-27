import test from 'node:test';
import assert from 'node:assert/strict';
import {createGlassThronePilot} from './glass-throne-pilot.mjs';
test('Glass Throne opening is a contiguous 180-second drama draft',()=>{
 const plan=createGlassThronePilot();
 assert.equal(plan.totalSeconds,180);
 assert.equal(plan.aspectRatio,'16:9');
 assert.equal(plan.shots.length,8);
 assert.equal(plan.reviewStatus,'DRAFT');
 let cursor=0;
 for(const shot of plan.shots){
  assert.equal(shot.startSeconds,cursor);
  cursor=shot.endSeconds;
 }
 assert.equal(cursor,180);
 assert.ok(plan.shots.some(s=>s.dialogue.some(l=>l.characterId==='richard'&&l.text.includes('step down'))));
 assert.ok(plan.shots.some(s=>s.dialogue.some(l=>l.characterId==='daniel')));
});
