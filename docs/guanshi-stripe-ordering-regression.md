# GUANSHI Stripe webhook ordering regression checklist

Status: review-only. No production Stripe charge, webhook replay, or database mutation.

## Verified v14 code paths
- customer.subscription.created/updated/deleted calls ensureSubscription() before event normalization and fulfillment.
- invoice.paid writes runlu_subscriptions.status=active and invoice period before event normalization and fulfillment.
- ensureSubscription() updates existing subscription status, period, and cancel_at_period_end without comparing Stripe event chronology.
- Entitlement ordering guards do not protect these earlier direct subscription-row writes.

## Required isolated tests
1. Process subscription.updated(active, T2), then older subscription.deleted(canceled, T1). Subscription row and effective access must remain at T2.
2. Process subscription.deleted(canceled, T2), then older invoice.paid(T1). Status must remain canceled; no access resurrection.
3. Deliver identical event twice; no duplicate entitlement or order.
4. Deliver same-second conflicting events; reconcile from current Stripe subscription state rather than arbitrary arrival order.
5. Process invoice.paid with a newer billing period, then older invoice.paid; billing period must not regress.
6. Process cancel_at_period_end=true while still active; preserve access until paid-through date, then expire.
7. Simulate transient database failure after receipt claim; retry must complete without duplicate side effects.

## Release gate
- Verify against Stripe test-mode fixtures and isolated Supabase database.
- Keep PR #402 unmerged and live checkout untouched until all checks pass.
- Reconcile historical September 2026 live Checkout Session directly against Stripe before any data repair.
