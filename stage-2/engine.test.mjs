import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest, quoteInternal, toPublicOffer } from "./engine.mjs";
const settings = { usdToCad: 1.4, audioCad: 1, platformCad: 1, minGrossMargin: .3, competitorCad: 100, targetDiscount: .15 };
test("valid short cinematic request", () => assert.equal(validateRequest({durationSeconds:60,quality:"enhanced",format:"cinematic"}).durationSeconds,60));
test("reject one-hour cinematic instead of promising impossible mode", () => assert.throws(()=>validateRequest({durationSeconds:3600,quality:"premium",format:"cinematic"})));
test("reject malformed quality", () => assert.throws(()=>validateRequest({durationSeconds:60,quality:"unknown",format:"story"})));
test("profit floor blocks loss-making comparison", () => {
 const q=quoteInternal({durationSeconds:3600,quality:"premium",format:"longform"},{...settings,competitorCad:1});
 assert.equal(q.eligible,false);
});
test("no internal costs leak in public approved offer", () => {
 const pub=toPublicOffer({status:"APPROVED",finalCad:29.99,durationSeconds:60,quality:"standard",format:"cinematic",estimatedCad:17,providerKey:"SECRET"});
 assert.equal(pub.price,29.99);
 assert.equal("estimatedCad" in pub,false);
 assert.equal("providerKey" in pub,false);
});
test("unapproved quote cannot become a public offer",()=>assert.throws(()=>toPublicOffer({status:"INTERNAL_REVIEW",finalCad:10})));
