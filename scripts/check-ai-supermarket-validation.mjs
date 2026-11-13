import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const a=readFileSync('validation-directory.html','utf8'),b=readFileSync('validation-guided.html','utf8'),css=readFileSync('validation-prototype.css','utf8');
for(const [name,s] of [['directory',a],['guided',b]]){
assert.match(s,/<meta name="robots" content="noindex,nofollow">/);
assert.match(s,/<html lang="en">/);
assert.match(s,/validation-prototype\.css/);
assert.match(s,/fictional two-page meeting note/i);
assert.match(s,/No (real vendors|uploads)/i);
assert.doesNotMatch(s,/<script\b|<form\b|<iframe\b|<input\b|<button\b/i);
assert.doesNotMatch(s,/<img\b|https?:\/\/|fetch\s*\(|localStorage|sessionStorage/i);
assert.match(s,/validation-directory\.html/);assert.match(s,/validation-guided\.html/);
console.log(name+' static safeguards PASS');
}
assert.equal((a.match(/class="card"/g)||[]).length,6,'directory has six categories');
assert.equal((b.match(/class="card"/g)||[]).length,3,'guided has three profiles');
for(const term of ['Privacy:','Cost:','Trade-off:'])assert.equal((b.match(new RegExp(term,'g'))||[]).length,3,term+' in each guided option');
assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/:focus-visible/);
console.log('validation prototypes static checks PASS');
