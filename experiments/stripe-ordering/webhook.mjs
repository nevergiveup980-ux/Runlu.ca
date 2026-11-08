import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// Isolated Fetch API handler. It is never deployed and has no production URL or
// Stripe key. correlate is a server-owned mapping, not editable Stripe metadata.
export function createWebhook({secret,process,correlate,now=()=>Date.now()}) {
  if (!secret) throw new Error('missing_lab_signing_secret');
  return async request => {
    const reply = (status,body) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
    if (request.method !== 'POST') return reply(405,{error:'method_not_allowed'});
    const raw = await request.text();
    const parts = (request.headers.get('stripe-signature') || '').split(',').map(x=>x.trim());
    const t = parts.find(x=>x.startsWith('t='))?.slice(2);
    const signatures = parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3)).filter(x=>/^[0-9a-f]{64}$/.test(x));
    if (!t || !/^\d+$/.test(t) || Math.abs(now()/1000-Number(t))>300) return reply(400,{error:'invalid_signature_timestamp'});
    const digest = createHmac('sha256',secret).update(`${t}.${raw}`).digest();
    if (!signatures.some(x=>timingSafeEqual(digest,Buffer.from(x,'hex')))) return reply(400,{error:'invalid_signature'});
    let event;
    try { event=JSON.parse(raw); } catch { return reply(400,{error:'invalid_json'}); }
    // This lab exclusively accepts synthetic test-mode fixtures.
    if (event?.livemode !== false) return reply(400,{error:'lab_test_mode_only'});
    try {
      const ref = await correlate(event);
      if (!ref) return reply(503,{error:'awaiting_trusted_correlation'});
      const result = await process({id:event.id,type:event.type,created:event.created,
        subscription:ref,verified:true,correlated:true,payloadHash:createHash('sha256').update(raw).digest('hex')});
      return reply(200,{ok:true,result});
    } catch {
      // Busy, database error, Stripe failure and identity conflicts remain retryable.
      // No raw error or payload containing customer information is returned.
      return reply(503,{error:'retryable_processing_failure'});
    }
  };
}
