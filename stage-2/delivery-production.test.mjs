import test from "node:test";
import assert from "node:assert/strict";
import {createProductionDeliveryNodeHandler} from "./delivery-production.mjs";
const handleDelivery=async()=>({status:200,headers:{},body:{ok:true}});
test("production requires configured trusted HTTPS origin",()=>{
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery}),/origin required/);
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:""}),/origin required/);
});
test("production refuses insecure or malformed origin at startup",()=>{
 for(const allowedOrigin of ["http://runlu.ca","https://runlu.ca/path","https://runlu.ca?x=1","not-a-url"]){
  assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin}),/origin|HTTPS/);
 }
});
test("production accepts valid HTTPS origin with trusted handler",()=>{
 assert.equal(typeof createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca"}),"function");
});
test("production rejects missing handler before server starts",()=>{
 assert.throws(()=>createProductionDeliveryNodeHandler({allowedOrigin:"https://runlu.ca"}),/Trusted delivery handler/);
});
