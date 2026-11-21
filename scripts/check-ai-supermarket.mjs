import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('ai-supermarket.html','utf8');
const css=fs.readFileSync('ai-supermarket.css','utf8');
const shared=fs.readFileSync('runlu-language.js','utf8');
const policy=fs.readFileSync('docs/ai-supermarket/THIRD_PARTY_REVIEW_POLICY.md','utf8');
const principles=fs.readFileSync('docs/ai-supermarket/OPERATING_PRINCIPLES.md','utf8');
const fail=(msg)=>{throw new Error(msg)};
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
assert.match(html,/<select\b[^>]*data-runlu-language-select/);
assert.match(html,/<script src="runlu-language\.js" defer><\/script>/);
assert.match(shared,/const KEY='runlu_site_language'/);
assert.doesNotMatch(html,/<(?:iframe|form|video|audio|img)\b/i);
assert.doesNotMatch(html,/<script[^>]*src="https?:/i);
assert.doesNotMatch(html,/<link[^>]*href="https?:/i);
assert.doesNotMatch(html,/(?:stripe|checkout|api\.openai|api\.anthropic|api\.google)/i);
assert.match(css,/@media\(max-width:740px\)/);
assert.match(css,/@media\(max-width:430px\)/);
for(const tag of html.matchAll(/<[^!][^>]*\bdata-en="[^"]*"[^>]*>/g)){
  for(const lang of ['zh','fr','es'])if(!tag[0].includes('data-'+lang+'='))fail('Missing '+lang+' translation: '+tag[0].slice(0,100));
}
const articles=[...html.matchAll(/<article>/g)].length;
assert.equal(articles,6,'Six categories required');
for(const language of ['en','zh','fr','es'])assert.match(html,new RegExp('<option value="'+language+'">'));
for(const file of [policy,principles])assert.ok(file.length>500);

// Accessibility regression contracts (static checks; not a browser audit).
assert.match(html,/<a class="skip-link" href="#main"[^>]*data-en="Skip to main content"/);
assert.match(html,/<main id="main">/);
assert.match(html,/<nav aria-label="Page navigation">/);
assert.match(html,/<section aria-labelledby="categories">/);
assert.match(html,/<h2 id="categories"/);
assert.match(css,/\.skip-link:focus\s*\{/);
assert.match(css,/:focus-visible\s*\{/);
assert.match(css,/\.language select\s*\{[^}]*min-height:\s*44px/);
assert.match(css,/\.top nav\s*\{[^}]*flex-wrap:\s*wrap/);
assert.doesNotMatch(html,/<a\b[^>]*target="_blank"(?![^>]*rel="[^"]*noopener)/i);

console.log('AI Supermarket foundation static guard PASS: 6 categories, 4 languages, shared selector, noindex, no third-party embeds/API/payment, responsive breakpoints, governance files.');
