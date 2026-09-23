# RUNLU FORESIGHT · GUANSHI Pricing

Status: **Public pricing established · paid checkout not yet enabled**

Canonical public page: `guanshi-pricing.html`

## Launch pricing · CAD

| Plan | Price | Cloud AI allowance | Billing / fulfillment |
| --- | ---: | ---: | --- |
| GUANSHI Free | CA$0 | 2 / account / day | Free product access |
| GUANSHI Plus Monthly | CA$6.99 / month | 4 / account / day | Subscription |
| GUANSHI Plus Annual | CA$59.99 / year | 4 / account / day | Subscription |
| GUANSHI Deep Reading | CA$3.99 / reading | Separate consumable | One-time credit |

Monthly and annual Plus use the same capability profile. Annual pricing is lower than twelve monthly payments; it does not receive a stronger answer or a separate evidence standard.

Deep Reading remains a separate consumable and is not bundled into Plus.

## Pricing discipline

> Paid plans buy more cloud capacity, not stronger claims, more certainty, or a more flattering answer.

**付费买的是更多云端容量，不是更夸张的结论、更高的“确定性”，也不是更讨好的答案。**

The evidence ladder, counter-case requirement, uncertainty disclosure, validation rules and high-stakes boundaries remain identical across plans.

Local-first tools remain useful on Free. Paid access must not make GUANSHI less honest.

## Source of truth

Commercial plan prices live in `public.runlu_product_plans`.

Cloud-AI entitlements live in `public.runlu_plan_capabilities`.

The public pricing page is a human-facing representation of those approved launch values. Before changing public pricing, update the database source of truth and the page together.

## Current commerce gate

As of this pricing release:
- Stripe provider account is recorded as ready;
- public paid checkout remains disabled;
- webhook adapter readiness is not complete;
- signature-verification readiness is not complete;
- subscription synchronization is not complete;
- payout/legal/public launch gates are not all complete;
- paid plan availability therefore remains `planned`.

Do not expose a working Buy / Subscribe button until the server-side checkout control approves public checkout.

The page may show the established price while clearly labeling paid checkout as not yet live.

## Cost discipline

Free currently receives 2 cloud AI analyses per account per day.

Plus receives 4 cloud AI analyses per account per day.

Both remain subject to account/network abuse controls, hourly capacity limits and the protected global AI budget. Revisit the protected global budget before accepting public paid subscriptions so paid access is not sold against an unrealistically small shared capacity ceiling.

## Annual arithmetic

Twelve monthly payments at CA$6.99 total CA$83.88.

The annual price of CA$59.99 is CA$23.89 lower than twelve monthly payments.

## Truth rule

Never call a planned paid capability “available” merely because the price is configured.

**价格可以先确定；购买按钮必须等真实支付链完成以后再亮。**


## Stripe test center

Private owner/admin route: `guanshi-commerce-test.html`

This route is deliberately **not** a public sales page and is not included in the sitemap.

The owner-only test flow is:

1. authenticated RUNLU owner/admin opens the test center;
2. the test center asks `runlu-stripe-checkout` for readiness;
3. Stripe test catalog bootstrap is permitted **only** when the configured server secret is a Stripe test secret (`sk_test_...`);
4. RUNLU creates or verifies one Stripe test Product/Price mapping for each paid GUANSHI plan;
5. owner/admin starts a Stripe Test Checkout;
6. the Checkout Session is linked to an immutable RUNLU checkout contract before redirect;
7. Stripe signs webhook events and `runlu-stripe-webhook` verifies the HMAC;
8. a correlated `checkout.session.completed` materializes and pays the RUNLU order;
9. Deep Reading fulfills one consumable credit;
10. Plus waits for Stripe subscription lifecycle confirmation, then creates/updates the RUNLU subscription and entitlement period;
11. renewal events extend the subscription entitlement; terminal subscription events revoke/expire it.

Public checkout remains independently controlled by `runlu_checkout_control`. Test readiness must never flip `public_checkout_approved` or `checkout_enabled`.

Current adapter staging:
- checkout function: owner-only Stripe test catalog + test Checkout supported;
- webhook: signature verification supported;
- GUANSHI checkout/order normalization supported;
- GUANSHI subscription lifecycle normalization supported;
- public subscription sync is still considered **testing** until an end-to-end Stripe test purchase is observed;
- refund automation remains separately gated.

### Promotion rule

Do not promote paid GUANSHI plans from `planned` to `available`, and do not enable public checkout, merely because the test center can create a Stripe session.

Promotion requires observed end-to-end evidence for:
- Plus Monthly test purchase;
- Plus Annual test purchase;
- Deep Reading test purchase;
- signed webhook receipt;
- paid RUNLU order;
- correct subscription entitlement or consumable credit;
- account-side visibility;
- cancellation / expiry behavior for subscription access;
- no cross-delivery into the legacy RUNLU DIGITAL path.

Only then may the live-price mapping and public checkout gates be considered.
