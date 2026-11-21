import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectReview, reviewBlockers, reviewDigest } from './internal-review.mjs';
import { fixtureReviews } from './internal-review-fixtures.mjs';
import { validateSchema } from './schema-validation.mjs';
import { auditKnowledge, inspectRecord } from './validate-publication.mjs';
const drafts=JSON.parse(readFileSync(new URL('./data/records.json',import.meta.url)));
const record=()=>structuredClone(drafts.find(r=>r.id==='RK-0005'));
test('every existing record satisfies actual JSON Schema',()=>{for(const r of drafts)assert.deepEqual(validateSchema(r),[])});
test('schema rejects unknown fields, invalid types, dates and scope',()=>{
 for(const change of [r=>r.unexpected=true,r=>r.version='1',r=>r.updated_at='2026-02-30',r=>r.scope.type='national',r=>r.review.facts_verified='true',r=>r.sources[0].use_type='anything']){
  const r=record();change(r);assert.ok(validateSchema(r).length);
 }
});
test('legacy flags cannot replace independent dimension reviews',()=>assert.equal(reviewBlockers(record(),[]).length,7));
test('complete synthetic human reviews pass every dimension',()=>{const r=record();assert.deepEqual(reviewBlockers(r,fixtureReviews(r)),[])});
test('every dimension is independently required',()=>{
 const r=record(),rows=fixtureReviews(r);
 for(const row of rows)assert.ok(reviewBlockers(r,rows.filter(x=>x!==row)).length);
});
test('AI can record advice but cannot sign or claim external expertise',()=>{
 const row=fixtureReviews(record())[0];Object.assign(row,{reviewer_type:'ai',model:'test-model',decision:'changes_requested'});
 assert.deepEqual(inspectReview(row),[]);
 row.decision='pass';assert.ok(inspectReview(row).includes('ai-cannot-sign-or-claim-external-review'));
 row.decision='pending';row.relationship='external';assert.ok(inspectReview(row).length);
});
test('AI-only reviews never fulfill human approval',()=>{
 const r=record(),rows=fixtureReviews(r).map(x=>({...x,reviewer_type:'ai',model:'test-model',decision:'changes_requested'}));
 assert.equal(reviewBlockers(r,rows).length,7);
});
test('each source needs its own rights review',()=>{
 const r=record();r.sources.push({...r.sources[0],url:'https://example.org/other'});
 const rows=fixtureReviews(r);assert.ok(reviewBlockers(r,rows.filter(x=>x.source_index!==1)).includes('internal-review-required-source_rights:1'));
});
test('stale version and changed record content invalidate approval',()=>{
 const r=record(),rows=fixtureReviews(r);r.summaries.en+=' changed';assert.equal(reviewBlockers(r,rows).length,7);
 const v=record();v.version++;assert.equal(reviewBlockers(v,rows).length,7);
});
test('manuscript changes invalidate approval even when summaries unchanged',()=>{
 const r=record(),artifacts={'editorial/RK-0005-INVENTORY-FULFILLMENT.md':'before'};
 const rows=fixtureReviews(r).map(x=>({...x,content_digest:reviewDigest(r,artifacts)}));
 assert.deepEqual(reviewBlockers(r,rows,artifacts),[]);
 assert.equal(reviewBlockers(r,rows,{...artifacts,'editorial/RK-0005-INVENTORY-FULFILLMENT.md':'after'}).length,7);
});
test('digest stable across key order and lifecycle changes',()=>{
 const r=record(),s=Object.fromEntries(Object.entries(r).reverse());s.status='published';s.review={};
 assert.equal(reviewDigest(r),reviewDigest(s));
});
test('unsigned, blank evidence and invalid dates fail approval',()=>{
 for(const mutate of [x=>x.evidence=[],x=>x.evidence[0].finding=' ',x=>x.attestation_ref='',x=>x.reviewed_at='2026-02-30',x=>x.reviewer_name=' ']){
  const r=record(),rows=fixtureReviews(r);mutate(rows[0]);assert.ok(reviewBlockers(r,rows).length);
 }
});
test('current human objections cannot be overridden by another pass',()=>{
 const r=record(),rows=fixtureReviews(r);rows.push({...rows[0],review_id:'objection',decision:'changes_requested'});assert.ok(reviewBlockers(r,rows).length);
});
test('duplicate and orphan review IDs fail audit',()=>{
 const r=record(),rows=fixtureReviews(r);
 assert.equal(auditKnowledge([r],{entries:[]},{reviews:[...rows,rows[0]]}).publicationSafe,false);
 rows[0].record_version++;assert.equal(auditKnowledge([r],{entries:[]},{reviews:rows}).publicationSafe,false);
});
test('RK-0005 remains unpublished and unapproved; audit never mutates data',()=>{
 const before=JSON.stringify(drafts),audit=auditKnowledge(drafts,{entries:[]});
 assert.equal(audit.publicationSafe,true);assert.equal(audit.draftReadiness.find(x=>x.id==='RK-0005').readyForEditorialDecision,false);
 assert.equal(JSON.stringify(drafts),before);assert.ok(inspectRecord(record(),{forPublication:true}).length);
});
test('AI assistance must resolve to an actual AI review of the same content',()=>{
 const r=record(),rows=fixtureReviews(r);rows[0].ai_assistance=['missing'];
 assert.equal(auditKnowledge([r],{entries:[]},{reviews:rows}).publicationSafe,false);
 rows.push({...rows[0],review_id:'ai-advice',reviewer_type:'ai',model:'test-model',decision:'changes_requested',ai_assistance:[]});
 rows[0].ai_assistance=['ai-advice'];assert.equal(auditKnowledge([r],{entries:[]},{reviews:rows}).publicationSafe,true);
});
test('historical reviews retained without approving changed content',()=>{
 const r=record(),rows=fixtureReviews(r);r.version++;
 const report=auditKnowledge([r],{entries:[]},{reviews:rows});
 assert.equal(report.publicationSafe,true);assert.equal(report.draftReadiness[0].readyForEditorialDecision,false);
});
test('invalid source index and unknown review fields fail audit',()=>{
 const r=record(),rows=fixtureReviews(r);rows.at(-1).source_index=99;
 assert.equal(auditKnowledge([r],{entries:[]},{reviews:rows}).publicationSafe,false);
 rows.at(-1).source_index=0;rows[0].invented=true;assert.ok(inspectReview(rows[0]).length);
});
