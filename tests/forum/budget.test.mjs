import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

test('real Postgres budget, concurrency, permissions and cross-midnight accounting', async t => {
 const url=process.env.TEST_DATABASE_URL;
 const engine=url?null:new PGlite();
 const db=url?new pg.Client({connectionString:url}):{
   async query(sql,params){
     if(!params && sql.split(';').filter(x=>x.trim()).length>1){const r=await engine.exec(sql);return r.at(-1);}
     return engine.query(sql,params);
   },
   end:()=>engine.close(),
 };
 try {
 if(url)await db.connect();
 await db.query('create role anon; create role authenticated; create role service_role; create table public.forum_ai_usage(usage_date date,estimated_cost_usd numeric);');
 await db.query(await fs.readFile(new URL('../../supabase/schema/forum-ai-budget-v2.sql',import.meta.url),'utf8'));
 const reserve=async(client,calls=1,conn=db)=>(await conn.query('select public.forum_ai_reserve_v2($1,$2) r',[client,calls])).rows[0].r;
 const finish=async id=>db.query('select public.forum_ai_finish_v2($1)',[id]);
 const reset=()=>db.query('truncate forum_ai_private.batches,forum_ai_private.health,public.forum_ai_usage');
 const key='a'.repeat(64);
 await t.test('20 independent connections atomically admit exactly one active discussion',{skip:!url},async()=>{
  const clients=Array.from({length:20},()=>new pg.Client({connectionString:url}));
  await Promise.all(clients.map(c=>c.connect()));
  try{const r=await Promise.all(clients.map((c,i)=>reserve(i.toString(16).padStart(64,'0'),4,c)));
  assert.equal(r.filter(x=>x.id).length,1);assert.equal(r.filter(x=>x.error==='FORUM_BUSY').length,19);
  }finally{await Promise.all(clients.map(c=>c.end()));}
 });
 await t.test('actual budget gate blocks at $2.00, including legacy spending',async()=>{
  await reset();await db.query("insert into public.forum_ai_usage values ((now() at time zone 'UTC')::date,1.95)");
  const a=await reserve(key);assert.ok(a.id);await finish(a.id);
  assert.equal((await reserve('b'.repeat(64))).error,'DAILY_BUDGET_EXHAUSTED');
  const s=(await db.query('select public.forum_ai_status_v2() r')).rows[0].r;assert.equal(s.budget.reserved_usd,2);
 });
 await t.test('lease expiration releases concurrency without refunding spend',async()=>{
  await reset();const a=await reserve(key,6);assert.ok(a.id);
  await db.query("update forum_ai_private.batches set lease_until=now()-interval '1 second'");
  assert.ok((await reserve('b'.repeat(64),6)).id);
  assert.equal((await db.query('select sum(reserved_usd)::text s from forum_ai_private.batches')).rows[0].s,'0.60');
 });
 await t.test('client daily limit enforced on total calls',async()=>{
  await reset();for(let i=0;i<2;i++){const a=await reserve(key,6);assert.ok(a.id);await finish(a.id);}
  assert.equal((await reserve(key)).error,'CLIENT_DAILY_LIMIT');
 });
 await t.test('global per-minute limiter cannot be evaded by changing client ID',async()=>{
  await reset();for(let i=0;i<6;i++){const a=await reserve(i.toString().padStart(64,'a'));assert.ok(a.id);await finish(a.id);}
  assert.equal((await reserve(key)).error,'RATE_LIMITED');
 });
 await t.test('prior-day requests near UTC rollover count against today',async()=>{
  await reset();await db.query("insert into forum_ai_private.batches(created_at,client_hash,calls,reserved_usd,finished) values ((date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')-interval '5 minutes',$1,6,0.30,true)",[key]);
  assert.equal((await db.query('select public.forum_ai_status_v2() r')).rows[0].r.budget.reserved_usd,0.3);
 });
 await t.test('invalid calls and clients cannot bypass server policy',async()=>{
  await reset();for(const calls of [0,-1,7,100]) assert.equal((await reserve(key,calls)).error,'INVALID_RESERVATION');
  assert.equal((await reserve('spoof')).error,'INVALID_RESERVATION');
 });
 await t.test('browser roles cannot invoke RPCs or read private spending',async()=>{
  for(const role of ['anon','authenticated']){
   await db.query(`set role ${role}`);
   try{await assert.rejects(db.query('select public.forum_ai_status_v2()'),/permission denied/);await assert.rejects(db.query('select * from forum_ai_private.batches'),/permission denied/);await assert.rejects(db.query('select public.forum_ai_reserve_v2($1,1)',[key]),/permission denied/);}
   finally{await db.query('reset role');}
  }
 });
 await t.test('health records only follow an active reservation, failure clears verified state',async()=>{
  await reset();const a=await reserve(key);
  await db.query("select public.forum_ai_record_v2($1,'Gemini',true,'{\"input\":30,\"output\":20}',0.001,$2)",[a.id,key]);
  assert.equal((await db.query('select public.forum_ai_status_v2() r')).rows[0].r.verified.Gemini,key);
  await db.query("select public.forum_ai_record_v2($1,'Gemini',false,null,null,$2)",[a.id,key]);
  assert.deepEqual((await db.query('select public.forum_ai_status_v2() r')).rows[0].r.verified,{});
  await finish(a.id);await assert.rejects(db.query("select public.forum_ai_record_v2($1,'Gemini',true,null,null,$2)",[a.id,key]),/Invalid batch/);
 });
 }finally{await db.end();}
});
