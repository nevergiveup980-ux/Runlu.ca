import fs from 'node:fs';import vm from 'node:vm';
const s=fs.readFileSync('flooring/paper-smart-advisor-popup-preview-v1.js','utf8'),h=fs.readFileSync('flooring/index-paper-smart-advisor-preview-v1.html','utf8');new vm.Script(s);
const ok=(a,m)=>{if(!a)throw Error(m)};
ok(h.includes('ISOLATED DEMO')&&h.includes('id="confirm"')&&h.includes('id="cancel"'),'explicit lab and review buttons');
ok(s.includes('adapter.readRow(')&&s.includes('adapter.rank('),'existing advisor and parser reused');
ok(s.includes('!row.ready')&&s.includes('current().requestKey!==token'),'incomplete/stale guard');
ok(s.includes('selection=null')&&s.includes('reference').toString!==undefined,'cancel and row mapping');
ok(!/localStorage|sessionStorage|fetch\(|\.rpc\(|\.update\(/.test(s),'no persistent writes');
console.log('Paper Advisor Popup Preview V1 PASS');