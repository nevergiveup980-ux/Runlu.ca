import test from 'node:test';
import assert from 'node:assert/strict';
import { BudgetLedger } from './ledger.mjs';
test('reserves and settles integer cents', () => {
 const l = new BudgetLedger(); l.create('job', 1000); l.reserve('job','attempt1',600);
 assert.equal(l.snapshot('job').reservedCents,600);
 l.settle('job','attempt1',450);
 assert.deepEqual([l.snapshot('job').spentCents,l.snapshot('job').reservedCents],[450,0]);
});
test('prevents overspending across concurrent reservations', () => {
 const l=new BudgetLedger();l.create('job',1000);l.reserve('job','a',600);
 assert.throws(()=>l.reserve('job','b',500),/Budget exceeded/);
});
test('does not allow duplicate attempt ids',()=>{
 const l=new BudgetLedger();l.create('job',1000);l.reserve('job','a',100);
 assert.throws(()=>l.reserve('job','a',100),/Duplicate attempt/);
});
test('overbilling keeps reservation for reconciliation',()=>{
 const l=new BudgetLedger();l.create('job',1000);l.reserve('job','a',100);
 assert.throws(()=>l.settle('job','a',101),/reconciliation/);
 assert.equal(l.snapshot('job').reservedCents,100);
});
test('negative and fractional money rejected',()=>{
 const l=new BudgetLedger();assert.throws(()=>l.create('job',10.5));l.create('job',100);
 assert.throws(()=>l.reserve('job','a',1.5));
});
test('snapshot cannot change ledger',()=>{
 const l=new BudgetLedger();l.create('job',100);const s=l.snapshot('job');s.events.push({type:'fake'});
 assert.equal(l.snapshot('job').events.length,0);
});
