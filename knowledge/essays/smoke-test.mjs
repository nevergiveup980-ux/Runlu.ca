#!/usr/bin/env node
// Pre-publication smoke test. Run: node knowledge/essays/smoke-test.mjs
// Drafts may be incomplete; publication-ready content must validate cleanly.
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
  ['Manifest has a recognized status',['draft','reviewed','published'].includes(manifest.status)],
  ['All four language identifiers present',JSON.stringify(manifest.languages)===JSON.stringify(['zh','en','fr','es'])]
];
for(const [name,ok] of checks)console.log((ok?'PASS ':'FAIL ')+name);
const readiness=spawnSync(process.execPath,[join(dir,'validate.mjs')],{encoding:'utf8'});
const hasMissing=readiness.stderr.includes('full manuscript missing or invalid');
const isPublished=manifest.status==='published';
const expectedOutcome=isPublished?readiness.status===0:(readiness.status===0||hasMissing);
console.log((expectedOutcome?'PASS ':'FAIL ')+(isPublished?'Published edition passes readiness':'Draft validation behaves as expected'));
if(readiness.stdout)process.stdout.write(readiness.stdout);
if(readiness.stderr)process.stdout.write(readiness.stderr);
if(checks.some(([,ok])=>!ok)||!expectedOutcome)process.exitCode=1;
