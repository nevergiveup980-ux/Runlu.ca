#!/usr/bin/env python3
"""Real local PostgreSQL concurrent transaction tests. Requires psycopg[binary]."""
import os, concurrent.futures, uuid, threading
from urllib.parse import urlparse
import psycopg

dsn=os.getenv("RUNLU_MUSIC_TEST_DSN","")
parsed=urlparse(dsn)
if parsed.scheme not in ("postgresql","postgres") or parsed.hostname not in ("localhost","127.0.0.1") or parsed.path!="/runlu_music_test":
    raise SystemExit("Set RUNLU_MUSIC_TEST_DSN to a LOCAL disposable PostgreSQL database.")
u=str(uuid.uuid4())
def sql(query,params=()):
    with psycopg.connect(dsn) as c:
        with c.cursor() as cur:
            cur.execute(query,params)
            return cur.fetchall() if cur.description else None
sql("INSERT INTO music_test.wallets(user_id,credits) VALUES(%s,1)",(u,))
def reserve(key,payload="lyrics",fail=False,barrier=None,user_id=None):
    with psycopg.connect(dsn, connect_timeout=5) as c:
        with c.cursor() as cur:
            if barrier is not None:
                barrier.wait(timeout=10)
            cur.execute("SELECT music_test.reserve(%s,%s,%s,%s)",(user_id or u,key,payload,fail))
            return cur.fetchone()[0]
barrier=threading.Barrier(2)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
    futures=[ex.submit(reserve,"key-"+str(i).zfill(8),barrier=barrier) for i in range(2)]
    outcomes=[]
    for f in futures:
        try: outcomes.append(("ok",f.result()))
        except psycopg.Error as e: outcomes.append(("error",str(e).splitlines()[0]))
assert len([x for x in outcomes if x[0]=="ok"])==1,outcomes
assert len([x for x in outcomes if "INSUFFICIENT_CREDITS" in str(x)])==1,outcomes
assert sql("SELECT credits FROM music_test.wallets WHERE user_id=%s",(u,))[0][0]==0
assert sql("SELECT count(*) FROM music_test.consumptions WHERE user_id=%s",(u,))[0][0]==1
assert sql("SELECT count(*) FROM music_test.jobs WHERE user_id=%s",(u,))[0][0]==1
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
assert sql("SELECT count(*) FROM music_test.consumptions WHERE user_id=%s",(v,))[0][0]==0
# Two independent connections racing the SAME key must receive the same job.
w=str(uuid.uuid4())
sql("INSERT INTO music_test.wallets(user_id,credits) VALUES(%s,1)",(w,))
same_barrier=threading.Barrier(2)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
    same=list(ex.map(lambda _: reserve("same-key-0001",barrier=same_barrier,user_id=w),range(2)))
assert same[0]==same[1],same
assert sql("SELECT credits FROM music_test.wallets WHERE user_id=%s",(w,))[0][0]==0
assert sql("SELECT count(*) FROM music_test.jobs WHERE user_id=%s",(w,))[0][0]==1
assert sql("SELECT count(*) FROM music_test.consumptions WHERE user_id=%s",(w,))[0][0]==1

# An empty wallet must reject before any job or consumption is inserted.
z=str(uuid.uuid4())
sql("INSERT INTO music_test.wallets(user_id,credits) VALUES(%s,0)",(z,))
try:
    reserve("empty-wallet-01",user_id=z)
    raise AssertionError("empty wallet accepted")
except psycopg.Error as e:
    assert "INSUFFICIENT_CREDITS" in str(e)
assert sql("SELECT count(*) FROM music_test.jobs WHERE user_id=%s",(z,))[0][0]==0
assert sql("SELECT count(*) FROM music_test.consumptions WHERE user_id=%s",(z,))[0][0]==0
print("PASS: concurrent last-credit race, same-key replay, payload collision, rollback, empty wallet (LOCAL PostgreSQL)")
