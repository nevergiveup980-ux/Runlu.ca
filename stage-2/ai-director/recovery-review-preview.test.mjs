import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('./recovery-review-preview.html',import.meta.url),'utf8');
test('recovery page is mobile-first and explicitly read-only',()=>{
 assert.match(html,/name="viewport"/);
 assert.match(html,/Automatic retry disabled/);
 assert.match(html,/DEMO ONLY/);
 assert.doesNotMatch(html,/<button[^>]*>\s*(?:Retry|Submit|Pay|Generate)\s*<\/button>/i);
});
test('live recovery uses same-origin no-store fetch and validated projection',()=>{
 assert.match(html,/credentials:'same-origin'/);
 assert.match(html,/cache:'no-store'/);
 assert.match(html,/projectDirectorRecovery\(json\.data\.items\)/);
 assert.match(html,/json\?\.data\?\.episodeId!==episodeId/);
});
test('rendering uses textContent rather than raw HTML insertion',()=>{
 assert.match(html,/root\.replaceChildren\(\)/);
 assert.match(html,/title\.textContent/);
 assert.doesNotMatch(html,/innerHTML|insertAdjacentHTML|document\.write/);
});
