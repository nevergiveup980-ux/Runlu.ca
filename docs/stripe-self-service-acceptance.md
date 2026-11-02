# RUNLU Stripe self-service subscription acceptance checklist

## Status
Draft implementation only. Do not merge or deploy until the following gates pass.

## Identity and correlation
- Confirm each live Stripe GUANSHI subscription has runlu_user_id, runlu_plan_key and runlu_checkout_contract_id metadata from a verified checkout.
- Confirm the webhook receives customer.subscription.created / updated / deleted for the same Stripe account and mode as checkout.
- Verify runlu_subscriptions contains the authenticated user's provider_customer_reference and provider_subscription_reference; never backfill by matching email alone.
- Test user A cannot open user B's portal, including manipulated client requests.
- If one RUNLU user has multiple Stripe customer IDs, return a safe error and reconcile server-side.

## Customer portal
- Configure Stripe Billing > Customer portal to allow cancellation and display cancellation policy.
- Check the portal is in live mode and uses the matching live secret; test mode separately.
- Confirm the portal return URL is https://runlu.ca/account.html#subscriptions.
- Test active subscription cancellation at period end, immediate cancellation (if offered), and card update.
- Confirm webhook updates entitlements at the correct effective time; cancel_at_period_end must not revoke already-paid access early.
- Confirm past-due/unpaid and canceled statuses are represented accurately.
- Ensure Apple-managed purchases are directed to Apple's subscription management instead.

## Security and release
- Deploy runlu-stripe-portal with verify_jwt=true and server-side STRIPE_SECRET_KEY only.
- Verify the edge function's origin allowlist, no-store response and no customer ID accepted from browser.
- Verify a customer exists in Stripe under the configured key before creating a portal session.
- Verify browser UI in English, Chinese, French and Spanish.
- Run a controlled real account test before merging PR.
- Never cancel or charge an existing user as part of automated acceptance testing.
