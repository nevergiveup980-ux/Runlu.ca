#!/usr/bin/env node
// Print an unsigned template only. Redirect to a new working file; never signs or publishes.
import { readFileSync } from 'node:fs';
import { dimensions, reviewDigest, loadArtifacts } from '../internal-review.mjs';
const records=JSON.parse(readFileSync(new URL('../data/records.json',import.meta.url),'utf8'));
const record=records.find(r=>r.id===process.argv[2]);
if (!record) throw Error('Usage: node knowledge/scripts/prepare-review.mjs RK-0005 (existing draft ID required)');
const scopes=dimensions.filter(d=>d!=='source_rights').map(dimension=>({dimension})).concat(record.sources.map((_,source_index)=>({dimension:'source_rights',source_index})));
console.log(JSON.stringify({version:1,entries:scopes.map(scope=>({
 review_id:'',record_id:record.id,record_version:record.version,content_digest:reviewDigest(record,loadArtifacts(record)),...scope,
 reviewer_id:'',reviewer_name:'',reviewer_type:'human',role:'',relationship:'internal',decision:'pending',reviewed_at:null,
 summary:'',evidence:[],attestation_ref:null,ai_assistance:[]
}))},null,2));
