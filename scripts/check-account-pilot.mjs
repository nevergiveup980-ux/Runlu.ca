import fs from 'node:fs';

const html = fs.readFileSync('account.html', 'utf8');
const js = fs.readFileSync('runlu-account.js', 'utf8');
const commerceJs = fs.readFileSync('runlu-account-commerce.js', 'utf8');
const css = fs.readFileSync('runlu-account.css', 'utf8');
const storeCss = fs.readFileSync('runlu-account-store.css', 'utf8');
const planJs = fs.readFileSync('runlu-account-plan.js', 'utf8');
const planCss = fs.readFileSync('runlu-account-plan.css', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');

function requireToken(source, token, message) {
  if (!source.includes(token)) throw new Error(message);
}

requireToken(html, 'noindex,nofollow', 'Account pilot must remain noindex/nofollow until public launch.');
requireToken(html, 'no-cache, no-store, must-revalidate', 'Account pilot cache hardening is missing.');
requireToken(html, 'runlu-account.css?v=4', 'Account page is not loading the base CSS build.');
requireToken(html, 'runlu-account-store.css?v=2', 'Account Store preview CSS is missing.');
requireToken(html, 'runlu-account.js?v=9', 'Account page is not loading the current core JS build.');
requireToken(html, 'runlu-account-commerce.js?v=1', 'Account commerce-history reader is missing.');
requireToken(html, 'runlu-account-plan.css?v=2', 'Account Plan Center CSS is missing.');
requireToken(html, 'runlu-account-plan.js?v=2', 'Account Plan Center reader is missing.');
requireToken(html, 'id="planCenter"', 'Account Plan Center container is missing.');
requireToken(html, 'id="libraryList"', 'Account Library container is missing.');
requireToken(html, 'id="storeList"', 'Account Store preview container is missing.');
requireToken(html, 'id="ordersList"', 'Account Orders container is missing.');
requireToken(html, 'id="subscriptionsList"', 'Account Subscriptions container is missing.');
requireToken(css, '[hidden]{display:none!important}', 'Hidden auth/recovery fields can be exposed by CSS without the hidden override.');
requireToken(storeCss, '.store-action.planned', 'Store preview must visibly distinguish planned paid offers.');

requireToken(js, "const ACCOUNT_RETURN_URL = 'https://runlu.ca/account.html'", 'Account return URL changed unexpectedly.');
requireToken(js, 'resetPasswordForEmail', 'Forgot-password flow is missing.');
requireToken(js, "event==='PASSWORD_RECOVERY'", 'Password-recovery event handling is missing.');
requireToken(js, 'recoveryMode', 'Recovery-mode state guard is missing.');
requireToken(js, 'updateUser({password:el.newPassword.value})', 'Password update flow is missing.');
requireToken(js, 'signInWithPassword', 'Password sign-in flow is missing.');
requireToken(js, 'signUp', 'Account creation flow is missing.');
requireToken(js, "account_status==='suspended'", 'Suspended-account guard is missing.');
requireToken(js, "client.from('runlu_account_library_v1')", 'Account Library is not reading the hardened Library view.');
requireToken(js, "client.from('runlu_store_offers_v1')", 'Account Store preview is not reading the Store offers view.');
requireToken(js, 'const seen=new Set()', 'Account product/plan-key deduplication is missing.');
requireToken(js, 'document.createDocumentFragment()', 'Account atomic rendering is missing.');
requireToken(js, 'el.libraryList.replaceChildren(fragment)', 'Account Library must replace rendered contents atomically.');
requireToken(js, 'el.storeList.replaceChildren(fragment)', 'Account Store must replace rendered contents atomically.');
requireToken(js, "row.action_state==='ready_for_checkout'?'checkout_not_enabled':'planned'", 'Paid offers must not silently become clickable before checkout is integrated.');
requireToken(js, "client.rpc('runlu_activate_free_plan'", 'Eligible free plans must activate through the narrow authenticated RPC.');
requireToken(js, "ownedProducts.has(row.product_key)", 'Already-entitled products must not create redundant free activation UI.');
requireToken(js, "runlu:account-entitlements-changed", 'Plan Center refresh signal after entitlement changes is missing.');
requireToken(planJs, "client.rpc('runlu_get_my_plan_transition_state'", 'Plan Center must read the authenticated account transition state.');
requireToken(planJs, "client.rpc('runlu_get_my_guanshi_cloud_ai_usage'", 'Plan Center must read the authenticated account AI allowance.');
requireToken(planJs, "client.rpc('runlu_get_user_capabilities'", 'Plan Center must read authenticated entitlement capabilities.');
requireToken(planJs, "guanshi.deep_reading", 'Capability Center must represent Deep Reading as a separate capability.');
requireToken(planJs, "Paid checkout remains disabled", 'Plan Center must preserve the paid-checkout lock copy.');
if (/\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(planJs)) { throw new Error('Account Plan Center must remain read-only until checkout is explicitly enabled.'); }

requireToken(commerceJs, "client.from('runlu_account_orders_v1')", 'Account Orders is not reading its own-account view.');
requireToken(commerceJs, "client.from('runlu_account_subscriptions_v1')", 'Account Subscriptions is not reading its own-account view.');
requireToken(commerceJs, 'ordersList.replaceChildren(fragment)', 'Orders history must render atomically.');
requireToken(commerceJs, 'subscriptionsList.replaceChildren(fragment)', 'Subscriptions history must render atomically.');
if (/\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(commerceJs)) {
  throw new Error('Account commerce-history reader must remain read-only until checkout is explicitly enabled.');
}

if (/\bre_[A-Za-z0-9_\-]{20,}\b/.test(html + js + commerceJs + planJs + css + storeCss + planCss)) {
  throw new Error('A Resend-style secret appears to be embedded in public Account assets.');
}

if (/href=["'][^"']*account\.html/i.test(home)) {
  throw new Error('Account pilot is linked from the public home page before launch approval.');
}

console.log('RUNLU Account pilot contract passed: auth, recovery, hardened Library, Store preview, read-only Plan/Capability Center and Orders/Subscriptions history, atomic rendering, cache, privacy and private-pilot guards verified.');
