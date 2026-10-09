// Fail the site build when a commerce script, product, or buy button regresses.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const read = p => fs.readFileSync(p, 'utf8');
for (const path of ['commerce-config.js', 'runlu-commerce.js']) {
  execFileSync(process.execPath, ['--check', path], {stdio:'inherit'});
}
const context = {window:{}};
vm.runInNewContext(read('commerce-config.js'), context, {filename:'commerce-config.js', timeout:1000});
const cfg = context.window.RUNLUCommerceConfig;
assert.equal(cfg?.provider, 'stripe', 'Stripe commerce config is missing');
assert.ok(cfg?.products, 'Product registry missing');
const products = Object.entries(cfg.products);
assert.ok(products.length >= 6, 'Product registry unexpectedly shrank');
for (const [key, product] of products) {
  assert.ok(product.name && product.price, key + ': name or price missing');
  assert.equal(product.enabled, true, key + ': unexpectedly disabled');
  const url = new URL(product.checkoutUrl);
  assert.equal(url.protocol, 'https:', key + ': non-HTTPS checkout');
  assert.equal(url.hostname, 'buy.stripe.com', key + ': wrong checkout host');
  assert.ok(url.pathname.length > 1 && !url.pathname.slice(1).includes('/'), key + ': malformed Stripe link');
  if (product.requiresServerReference) {
    assert.ok(product.requiresAccount, key + ': server checkout requires account');
    assert.ok(cfg.account?.referenceEndpoint?.startsWith('https://'), key + ': missing server checkout endpoint');
  }
}
const pages = ['digital.html', 'small-business-command-center.html', 'project-assistant.html', 'next-product.html'];
let buttons = 0;
for (const page of pages) {
  const html = read(page);
  const keys = [...html.matchAll(/data-commerce-buy=["']([^"']+)["']/g)].map(m => m[1]);
  for (const key of keys) {
    assert.ok(cfg.products[key], page + ': unregistered buy button ' + key);
    assert.ok(html.includes('commerce-config.js') && html.includes('runlu-commerce.js'), page + ': commerce scripts missing');
    buttons++;
  }
  for (const match of html.matchAll(new RegExp('https://buy[.]stripe[.]com/[A-Za-z0-9]+', 'g'))) {
    assert.ok(products.some(([,p]) => p.checkoutUrl === match[0]), page + ': direct link is not in product registry');
  }
}
assert.ok(buttons >= 2, 'Commerce buttons unexpectedly missing');
console.log('Commerce guard PASS:', products.length, 'products,', buttons, 'buy buttons, script syntax and checkout URLs verified (static checks only).');
