import fs from 'node:fs';import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html'),fast=read('flooring/mobile-safe-fastboot-v0403i.js'),p7=read('flooring/mobile-safe-phase7-v0403i.js'),week=read('flooring/week-schedule-v096-safe.js'),release=read('flooring/index-v0403-release.html'),quote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');
const checks=[];function test(n,f){try{f();checks.push([n,true])}catch(e){checks.push([n,false,e.message])}}
test('Phase 7 compiles',()=>new Function(p7));test('Week Schedule safe module compiles',()=>new Function(week));
test('Safe Core advances to i Fast Boot',()=>{assert(v71.includes('mobile-safe-fastboot-v0403j.js?v=0403j'));assert(v71.includes('mobile-safe-0403j'))});
test('Phases 1–7 remain ordered',()=>{const x=[1,2,3,4,5,6,7].map(i=>fast.indexOf("name:'phase"+i+"'"));assert(x.every(n=>n>0));for(let i=1;i<x.length;i++)assert(x[i]>x[i-1])});
test('Week Schedule stays lazy',()=>{assert.equal(fast.includes('week-schedule-v096-safe.js'),false);assert(p7.includes("MODULE_SRC='week-schedule-v096-safe.js?v=0403i-safe'"));const install=p7.slice(p7.indexOf('function install()'),p7.indexOf('function status()'));assert.equal(install.includes('load()'),false)});
test('Schedule is read only',()=>{for(const re of [/localStorage\s*\.\s*setItem\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/])assert.equal(re.test(week),false,String(re));assert(p7.includes('readOnly:true'));assert(p7.includes('networkWrites:false'));assert(p7.includes('storageWrites:false'));assert(p7.includes('poStatusImmutable:true'))});
test('Quote frozen route remains',()=>{assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));assert(quote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'))});
for(const [n,ok,e] of checks)console.log((ok?'PASS':'FAIL')+'  '+n+(e?'  '+e:''));const bad=checks.filter(x=>!x[1]);console.log('\\n'+(checks.length-bad.length)+'/'+checks.length+' checks passed.');if(bad.length)process.exit(1);
