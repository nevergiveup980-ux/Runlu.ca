// Isolated candidate, NOT a deployed Edge Function. Input must already be
// signature-verified and correlated by the trusted webhook adapter.
// Store contract: commit atomically fences revision, deduplicates the receipt,
// writes subscription + entitlement + receipt. Never split these into HTTP calls.
const lifecycle = new Set(['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted']);
const supported = new Set([...lifecycle, 'invoice.paid', 'invoice.payment_failed', 'checkout.session.completed']);
const statuses = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused', 'canceled', 'incomplete', 'incomplete_expired']);

function snapshot(s, ref) {
  if (!s || s.id !== ref || !statuses.has(s.status)) throw new Error('invalid_subscription_snapshot');
  const item = s.items?.data?.[0];
  const start = s.current_period_start ?? item?.current_period_start;
  const end = s.current_period_end ?? item?.current_period_end;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end <= start)
    throw new Error('invalid_subscription_period');
  if (typeof s.cancel_at_period_end !== 'boolean') throw new Error('invalid_cancellation_flag');
  return { status: s.status, periodStart: start, periodEnd: end, cancelAtPeriodEnd: s.cancel_at_period_end };
}

export function createProcessor({ store, retrieveSubscription }) {
  return async function process(event) {
    if (!event?.verified || !event.correlated || !/^evt_[A-Za-z0-9]+$/.test(event.id) ||
        !/^sub_[A-Za-z0-9]+$/.test(event.subscription) || !supported.has(event.type) ||
        !Number.isSafeInteger(event.created) || event.created <= 0 || !event.payloadHash)
      throw new Error('invalid_verified_event');
    // Retries are bounded. Exhaustion is a retryable failure, never a 2xx duplicate.
    for (let attempt = 0; attempt < 4; attempt++) {
      const receipt = store.receipt(event.id);
      if (receipt) {
        if (receipt.payloadHash !== event.payloadHash || receipt.subscription !== event.subscription)
          throw new Error('event_identity_conflict');
        return 'duplicate';
      }
      const current = store.read(event.subscription);
      const stale = current?.clock && event.created < current.clock.created;
      let next = null;
      if (!stale) {
        // Always retrieve current subscription: invoice payment and Checkout
        // placeholders cannot assert subscription state, even with newer clocks.
        // Read revision BEFORE the network call; CAS rejects a delayed response.
        next = snapshot(await retrieveSubscription(event.subscription), event.subscription);
        if (['canceled', 'incomplete_expired'].includes(current?.status) && next.status !== current.status)
          throw new Error('terminal_subscription_conflict');
      }
      const outcome = store.commit({ event, expectedRevision: current?.revision ?? 0, next });
      if (outcome !== 'conflict') return outcome;
    }
    throw new Error('subscription_busy_retry');
  };
}
