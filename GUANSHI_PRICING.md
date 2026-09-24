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


## Stripe commerce integration center

Private owner/admin route: `guanshi-commerce-test.html`

The historical filename remains for compatibility, but the route now represents **GUANSHI commerce integration**, not a separate Stripe test trunk.

This route is deliberately **not** a public sales page and is not included in the sitemap.

### Reuse rule

RUNLU already has observed Live Stripe payment evidence. Therefore GUANSHI reuses the proven shared infrastructure:
- the same Stripe account;
- the same Live Checkout / Payment Link family;
- the same webhook endpoint;
- the same Stripe signature-verification path;
- the same banking / payout destination.

Do **not** require a separate Stripe test secret merely to re-prove infrastructure that has already processed a real RUNLU Live payment.

GUANSHI still needs its own commercial objects because its prices and fulfillment are different:
- Plus Monthly · CA$6.99 / month;
- Plus Annual · CA$59.99 / year;
- Deep Reading · CA$3.99 / reading.

The remaining validation target is the GUANSHI-specific branch:

1. create three GUANSHI Live Product / Price / Payment Link mappings in the existing Stripe account;
2. keep public RUNLU Buy buttons locked while the mappings are being connected;
3. Stripe continues to sign webhook events and `runlu-stripe-webhook` verifies the HMAC;
4. Deep Reading must resolve to one RUNLU consumable credit;
5. Plus Monthly / Annual must resolve to a RUNLU subscription and entitlement period;
6. renewal events must extend entitlement correctly;
7. cancellation / expiry must stop future subscription access correctly;
8. no GUANSHI purchase may cross-deliver into the legacy RUNLU DIGITAL download path.

Public checkout remains independently controlled by `runlu_checkout_control`. Test readiness must never flip `public_checkout_approved` or `checkout_enabled`.

Current adapter staging:
- the shared Live Stripe payment trunk has real RUNLU transaction evidence;
- webhook signature verification is supported and observed;
- GUANSHI checkout/order normalization is implemented;
- GUANSHI subscription lifecycle normalization is implemented;
- GUANSHI Live Product / Price mappings are currently pending;
- public subscription sync is still considered **testing** until one controlled GUANSHI subscription is observed end to end;
- refund automation remains separately gated.

### Promotion rule

Do not promote paid GUANSHI plans from `planned` to `available`, and do not enable public checkout, merely because the shared Stripe trunk already works for another RUNLU product.

Promotion requires observed GUANSHI-specific end-to-end evidence for:
- at least one controlled Plus subscription path covering the shared subscription logic (monthly and annual price mappings must both be verified);
- one controlled Deep Reading purchase;
- signed webhook receipt;
- paid RUNLU order;
- correct subscription entitlement or consumable credit;
- account-side visibility;
- cancellation / expiry behavior for subscription access;
- no cross-delivery into the legacy RUNLU DIGITAL path.

Only then may the live-price mapping and public checkout gates be considered.


## Live commerce evidence

A real RUNLU live checkout has already provided infrastructure evidence outside the GUANSHI paid plans:

- amount: **CA$10.49**;
- Stripe Checkout reference used the live environment;
- RUNLU received a signed `checkout.session.completed` webhook;
- Stripe signature verification succeeded;
- the webhook receipt reached processed state;
- the existing RUNLU DIGITAL fulfillment path remained isolated from GUANSHI plan fulfillment.

This evidence is sufficient to mark the shared Stripe **webhook adapter** and **signature verification** gates as ready.

It is **not** sufficient to mark:
- bank payout destination ready — wait for an actual Stripe payout to arrive in the bank;
- legal terms accepted — requires explicit owner acceptance;
- GUANSHI public sales approved — requires GUANSHI-specific end-to-end paid-plan testing;
- public checkout enabled — remains a separate final launch decision.

The readiness ledger must follow observed evidence, not optimism.
