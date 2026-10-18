// Runs only with STAGE_TEST_DATABASE_URL and pg installed. Uses disposable DB.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {PgJobSubmitter} from './pg-submit.mjs';
import {PgJobOperations} from './pg-job-operations.mjs';
import {PgBudgetRepository} from './pg-budget-repository.mjs';
import {PgRecovery} from './pg-recovery.mjs';
import {randomUUID} from 'node:crypto';
const url=process.env.STAGE_TEST_DATABASE_URL;
test('real PostgreSQL: idempotency, claim, budget, settle and recovery', {skip:!url?'Set STAGE_TEST_DATABASE_URL':false}, async()=>{
 const {Pool}=createRequire(import.meta.url)('pg');
 const pool=new Pool({connectionString:url,max:5});
 try{
  await pool.query(await readFile(new URL('./persistence-schema.sql',import.meta.url),'utf8'));
  await pool.query(await readFile(new URL('./002_attempts.sql',import.meta.url),'utf8'));
  // Database must reject budget totals that exceed their cap, including at BIGINT boundaries.
  const boundaryJob=randomUUID(),boundaryOwner=randomUUID();
  await pool.query(`INSERT INTO stage_jobs(id,owner_id,idempotency_key,request_json,status,budget_cents,spent_cents,reserved_cents)
   VALUES($1,$2,$3,'{}'::jsonb,'QUEUED',9223372036854775807,9223372036854775806,1)`,
   [boundaryJob,boundaryOwner,randomUUID()]);
  await assert.rejects(pool.query('UPDATE stage_jobs SET reserved_cents=2 WHERE id=$1',[boundaryJob]),/check constraint|violates/i);
  const boundary=(await pool.query('SELECT reserved_cents FROM stage_jobs WHERE id=$1',[boundaryJob])).rows[0];
  assert.equal(Number(boundary.reserved_cents),1);
  // Keep the numeric boundary fixture out of the claimable queue.
  await pool.query('UPDATE stage_jobs SET status=$2 WHERE id=$1',[boundaryJob,'FAILED']);
  const ownerId=randomUUID(),key=randomUUID();
  const input={ownerId,idempotencyKey:key,brief:{durationSeconds:30,quality:'standard',format:'cinematic'},budgetCents:1000};
  const submit=new PgJobSubmitter(pool);
  const first=await submit.submit(input),second=await submit.submit(input);
  assert.equal(first.created,true);assert.deepEqual(second,{id:first.id,created:false});
  await assert.rejects(submit.submit({...input,brief:{...input.brief,durationSeconds:40}}),/different request/);
  // Concurrent duplicate submissions must return exactly one durable job.
  const concurrentInput={...input,idempotencyKey:randomUUID()};
  const simultaneous=await Promise.all(Array.from({length:5},()=>submit.submit(concurrentInput)));
  assert.equal(simultaneous.filter(x=>x.created).length,1);
  assert.equal(new Set(simultaneous.map(x=>x.id)).size,1);
  const jobs=new PgJobOperations(pool);
  const [a,b]=await Promise.all([jobs.claim('worker-a'),jobs.claim('worker-b')]);
  assert.ok(a?.id && b?.id,'two queued jobs should be claimed');
  assert.notEqual(a.id,b.id,'concurrent workers must never claim the same job');
  assert.deepEqual(new Set([a.id,b.id]),new Set([first.id,simultaneous[0].id]));
  assert.equal(await jobs.claim('worker-c'),null,'no queued jobs remain');
  const worker=a.id===first.id?'worker-a':'worker-b';
  // Concurrent reservations against one remaining budget: exactly one can win.
  const secondJob=simultaneous[0].id;
  const secondWorker=a.id===secondJob?'worker-a':'worker-b';
  const budgetRepo=new PgBudgetRepository(pool);
  const competing=await Promise.allSettled([
    budgetRepo.reserve(secondJob,secondWorker,randomUUID(),'mock',600),
    budgetRepo.reserve(secondJob,secondWorker,randomUUID(),'mock',600)
  ]);
  assert.equal(competing.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(competing.filter(x=>x.status==='rejected').length,1);
  const secondTotals=(await pool.query('SELECT reserved_cents,attempt_count FROM stage_jobs WHERE id=$1',[secondJob])).rows[0];
  assert.equal(Number(secondTotals.reserved_cents),600);
  assert.equal(secondTotals.attempt_count,1);
  const attemptId=randomUUID();
  await new PgBudgetRepository(pool).reserve(first.id,worker,attemptId,'mock',600);
  await assert.rejects(new PgBudgetRepository(pool).reserve(first.id,worker,randomUUID(),'mock',500),/Budget or lease/);
  assert.deepEqual(await jobs.settle(first.id,attemptId,450),{chargedCents:450,releasedCents:150});
  const row=(await pool.query('SELECT spent_cents,reserved_cents FROM stage_jobs WHERE id=$1',[first.id])).rows[0];
  assert.equal(Number(row.spent_cents),450);assert.equal(Number(row.reserved_cents),0);
  const audit=(await pool.query('SELECT event_type FROM stage_job_events WHERE job_id=$1 ORDER BY id',[first.id])).rows.map(x=>x.event_type);
  assert.deepEqual(audit,['BUDGET_RESERVED','BUDGET_SETTLED']);
  const attempts=(await pool.query('SELECT attempt_count FROM stage_jobs WHERE id=$1',[first.id])).rows[0];
  assert.equal(attempts.attempt_count,1);
  await pool.query("UPDATE stage_jobs SET lease_until=NOW()-INTERVAL '1 minute' WHERE id=$1",[first.id]);
  assert.deepEqual(await new PgRecovery(pool).quarantineExpired(),[first.id]);
  const state=(await pool.query('SELECT status FROM stage_jobs WHERE id=$1',[first.id])).rows[0];
  assert.equal(state.status,'RECONCILIATION_REQUIRED');
 }finally{await pool.end();}
});
