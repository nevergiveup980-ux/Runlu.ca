import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
const script=new URL("../first-song-smoke.js",import.meta.url);
test("first-song smoke is dry-run by default even with fake credentials",()=>{
 const r=spawnSync(process.execPath,[script.pathname],{encoding:"utf8",env:{...process.env,GEMINI_API_KEY:"fake",MUSIC_GENERATION_ENABLED:"true",MUSIC_TEST_APPROVED:"true"}});
 assert.equal(r.status,0);assert.match(r.stdout,/DRY RUN ONLY/);assert.doesNotMatch(r.stdout,/fake/);
});
test("live mode fails closed without explicit approvals",()=>{
 const r=spawnSync(process.execPath,[script.pathname,"--live"],{encoding:"utf8",env:{PATH:process.env.PATH,GEMINI_API_KEY:"fake"}});
 assert.equal(r.status,2);assert.match(r.stderr,/LIVE TEST BLOCKED/);assert.doesNotMatch(r.stderr,/fake/);
});
