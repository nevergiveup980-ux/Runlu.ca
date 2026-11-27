import test from "node:test";
import assert from "node:assert/strict";
import {enforceDeliveryOrigin} from "./delivery-origin.mjs";
const allowedOrigin="https://runlu.ca";
const req=headers=>({headers});
test("accepts exact trusted HTTPS origin",()=>{
 assert.equal(enforceDeliveryOrigin(req({origin:"https://runlu.ca","sec-fetch-site":"same-origin"}),{allowedOrigin}),true);
});
test("rejects cross-site and lookalike origins",()=>{
 for(const origin of ["https://evil.example","https://runlu.ca.evil.example","http://runlu.ca","https://runlu.ca:444","null"]){
  assert.equal(enforceDeliveryOrigin(req({origin}),{allowedOrigin}),false,origin);
 }
});
test("rejects missing and malformed origin",()=>{
 assert.equal(enforceDeliveryOrigin(req({}),{allowedOrigin}),false);
 assert.equal(enforceDeliveryOrigin(req({origin:"not a url"}),{allowedOrigin}),false);
});
test("rejects contradictory fetch metadata",()=>{
 assert.equal(enforceDeliveryOrigin(req({origin:allowedOrigin,"sec-fetch-site":"cross-site"}),{allowedOrigin}),false);
 assert.equal(enforceDeliveryOrigin(req({origin:allowedOrigin,"sec-fetch-site":"same-site"}),{allowedOrigin}),false);
});
test("rejects origin with embedded credentials or path",()=>{
 assert.equal(enforceDeliveryOrigin(req({origin:"https://user@runlu.ca"}),{allowedOrigin}),false);
 assert.equal(enforceDeliveryOrigin(req({origin:"https://runlu.ca/other"}),{allowedOrigin}),false);
});
test("invalid deployment origin rejected at startup",()=>{
 assert.throws(()=>enforceDeliveryOrigin(req({origin:allowedOrigin}),{allowedOrigin:"http://runlu.ca"}),/HTTPS/);
});
