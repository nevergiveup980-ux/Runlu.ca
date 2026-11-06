#!/usr/bin/env node
// RUNLU editorial essay validation. Run: node knowledge/essays/validate.mjs
import {readFile, readdir} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const base=dirname(fileURLToPath(import.meta.url));
const LANGS=['zh','en','fr','es'];
const slug='when-science-meets-the-unknown';
const failures=[];
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const fail=message=>failures.push(message);
const manifest=await readJson(join(base,slug,'manifest.json'));
if(manifest.id!==slug)fail('Manifest article id mismatch');
if(JSON.stringify(manifest.languages)!==JSON.stringify(LANGS))fail('Manifest language set mismatch');
for(const lang of LANGS){
  if(!nonempty(manifest.titles?.[lang])||!nonempty(manifest.subtitles?.[lang]))fail(lang+': missing localized metadata');
  const file=join(base,slug,lang+'.json');
  let article;
  try{article=await readJson(file)}catch(e){
    fail(lang+': full manuscript missing or invalid (publication readiness incomplete)');
    continue;
  }
  if(article.id!==slug||article.language!==lang)fail(lang+': article identity mismatch');
  if(!['draft','reviewed','published'].includes(article.status))fail(lang+': invalid status');
  if(!nonempty(article.title)||!nonempty(article.subtitle))fail(lang+': missing title/subtitle');
  if(!Array.isArray(article.sections)||article.sections.length!==8)fail(lang+': expected exactly 8 sections');
  else article.sections.forEach((section,i)=>{
    if(!nonempty(section.heading))fail(lang+': section '+(i+1)+' missing heading');
    if(!Array.isArray(section.paragraphs)||section.paragraphs.length===0||
       !section.paragraphs.every(nonempty))fail(lang+': section '+(i+1)+' missing full paragraphs');
  });
  if(article.status==='published'&&(!manifest.publication?.approved||manifest.status!=='published'))
    fail(lang+': published article without approved manifest');
}
const names=await readdir(join(base,slug));
for(const name of names.filter(n=>/^[a-z]{2}\.json$/.test(n))){
  if(!LANGS.includes(name.slice(0,2)))fail('Unexpected language file: '+name);
}
if(manifest.status==='published'&&(!manifest.review?.facts_verified||
 !manifest.review?.translations_verified||!manifest.review?.rights_verified||
 !manifest.publication?.approved||!/^\d{4}-\d{2}-\d{2}$/.test(manifest.review?.reviewed_at||'')))
 fail('Published manifest missing review approval');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
else console.log('PASS: all four full-length essay files validated; status='+manifest.status);
