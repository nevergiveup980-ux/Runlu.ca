import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../migrations/0001_music_schema.sql",import.meta.url),"utf8");
test("migration contains required durable tables and owner scope",()=>{
 for(const table of ["music_jobs","music_tracks","music_uploads"])assert.match(sql,new RegExp("CREATE TABLE IF NOT EXISTS "+table));
 assert.equal((sql.match(/owner_id TEXT NOT NULL/g)||[]).length,3);
});
test("job schema guards idempotency and successful results",()=>{
 assert.match(sql,/UNIQUE\(owner_id,idempotency_key\)/);
 assert.match(sql,/status != 'succeeded' OR track_id IS NOT NULL/);
 assert.match(sql,/status != 'failed' OR error_code IS NOT NULL/);
});
test("audio metadata guards MP3 format and verified bytes",()=>{
 assert.match(sql,/CHECK\(format='mp3'\)/);
 assert.match(sql,/sha256_hex TEXT NOT NULL/);
 assert.match(sql,/rights_confirmed_at INTEGER NOT NULL/);
});
