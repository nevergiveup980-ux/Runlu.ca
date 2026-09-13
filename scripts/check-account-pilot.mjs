import fs from 'node:fs';

const html = fs.readFileSync('account.html', 'utf8');
const js = fs.readFileSync('runlu-account.js', 'utf8');
const css = fs.readFileSync('runlu-account.css', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');

function requireToken(source, token, message) {
  if (!source.includes(token)) throw new Error(message);
}

requireToken(html, 'noindex,nofollow', 'Account pilot must remain noindex/nofollow until public launch.');
requireToken(html, 'no-cache, no-store, must-revalidate', 'Account pilot cache hardening is missing.');
requireToken(html, 'runlu-account.css?v=3', 'Account page is not loading the current CSS build.');
requireToken(html, 'runlu-account.js?v=4', 'Account page is not loading the current JS build.');
requireToken(css, '[hidden]{display:none!important}', 'Hidden auth/recovery fields can be exposed by CSS without the hidden override.');

requireToken(js, "const ACCOUNT_RETURN_URL = 'https://runlu.ca/account.html'", 'Account return URL changed unexpectedly.');
requireToken(js, 'resetPasswordForEmail', 'Forgot-password flow is missing.');
requireToken(js, "event==='PASSWORD_RECOVERY'", 'Password-recovery event handling is missing.');
requireToken(js, 'recoveryMode', 'Recovery-mode state guard is missing.');
requireToken(js, 'updateUser({password:el.newPassword.value})', 'Password update flow is missing.');
requireToken(js, 'signInWithPassword', 'Password sign-in flow is missing.');
requireToken(js, 'signUp', 'Account creation flow is missing.');
requireToken(js, "account_status==='suspended'", 'Suspended-account guard is missing.');

if (/\bre_[A-Za-z0-9_\-]{20,}\b/.test(html + js + css)) {
  throw new Error('A Resend-style secret appears to be embedded in public Account assets.');
}

if (/href=["'][^"']*account\.html/i.test(home)) {
  throw new Error('Account pilot is linked from the public home page before launch approval.');
}

console.log('RUNLU Account pilot contract passed: auth, recovery, cache, privacy and private-pilot guards verified.');
