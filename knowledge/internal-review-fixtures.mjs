// Synthetic TEST ONLY people and evidence. Never copy these approvals to the ledger.
import { dimensions, reviewDigest, loadArtifacts } from './internal-review.mjs';
export function fixtureReviews(record) {
 const keys=dimensions.filter(x=>x!=='source_rights').map(dimension=>({dimension})).concat(record.sources.map((_,source_index)=>({dimension:'source_rights',source_index})));
 return keys.map((scope,i)=>({
  review_id:`TEST-${record.id}-${record.version}-${i}`,record_id:record.id,record_version:record.version,
  content_digest:reviewDigest(record,loadArtifacts(record)),...scope,
  reviewer_id:'test-human',reviewer_name:'Synthetic test reviewer',reviewer_type:'human',role:'Test only',relationship:'internal',
  decision:'pass',reviewed_at:'2026-11-10',summary:'Synthetic test approval',attestation_ref:'test://signed-fixture',
  evidence:[{ref:'test://evidence',locator:'fixture',finding:'Synthetic finding'}],ai_assistance:[]
 }));
}
