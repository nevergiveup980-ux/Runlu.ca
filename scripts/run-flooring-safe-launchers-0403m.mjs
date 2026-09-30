import fs from 'node:fs';import assert from 'node:assert/strict';
const p7=fs.readFileSync(new URL('../flooring/mobile-safe-phase7-v0403i.js',import.meta.url),'utf8');
const p8=fs.readFileSync(new URL('../flooring/mobile-safe-phase8-v0403j.js',import.meta.url),'utf8');
const p9=fs.readFileSync(new URL('../flooring/mobile-safe-phase9-v0403k.js',import.meta.url),'utf8');
assert(p7.includes("root.open('index-v096-week-schedule-preview.html?v=0403i-safe','_blank','noopener')"));
assert(!/async function launch\(\)/.test(p7));
for(const s of [p8,p9]){assert(s.includes("document.querySelector('#command .grid3')"));assert(s.includes("min-height:48px"));assert(s.includes("font-size:16px"))}
assert(p8.includes("index-v097-installer-workload-preview.html?v=0403j-safe"));
assert(p9.includes("index-v098-dispatch-morning-preview.html?v=0403k-safe"));
console.log('PASS Phase 7–9 launchers: synchronous preview open + Command Center visibility');
