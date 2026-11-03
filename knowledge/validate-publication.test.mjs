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

test("draft readiness exposes missing approval without failing current publication",()=>{
 const r=good();r.status="draft";r.review.license_verified=false;
 const report=auditKnowledge([r],{entries:[]});
 assert.equal(report.publicationSafe,true);
 assert.equal(report.draftReadiness[0].readyForEditorialDecision,false);
 assert.ok(report.draftReadiness[0].blockers.includes("review-incomplete-license_verified"));
});
test("eligible draft preview does not mutate source record",()=>{
 const r=good();r.status="draft";
 const report=auditKnowledge([r],{entries:[]});
 assert.equal(report.draftReadiness[0].readyForEditorialDecision,true);
 assert.equal(r.status,"draft");
});

test("factual reference needs no reproduction license when assessment documented",()=>{
 const r=good();r.sources[0].use_type="factual_reference";r.sources[0].license_status="unknown";
 assert.deepEqual(inspectRecord(r,{forPublication:true}),[]);
});
test("factual reference missing assessment is blocked",()=>{
 const r=good();r.sources[0].use_type="factual_reference";r.sources[0].license_status="unknown";delete r.sources[0].rights_evidence;
 assert.ok(inspectRecord(r,{forPublication:true}).includes("factual-reference-assessment-missing-0"));
});
test("prohibited source is not bypassed by factual-reference classification",()=>{
 const r=good();r.sources[0].use_type="factual_reference";r.sources[0].license_status="prohibited";
 assert.ok(inspectRecord(r,{forPublication:true}).includes("source-use-requires-review-0"));
});

test("restricted factual source requires explicit review",()=>{
 const r=good();r.sources[0].use_type="factual_reference";r.sources[0].license_status="restricted";
 assert.ok(inspectRecord(r,{forPublication:true}).includes("source-use-requires-review-0"));
});
test("same record version cannot be both draft and published",()=>{
 const draft=good();draft.status="draft";
 const report=auditKnowledge([draft],{entries:[good()]});
 assert.equal(report.publicationSafe,false);
 assert.ok(report.findings.some(f=>f.source==="published"&&f.problems.includes("published-version-still-in-drafts")));
});
test("different draft version can coexist with published version",()=>{
 const draft=good();draft.status="draft";draft.version=2;
 assert.equal(auditKnowledge([draft],{entries:[good()]}).publicationSafe,true);
});
