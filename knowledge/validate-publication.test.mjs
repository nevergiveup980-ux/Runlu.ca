import test from "node:test";
import assert from "node:assert/strict";
import { inspectRecord, auditKnowledge } from "./validate-publication.mjs";

const good = () => ({
 id:"RK-TEST",status:"published",category:"construction",scope:{type:"global",codes:[]},version:1,
 titles:{en:"a",zh:"甲",fr:"a",es:"a"},summaries:{en:"b",zh:"乙",fr:"b",es:"b"},
 sources:[{url:"https://example.org/source",publisher:"Example",license_status:"permitted",checked_at:"2026-11-01",rights_basis:"independently authored facts",rights_evidence:"knowledge/reviews/fixture.md"}],
 review:{facts_verified:true,license_verified:true,translations_verified:true,reviewer:"Editor",reviewed_at:"2026-11-01",evidence_ref:"knowledge/reviews/fixture.md",translation_reviewer:"Language editor"}
});
test("approved record passes structural gate",()=>assert.deepEqual(inspectRecord(good(),{forPublication:true}),[]));
test("missing language is blocked",()=>{const r=good();delete r.titles.fr;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-title-fr"));});
test("unknown rights blocks publication",()=>{const r=good();r.sources[0].license_status="unknown";assert.ok(inspectRecord(r,{forPublication:true}).includes("source-rights-not-permitted-0"));});
test("unsigned reviewer blocks publication",()=>{const r=good();delete r.review.reviewer;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-reviewer"));});
test("impossible calendar date rejected",()=>{const r=good();r.review.reviewed_at="2026-02-30";assert.ok(inspectRecord(r,{forPublication:true}).includes("invalid-reviewed-at"));});
test("draft remains draft, not publication",()=>{const r=good();r.status="draft";assert.ok(inspectRecord(r,{forPublication:true}).includes("not-published"));});
test("published failure produces unsafe audit",()=>{const r=good();r.sources[0].license_status="unknown";assert.equal(auditKnowledge([], {entries:[r]}).publicationSafe,false);});
test("draft warnings do not force publication",()=>{const r=good();r.status="draft";r.review={};assert.equal(auditKnowledge([r],{entries:[]}).publicationSafe,true);});
test("duplicate published IDs flagged",()=>{const r=good();assert.equal(auditKnowledge([],{entries:[r,r]}).publicationSafe,false);});

test("rights approval without recorded basis is blocked",()=>{const r=good();delete r.sources[0].rights_basis;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-source-rights-basis-0"));});
test("rights approval without supporting evidence is blocked",()=>{const r=good();delete r.sources[0].rights_evidence;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-source-rights-evidence-0"));});
test("translation signoff must name reviewer",()=>{const r=good();delete r.review.translation_reviewer;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-translation-reviewer"));});
test("review requires evidence reference",()=>{const r=good();delete r.review.evidence_ref;assert.ok(inspectRecord(r,{forPublication:true}).includes("missing-review-evidence"));});
