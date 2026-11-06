#!/usr/bin/env node
// Pre-publication smoke test. Run: node knowledge/essays/smoke-test.mjs
// The current draft is deliberately incomplete; the readiness check MUST fail.
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const dir=dirname(fileURLToPath(import.meta.url));
const slug='when-science-meets-the-unknown';
const html=await readFile(join(dir,'../essay.html'),'utf8');
const manifest=JSON.parse(await readFile(join(dir,slug,'manifest.json'),'utf8'));
const checks=[
  ['HTML uses textContent for paragraphs',html.includes('paragraph.textContent=p')],
  ['HTML checks manifest approval',html.includes('manifest.publication?.approved!==true')],
  ['HTML checks rights verification',html.includes('manifest.review?.rights_verified!==true')],
  ['HTML does not allow indexing drafts',html.includes('noindex,nofollow')],
  ['Manifest remains unpublished',manifest.status==='draft'&&manifest.publication.approved===false],
  ['All four language identifiers present',JSON.stringify(manifest.languages)===JSON.stringify(['zh','en','fr','es'])]
];
for(const [name,ok] of checks)console.log((ok?'PASS ':'FAIL ')+name);
const readiness=spawnSync(process.execPath,[join(dir,'validate.mjs')],{encoding:'utf8'});
const hasMissing=readiness.stderr.includes('full manuscript missing or invalid');
const expectedBlocked=readiness.status!==0&&hasMissing;
console.log((expectedBlocked?'PASS ':'FAIL ')+'Publication readiness blocks missing full manuscripts');
if(readiness.stdout)process.stdout.write(readiness.stdout);
if(readiness.stderr)process.stdout.write(readiness.stderr);
if(checks.some(([,ok])=>!ok)||!expectedBlocked)process.exitCode=1;
