import { createHandler, fetchJSON, SafeError } from './core.mjs';
const env = (name: string) => Deno.env.get(name);
async function rpc(name: string, payload: Record<string, unknown> = {}) {
  const url = env('SUPABASE_URL'), key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new SafeError('BUDGET_SERVICE_UNAVAILABLE');
  const { response, data } = await fetchJSON(fetch, `${url}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }, 10000);
  if (!response.ok) throw new SafeError('BUDGET_SERVICE_UNAVAILABLE');
  return data;
}
async function fingerprint(provider: string) {
  const names: Record<string,string> = { Gemini: 'GEMINI_API_KEY', OpenAI: 'OPENAI_API_KEY', Claude: 'ANTHROPIC_API_KEY' };
  const value = env(names[provider]) || '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
const ledger = {
  async reserve(req: Request, calls: number) {
    // Limits are global even when a client spoofs forwarding headers. Hashes rotate daily.
    const identity = `${new Date().toISOString().slice(0,10)}|${req.headers.get('x-forwarded-for') || 'unknown'}`;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
    const client = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    const result = await rpc('forum_ai_reserve_v2', { p_client: client, p_calls: calls });
    if (result.error) throw new SafeError(result.error, result.error === 'DAILY_BUDGET_EXHAUSTED' ? 402 : 429);
    return result.id;
  },
  async status() {
    const state = await rpc('forum_ai_status_v2');
    for (const provider of ['Gemini','OpenAI','Claude']) state.verified[provider] = state.verified[provider] === await fingerprint(provider);
    return state;
  },
  record: async (id: string, provider: string, success: boolean, usage: unknown, cost: number | null) => rpc('forum_ai_record_v2', { p_id: id, p_provider: provider, p_success: success, p_usage: usage, p_cost: cost, p_fingerprint: await fingerprint(provider) }),
  finish: (id: string) => rpc('forum_ai_finish_v2', { p_id: id }),
};
Deno.serve(createHandler({ env, ledger }));
