#!/usr/bin/env python3
"""Real local PostgreSQL concurrent transaction tests. Requires psycopg[binary]."""
import os, concurrent.futures, uuid
import psycopg

dsn=os.getenv("RUNLU_MUSIC_TEST_DSN","")
if not dsn or not ("localhost" in dsn or "127.0.0.1" in dsn or "/runlu_music_test" in dsn):
    raise SystemExit("Set RUNLU_MUSIC_TEST_DSN to a LOCAL disposable PostgreSQL database.")
u=str(uuid.uuid4())
def sql(query,params=()):
    with psycopg.connect(dsn) as c:
        with c.cursor() as cur:
            cur.execute(query,params)
            return cur.fetchall() if cur.description else None
sql("INSERT INTO music_test.wallets(user_id,credits) VALUES(%s,1)",(u,))
def reserve(key,payload="lyrics",fail=False):
    with psycopg.connect(dsn) as c:
        with c.cursor() as cur:
            cur.execute("SELECT music_test.reserve(%s,%s,%s,%s)",(u,key,payload,fail))
            return cur.fetchone()[0]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
    futures=[ex.submit(reserve,"key-"+str(i).zfill(8)) for i in range(2)]
    outcomes=[]
    for f in futures:
        try: outcomes.append(("ok",f.result()))
        except psycopg.Error as e: outcomes.append(("error",str(e).splitlines()[0]))
assert len([x for x in outcomes if x[0]=="ok"])==1,outcomes
assert len([x for x in outcomes if "INSUFFICIENT_CREDITS" in str(x)])==1,outcomes
assert sql("SELECT credits FROM music_test.wallets WHERE user_id=%s",(u,))[0][0]==0
assert sql("SELECT count(*) FROM music_test.consumptions WHERE user_id=%s",(u,))[0][0]==1
winner=[x[1] for x in outcomes if x[0]=="ok"][0]
key=sql("SELECT request_key FROM music_test.jobs WHERE id=%s",(winner,))[0][0]
assert reserve(key)==winner
try: reserve(key,"changed lyrics");raise AssertionError("collision accepted")
except psycopg.Error as e: assert "IDEMPOTENCY_PAYLOAD_MISMATCH" in str(e)
v=str(uuid.uuid4())
sql("INSERT INTO music_test.wallets(user_id,credits) VALUES(%s,1)",(v,))
try:
    with psycopg.connect(dsn) as c:
        c.execute("SELECT music_test.reserve(%s,%s,%s,true)",(v,"failure-0001","lyrics"))
    raise AssertionError("failure injection accepted")
except psycopg.Error as e: assert "INJECTED_JOB_INSERT_FAILURE" in str(e)
assert sql("SELECT credits FROM music_test.wallets WHERE user_id=%s",(v,))[0][0]==1
assert sql("SELECT count(*) FROM music_test.jobs WHERE user_id=%s",(v,))[0][0]==0
print("PASS: two-connection last-credit race, replay, collision, rollback (LOCAL PostgreSQL)")
