import assert from "node:assert/strict";
import test from "node:test";
import {requireVerifiedMusicUser,redactMusicError} from "./auth-boundary.mjs";
const uid="12345678-1234-1234-1234-123456789abc";
test("requires verified server user and rejects browser identity",async()=>{
 const id=await requireVerifiedMusicUser({authorization:"Bearer opaque-token",verifyToken:async token=>token==="opaque-token"?{id:uid}:null});
 assert.equal(id,uid);
 await assert.rejects(requireVerifiedMusicUser({authorization:"Bearer forged",verifyToken:async()=>null}),/UNAUTHENTICATED/);
 await assert.rejects(requireVerifiedMusicUser({authorization:"Bearer opaque-token",verifyToken:async()=>({id:uid,is_anonymous:true})}),/UNAUTHENTICATED/);
});
test("rejects missing token and verifier",async()=>{
 await assert.rejects(requireVerifiedMusicUser({authorization:"",verifyToken:async()=>({id:uid})}),/UNAUTHENTICATED/);
 await assert.rejects(requireVerifiedMusicUser({authorization:"Bearer token"}),/AUTH_VERIFIER_MISSING/);
});
test("does not expose provider secrets in public errors",()=>{
 assert.equal(redactMusicError(new Error("secret=abc123")),"INTERNAL_ERROR");
 assert.equal(redactMusicError(new Error("INSUFFICIENT_CREDITS")),"INSUFFICIENT_CREDITS");
});
