#!/usr/bin/env node
// Shared read-only schema + editorial gate. No database or publication writes.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
 const root=path.resolve(__dirname,'..');
 const {auditKnowledge}=await import(pathToFileURL(path.join(root,'validate-publication.mjs')));
 const result=auditKnowledge(JSON.parse(fs.readFileSync(path.join(root,'data/records.json'))),JSON.parse(fs.readFileSync(path.join(root,'data/published.json'))));
 if (result.findings.length) throw Error(JSON.stringify(result.findings,null,2));
 console.log('Knowledge schema and publication gate passed. Drafts:',result.drafts,'Published:',result.published);
})().catch(error=>{console.error(error.message);process.exitCode=1});
