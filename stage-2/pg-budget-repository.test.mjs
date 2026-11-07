import test from "node:test";
import assert from "node:assert/strict";
import { PgBudgetRepository } from "./pg-budget-repository.mjs";
function fakePool({allow=true,failInsert=false}={}){
 const log=[];
 return {log,connect:async()=>({
  query:async(sql,args)=>{
   log.push({sql,args});
   if(sql.startsWith("UPDATE"))return {rows:allow?[{id:"job"}]:[]};
   if(sql.startsWith("INSERT")&&failInsert)throw Error("insert failed");
   return {rows:[]};
  },
  release:()=>log.push({sql:"RELEASE"})
 })};
}
test("reserve commits with parameterized query",async()=>{
 const pool=fakePool();const repo=new PgBudgetRepository(pool);
 await repo.reserve("job","worker","attempt","runway",500);
 assert.ok(pool.log.some(x=>x.sql==="COMMIT"));
 assert.ok(pool.log.some(x=>x.sql.startsWith("UPDATE")&&x.args[2]===500));
});
test("insufficient budget rolls back",async()=>{
 const pool=fakePool({allow:false});const repo=new PgBudgetRepository(pool);
 await assert.rejects(repo.reserve("job","worker","attempt","runway",500));
 assert.ok(pool.log.some(x=>x.sql==="ROLLBACK"));
});
test("failed attempt insert rolls back",async()=>{
 const pool=fakePool({failInsert:true});const repo=new PgBudgetRepository(pool);
 await assert.rejects(repo.reserve("job","worker","attempt","runway",500));
 assert.ok(pool.log.some(x=>x.sql==="ROLLBACK"));
});
test("invalid amount rejected before opening DB",async()=>{
 const pool=fakePool();const repo=new PgBudgetRepository(pool);
 await assert.rejects(repo.reserve("job","worker","attempt","runway",0));
 assert.equal(pool.log.length,0);
});
