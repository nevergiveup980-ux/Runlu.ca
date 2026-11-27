import test from "node:test";
import assert from "node:assert/strict";
import {PRICE_SNAPSHOT,selectCandidates,estimateShotUsd} from "./provider-catalog.mjs";
test("price snapshot contains provenance",()=>assert.match(PRICE_SNAPSHOT.source,/runwayml/));
test("economy image-to-video routes to turbo",()=>assert.equal(selectCandidates({sourceImage:true,maxUsdPerSecond:.06})[0].id,"gen4_turbo"));
test("native audio excludes silent-only models",()=>assert.ok(selectCandidates({nativeAudio:true}).every(x=>x.capabilities.includes("native-audio"))));
test("too tight budget returns no candidates",()=>assert.equal(selectCandidates({maxUsdPerSecond:.01}).length,0));
test("retry allowance contributes to quoted cost",()=>assert.equal(estimateShotUsd("gen4_turbo",10,{retryAllowance:2}),1));
test("unknown model rejected",()=>assert.throws(()=>estimateShotUsd("unknown",5)));
