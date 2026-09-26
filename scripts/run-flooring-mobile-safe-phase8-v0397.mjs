import fs from 'node:fs';import assert from 'node:assert/strict';
const phase=fs.readFileSync(new URL('../flooring/mobile-safe-phase8-v0403j.js',import.meta.url),'utf8');
const fast=fs.readFileSync(new URL('../flooring/mobile-safe-fastboot-v0403j.js',import.meta.url),'utf8');
const preview=fs.readFileSync(new URL('../flooring/index-v097-installer-workload-preview.html',import.meta.url),'utf8');
const safe=fs.readFileSync(new URL('../flooring/week-schedule-v097-safe.js',import.meta.url),'utf8');
const v71=fs.readFileSync(new URL('../flooring/index-v071-pricing-workspace.html',import.meta.url),'utf8');
const checks=[];function t(n,f){try{f();checks.push([n,true])}catch(e){checks.push([n,false,e.message])}}
t('Phase 8 exposes V0.3.97 launcher only',()=>{assert(phase.includes('RUNLUMobileSafePhase8V0397'));assert(phase.includes("startup:'launcher-only'"))});
t('Explicit click opens standalone preview synchronously',()=>{assert(phase.includes("root.open(PREVIEW,'_blank','noopener')"));assert(!phase.includes('await '));assert(!phase.includes('week-schedule-v097-safe.js'))});
t('Preview owns real safe business module',()=>assert(preview.includes('week-schedule-v097-safe.js?v=0403j-safe')));
t('Fast Boot registers Phase 8 launcher, not business module',()=>{assert(fast.includes('mobile-safe-phase8-v0403j.js?v=0403j'));assert(!fast.includes('week-schedule-v097-safe.js'))});
t('V071 routes to 0403j Fast Boot/cache',()=>{assert(v71.includes('mobile-safe-fastboot-v0403k.js?v=0403k'));assert(v71.includes('mobile-safe-0403k'))});
t('Diagnostics preserve frozen boundaries',()=>{for(const s of ["readOnly:true","networkWrites:false","storageWrites:false","poStatusImmutable:true"])assert(phase.includes(s))});
t('Safe module remains absolute read-only',()=>{for(const re of [/localStorage\s*\.\s*setItem\s*\(/,/localStorage\s*\.\s*removeItem\s*\(/,/indexedDB\s*\.\s*open\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/])assert.equal(re.test(safe),false)});
t('Safe module exports V0.3.97 API',()=>{assert(safe.includes("const VERSION='0.3.97'"));assert(safe.includes('RUNLUWeekScheduleV097'))});
t('Installer workload/conflict engine restored',()=>{for(const s of ['workloadMatrix','conflictAnalysis','timedHardOverlap','installerTasks'])assert(safe.includes(s))});
t('Phone launcher remains touch-safe',()=>{assert(phase.includes('min-height:48px'));assert(phase.includes('font-size:16px'))});
const failed=checks.filter(x=>!x[1]);for(const c of checks)console.log((c[1]?'PASS':'FAIL')+'  '+c[0]+(c[2]?'  '+c[2]:''));console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');if(failed.length)process.exit(1);
