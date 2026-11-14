// Opt-in real inference. Never invoked by CI or the normal test suite.
import { PGlite } from '@electric-sql/pglite';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHandler, MODELS, SafeError } from '../../supabase/functions/runlu-forum-ai/core.mjs';

const dual = process.argv.includes('--dual');
if (process.argv.slice(2).some(v => v !== '--dual')) {
  console.error('Use no arguments for Gemini only, or --dual for Gemini then a two-round OpenAI + Gemini discussion.');
  process.exit(2);
}
const required = ['GEMINI_API_KEY', ...(dual ? ['OPENAI_API_KEY'] : [])];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(JSON.stringify({ ok: false, error: 'MISSING_SERVER_ENVIRONMENT', variables: missing, provider_calls: 0 }));
  process.exit(2);
}
// The ledger persists across runs. Deleting it resets only this local test ledger.
// It is separate from production: local reservations do not imply a shared account billing cap.
const db = new PGlite(fileURLToPath(new URL('./.live-budget/', import.meta.url)));
const fingerprint = p => createHash('sha256').update(process.env[({ Gemini:'GEMINI_API_KEY',OpenAI:'OPENAI_API_KEY',Claude:'ANTHROPIC_API_KEY' })[p]] || '').digest('hex');
const client = createHash('sha256').update(`local-forum-smoke|${new Date().toISOString().slice(0,10)}`).digest('hex');
const rpc = async (name, values = []) => {
  const placeholders = values.map((_, i) => `$${i+1}`).join(',');
  return (await db.query(`select public.${name}(${placeholders}) as result`, values)).rows[0].result;
};
const ledger = {
  async reserve(_req, calls) {
    const r = await rpc('forum_ai_reserve_v2', [client, calls]);
    if (r.error) throw new SafeError(r.error, 429);
    return r.id;
  },
  async status() {
    const s = await rpc('forum_ai_status_v2');
    for (const p of Object.keys(MODELS)) s.verified[p] = s.verified[p] === fingerprint(p);
    return s;
  },
  record: (id, provider, success, usage, cost) => rpc('forum_ai_record_v2', [id, provider, success, usage, cost, fingerprint(provider)]),
  finish: id => rpc('forum_ai_finish_v2', [id]),
};
try {
  // Bootstrap only the isolated local PostgreSQL engine; no Supabase URL or role key.
  await db.exec(`do $$ begin
    if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
    if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
    if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
    end $$;
    create table if not exists public.forum_ai_usage(usage_date date,estimated_cost_usd numeric);`);
  await db.exec(await fs.readFile(new URL('../../supabase/schema/forum-ai-budget-v2.sql', import.meta.url), 'utf8'));
  const handler = createHandler({ env: name => process.env[name], ledger });
  const run = async (name, payload, expected) => {
    const response = await handler(new Request('https://local-forum.test', { method:'POST', body:JSON.stringify(payload) }));
    const data = await response.json();
    const results = data.results || [];
    const ok = response.ok && data.ok && results.length === expected.length && results.every((r,i) => r.provider===expected[i] && typeof r.text==='string' && r.text.trim());
    // Deliberately do not print request/response text, credentials, hashes or stack traces.
    console.log(JSON.stringify({ test:name, ok:Boolean(ok), http:response.status, error:data.error, results:results.map(r => ({provider:r.provider,model:r.model,round:r.round,error:r.error,usage:r.usage,estimated_cost_usd:r.estimated_cost_usd})), budget:data.budget }));
    if (!ok) throw new SafeError('LIVE_ACCEPTANCE_FAILED');
  };
  await run('Gemini independent real reply', { title:'Technical connection check', body:'Reply in one short sentence: what is 2 + 2?', providers:['Gemini'], rounds:1 }, ['Gemini']);
  if (dual) await run('OpenAI + Gemini two real rounds', { title:'Technical bounded discussion check', body:'Briefly discuss one benefit and one limitation of automated software tests.', providers:['OpenAI','Gemini'], rounds:2 }, ['OpenAI','Gemini','OpenAI','Gemini']);
  const status = await ledger.status();
  console.log(JSON.stringify({ ok:true, verified:status.verified, budget:status.budget, scope:'local core + local SQL + real provider APIs; not deployed Supabase acceptance' }));
} catch (e) {
  console.error(JSON.stringify({ ok:false, error:e instanceof SafeError?e.code:'LOCAL_SMOKE_FAILED' }));
  process.exitCode=1;
} finally { await db.close(); }
