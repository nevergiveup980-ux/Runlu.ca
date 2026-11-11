// Internal opinions are distinct from external expert endorsement. No write operations.
import { validateSchema } from './schema-validation.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const reviewSchema = JSON.parse(readFileSync(new URL('./data/internal-review-schema.json',import.meta.url)));
export const validateLedger = ledger => validateSchema(ledger,reviewSchema);
export const dimensions = ['facts','practice','language:en','language:zh','language:fr','language:es','source_rights'];
const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])) : x;
export function reviewDigest(record, artifacts = {}) {
  const {status, review, ...content} = record;
  return createHash('sha256').update(JSON.stringify(canonical({content,artifacts}))).digest('hex');
}
export function loadArtifacts(record) {
  // RK-0005's full text is a separate editorial artifact; summary-only review is insufficient.
  const files = record.id === 'RK-0005' ? ['editorial/RK-0005-INVENTORY-FULFILLMENT.md'] : [];
  return Object.fromEntries(files.map(file => [file,readFileSync(new URL(file,import.meta.url),'utf8')]));
}
const text = x => typeof x === 'string' && x.trim().length > 0;
const date = x => /^\d{4}-\d{2}-\d{2}$/.test(x ?? '') && !Number.isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x;
export function inspectReview(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return ['invalid-review'];
  const errors=validateSchema(row,reviewSchema.properties.entries.items);
  for (const field of ['review_id','record_id','content_digest','reviewer_id','reviewer_name','role','relationship','summary']) if (!text(row[field])) errors.push('missing-'+field);
  if (!/^RK-\d{4,}$/.test(row.record_id ?? '') || !Number.isInteger(row.record_version) || row.record_version < 1) errors.push('invalid-record-binding');
  if (!/^[a-f0-9]{64}$/.test(row.content_digest ?? '')) errors.push('invalid-digest');
  if (!dimensions.includes(row.dimension)) errors.push('invalid-dimension');
  if (!['human','ai'].includes(row.reviewer_type)) errors.push('invalid-reviewer-type');
  if (!['internal','external'].includes(row.relationship)) errors.push('invalid-relationship');
  if (!['pending','pass','changes_requested','rejected'].includes(row.decision)) errors.push('invalid-decision');
  if (row.reviewer_type === 'ai' && (row.relationship !== 'internal' || row.decision === 'pass' || !text(row.model))) errors.push('ai-cannot-sign-or-claim-external-review');
  if (row.dimension === 'source_rights' && (!Number.isInteger(row.source_index) || row.source_index < 0)) errors.push('missing-source-index');
  if (!Array.isArray(row.evidence) || row.evidence.some(e=>!text(e?.ref)||!text(e?.locator)||!text(e?.finding))) errors.push('invalid-evidence');
  if (row.decision !== 'pending' && (!date(row.reviewed_at) || !row.evidence?.length)) errors.push('unsigned-or-unsupported-review');
  if (row.reviewer_type === 'human' && row.decision === 'pass' && !text(row.attestation_ref)) errors.push('missing-human-attestation');
  if (!Array.isArray(row.ai_assistance) || row.ai_assistance.some(x=>!text(x))) errors.push('invalid-ai-assistance');
  return errors;
}
export function reviewBlockers(record, rows, artifacts = loadArtifacts(record)) {
  if (!Array.isArray(rows)) return ['invalid-review-ledger'];
  const digest = reviewDigest(record,artifacts), blockers=[];
  const required = dimensions.filter(d=>d!=='source_rights').concat((Array.isArray(record.sources) ? record.sources : []).map((_,i)=>'source_rights:'+i));
  for (const key of required) {
    const [dimension,index] = key.startsWith('source_rights:') ? ['source_rights',Number(key.split(':')[1])] : [key,undefined];
    const matching=rows.filter(r=>r?.record_id===record.id && r.record_version===record.version && r.content_digest===digest && r.dimension===dimension && (index===undefined || r.source_index===index));
    // Conflicting/current objections must be resolved by a new reviewed revision, never hidden by a later pass.
    const humans=matching.filter(r=>r.reviewer_type==='human');
    if (!humans.some(r=>r.decision==='pass' && inspectReview(r).length===0) || humans.some(r=>['changes_requested','rejected'].includes(r.decision))) blockers.push('internal-review-required-'+key);
    if (matching.some(r=>inspectReview(r).length)) blockers.push('invalid-review-'+key);
  }
  return blockers;
}
