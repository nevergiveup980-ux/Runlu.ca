import fs from 'node:fs';

const access=fs.readFileSync('guanshi-access.js','utf8');
const pages={
  'guanshi-consult.html':'guanshi.cloud_ai',
  'guanshi-traditional-consult.html':'guanshi.traditional_view',
  'guanshi-validation.html':'guanshi.validation_lab',
  'guanshi-library.html':'guanshi.local_knowledge',
  'guanshi-vault.html':'guanshi.local_vault'
};

function requireToken(source,token,message){if(!source.includes(token))throw new Error(message)}

requireToken(access,"client.rpc('runlu_get_my_protected_page_access'",'Protected-page gate is not using the server-authoritative page-access RPC.');
requireToken(access,"client.rpc('runlu_get_user_capabilities'",'Protected-page gate is not reading the effective capability matrix.');
requireToken(access,"Protected page capability mismatch.",'Protected-page gate is not fail-closing on HTML/server capability drift.');
requireToken(access,"product_access_required",'Protected-page gate no longer routes accounts without product access to Free activation.');
requireToken(access,"window.RUNLU_AUTH",'Protected-page gate is not exposing the authenticated session handoff.');
if(access.includes("client.from('runlu_account_library_v1')"))throw new Error('Protected-page gate must not infer page authorization from Library membership.');
if(/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(access))throw new Error('Protected-page client must not contain a service-role credential or role.');
if(/\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(access))throw new Error('Protected-page gate must remain read-only.');

for(const [page,capability] of Object.entries(pages)){
  const html=fs.readFileSync(page,'utf8');
  requireToken(html,'class="runlu-access-pending"',page+' must fail closed before access verification.');
  requireToken(html,'noindex,nofollow',page+' must remain noindex/nofollow while protected.');
  requireToken(html,'data-runlu-capability="'+capability+'"',page+' capability declaration drifted from the server registry.');
  requireToken(html,'guanshi-access.js?v=5',page+' is not loading the server-authoritative access gate.');
}

const publicLanding=fs.readFileSync('guanshi.html','utf8');
if(publicLanding.includes('guanshi-access.js'))throw new Error('Public GUANSHI landing page must remain open and must not load the protected-page gate.');

console.log('GUANSHI protected-page contract passed: server registry, capability drift guard, private-page fail-closed state and public landing boundary verified.');
