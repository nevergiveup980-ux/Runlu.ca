import test from 'node:test';
import assert from 'node:assert/strict';
import {projectDirectorDashboard} from './director-dashboard-contract.mjs';
const good=()=>({episodeId:'ep1',budget:{limitCents:1000,committedCents:450,remainingCents:550,paused:false,pauseReason:null},
 shots:[{shotId:'s1',state:'SUCCEEDED',outputAssetId:'asset1'}],
 attempts:[{attemptId:'a1',shotId:'s1',state:'SETTLED',estimateCents:600,chargedCents:450,overBudget:false}],
 alerts:{unknownProviderOutcome:false,overBudgetCharge:false,requiresAttention:false}});
test('projects a valid dashboard without leaking provider task IDs',()=>{
 const s=good();s.attempts[0].providerTaskId='private-provider-id';
 const d=projectDirectorDashboard(s);
 assert.equal(d.progress.completed,1);
 assert.equal(d.budget.remainingCents,550);
 assert.equal(JSON.stringify(d).includes('private-provider-id'),false);
});
test('rejects mismatched budget arithmetic',()=>{
 const s=good();s.budget.remainingCents=999;
 assert.throws(()=>projectDirectorDashboard(s),/budget/);
});
test('rejects unknown state and duplicate shot IDs',()=>{
 const s=good();s.shots[0].state='MAGIC';
 assert.throws(()=>projectDirectorDashboard(s),/shot status/);
 const t=good();t.shots.push({...t.shots[0]});
 assert.throws(()=>projectDirectorDashboard(t),/Duplicate/);
});
test('rejects unreported financial alerts',()=>{
 const s=good();s.attempts[0].overBudget=true;
 assert.throws(()=>projectDirectorDashboard(s),/Inconsistent/);
});
test('accepts negative remaining budget to report overspending',()=>{
 const s=good();s.budget.committedCents=1200;s.budget.remainingCents=-200;
 assert.equal(projectDirectorDashboard(s).budget.remainingCents,-200);
});

test('rejects duplicate attempt identities',()=>{
 const s=good();s.attempts.push({...s.attempts[0]});
 assert.throws(()=>projectDirectorDashboard(s),/Duplicate attempt/);
});
test('rejects attempts referring to missing shots',()=>{
 const s=good();s.attempts[0].shotId='not-present';
 assert.throws(()=>projectDirectorDashboard(s),/Orphan attempt/);
});
test('rejects settled attempts with no charge record',()=>{
 const s=good();s.attempts[0].chargedCents=null;
 assert.throws(()=>projectDirectorDashboard(s),/missing charge/);
});
