#!/usr/bin/env node
// Offline, dependency-free smoke check of the standalone Studio page.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'music-studio.html'), 'utf8');
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]\n  .filter(m => !/\\bsrc\\s*=/.test(m[1]))\n  .map(m => m[2]);
assert.equal(scripts.length, 1, 'Expected exactly one inline script');
new vm.Script(scripts[0], { filename: 'music-studio.inline.js' });
for (const id of ['title','lyrics','voice','style','notes','save','export','copy','stage','import','importfile','audiofile','audioplayer','clearaudio','status','prompt']) {
  assert.match(html, new RegExp('id="' + id + '"'), 'Missing control: ' + id);
}
assert.match(html, /data-runlu-language-select/);\nassert.match(html, /<script src="runlu-language\.js"><\/script>/);\nfor (const lang of ['en', 'zh', 'fr', 'es']) {\n  assert.match(html, new RegExp('data-' + lang + '='), 'Missing translations for ' + lang);\n}\nassert.match(html, /localStorage/);
assert.match(html, /URL\.createObjectURL/);
assert.doesNotMatch(html, /GEMINI_API_KEY|AIza[0-9A-Za-z_-]{20,}/, 'Potential API key exposure');
console.log('PASS: Studio inline JavaScript parses and expected controls exist; no browser interactions exercised.');
