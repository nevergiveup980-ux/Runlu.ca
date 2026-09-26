/* RUNLU Flooring OS Universal · Offline App Shell */
const CACHE='runlu-flooring-universal-shell-v31';
const SHELL=[
 './','./index.html','./universal-data-adapter.js','./universal-indexeddb.js','./universal-local-health.js','./universal-data-version.js','./universal-crash-journal.js','./universal-interrupted-resolver.js','./universal-crash-simulator.js','./universal-startup-guard.js',
 './universal-config.js','./role-permissions.js','./universal-audit.js','./universal-lifecycle-guards.js','./universal-sales.js','./universal-po.js',
 './universal-inbound.js','./universal-warehouse.js','./universal-accounting.js','./universal-installation.js','./universal-billing.js',
 './universal-lifecycle-gate.js','./universal-recovery.js','./universal-release-gate.js','./universal-scenario-simulator.js','./universal-data-status.js',
 './universal-indexeddb-ui.js','./universal-pwa.js','./universal-device-ready.js','./universal-diagnostics.js','./universal-backup.js','./universal-data-exchange.js','./universal-support-center.js','./universal-shell.js',
 './universal-sales.css','./universal-po.css','./universal-inbound.css','./universal-warehouse.css','./universal-accounting.css',
 './universal-installation.css','./universal-billing.css','./universal-lifecycle-gate.css','./universal-audit.css','./universal-recovery.css',
 './universal-release-gate.css','./universal-scenario-simulator.css','./universal-data-status.css','./universal-backup.css',
 './universal-data-exchange.css','./universal-local-health.css','./universal-pwa.css','./universal-support-center.css','./universal-startup-guard.css','./universal-crash-journal.css','./universal-interrupted-resolver.css','./universal-crash-simulator.css','./universal-device-ready.css','./universal-diagnostics.css','./universal-data-version.css','./universal-indexeddb.css','./manifest.webmanifest','./app-icon.svg'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('runlu-flooring-universal-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r})));
});