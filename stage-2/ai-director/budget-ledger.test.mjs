import test from 'node:test';
import assert from 'node:assert/strict';
import {DramaBudgetLedger} from './budget-ledger.mjs';
test('requires explicit user confirmation and reserves each attempt once',()=>{
 const l=new DramaBudgetLedger({budgetCents:1000});
 assert.throws(()=>l.reserve({attemptId:'a1',shotId:'s1',estimateCents:600}));
 l.confirm();l.reserve({attemptId:'a1',shotId:'s1',estimateCents:600});
 l.reserve({attemptId:'a1',shotId:'s1',estimateCents:600});
 assert.equal(l.summary.reservedCents,600);
 assert.throws(()=>l.reserve({attemptId:'a2',shotId:'s2',estimateCents:500}));
});
test('submitted uncertain attempts hold budget and cannot be retried',()=>{
 const l=new DramaBudgetLedger({budgetCents:1000});l.confirm();
 l.reserve({attemptId:'a1',shotId:'s1',estimateCents:700});l.submit('a1');l.markUnknown('a1');
 assert.equal(l.summary.availableCents,300);
 assert.throws(()=>l.retry({priorAttemptId:'a1',attemptId:'a2',estimateCents:100}));
 l.settle({attemptId:'a1',chargedCents:650});
 assert.equal(l.summary.availableCents,350);
 l.retry({priorAttemptId:'a1',attemptId:'a2',estimateCents:200});
 assert.equal(l.summary.reservedCents,200);
});
test('unsubmitted reservations may be released without a charge',()=>{
 const l=new DramaBudgetLedger({budgetCents:100});l.confirm();
 l.reserve({attemptId:'a1',shotId:'s1',estimateCents:100});l.release('a1');
 assert.equal(l.summary.availableCents,100);
 assert.throws(()=>l.submit('a1'));
});
test('reject over-budget settlement and attempt identity collisions',()=>{
 const l=new DramaBudgetLedger({budgetCents:100});l.confirm();
 l.reserve({attemptId:'a1',shotId:'s1',estimateCents:60});
 assert.throws(()=>l.reserve({attemptId:'a1',shotId:'other',estimateCents:60}));
 assert.throws(()=>l.settle({attemptId:'a1',chargedCents:101}));
});
