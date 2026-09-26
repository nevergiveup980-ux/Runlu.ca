import fs from 'node:fs';import assert from 'node:assert/strict';
const phase=fs.readFileSync(new URL('../flooring/mobile-safe-phase9-v0403k.js',import.meta.url),'utf8');
const fast=fs.readFileSync(new URL('../flooring/mobile-safe-fastboot-v0403k.js',import.meta.url),'utf8');
const preview=fs.readFileSync(new URL('../flooring/index-v098-dispatch-morning-preview.html',import.meta.url),'utf8');
const safe=fs.readFileSync(new URL('../flooring/week-schedule-v098-safe.js',import.meta.url),'utf8');
const v71=fs.readFileSync(new URL('../flooring/index-v071-pricing-workspace.html',import.meta.url),'utf8');
const checks=[];function t(n,f){try{f();checks.push([n,true])}catch(e){checks.push([n,false,e.message])}}
t('Phase 9 exposes V0.3.98 launcher only',()=>{assert(phase.includes('RUNLUMobileSafePhase9V0398'));assert(phase.includes("startup:'launcher-only'"))});
t('Explicit click opens standalone preview synchronously',()=>{assert(phase.includes("root.open(PREVIEW,'_blank','noopener')"));assert(!phase.includes('await '));assert(!phase.includes('week-schedule-v098-safe.js'))});
t('Preview owns real safe module',()=>assert(preview.includes('week-schedule-v098-safe.js?v=0403k-safe')));
t('Fast Boot registers Phase 9 after Phase 8',()=>{const a=fast.indexOf("name:'phase8'"),b=fast.indexOf("name:'phase9'");assert(a>=0&&b>a);assert(fast.includes('mobile-safe-phase9-v0403k.js?v=0403k'));assert(!fast.includes('week-schedule-v098-safe.js'))});
t('V071 routes to 0403k Fast Boot/cache',()=>{assert(v71.includes('mobile-safe-fastboot-v0403k.js?v=0403k'));assert(v71.includes('mobile-safe-0403k'))});
t('Diagnostics preserve frozen boundaries',()=>{for(const s of ["readOnly:true","networkWrites:false","storageWrites:false","poStatusImmutable:true"])assert(phase.includes(s))});
t('Safe module remains absolute read-only',()=>{for(const re of [/localStorage\s*\.\s*setItem\s*\(/,/localStorage\s*\.\s*removeItem\s*\(/,/indexedDB\s*\.\s*open\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/])assert.equal(re.test(safe),false)});
t('Dispatch Morning core restored',()=>{assert(/0\.3\.98/.test(safe));assert(/dispatch/i.test(safe));assert(/morning/i.test(safe))});
t('Phone launcher remains touch-safe',()=>{assert(phase.includes('min-height:48px'));assert(phase.includes('font-size:16px'))});
const failed=checks.filter(x=>!x[1]);for(const c of checks)console.log((c[1]?'PASS':'FAIL')+'  '+c[0]+(c[2]?'  '+c[2]:''));console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');if(failed.length)process.exit(1);
