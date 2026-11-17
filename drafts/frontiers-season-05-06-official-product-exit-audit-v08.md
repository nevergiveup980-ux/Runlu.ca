# RUNLU FRONTIERS V — Essay 06 Official Product Exit Audit v0.8
Date: 2026-11-16
Status: INTERNAL RESEARCH ONLY — no essay drafting/publication clearance.

## Research question
When someone wants to leave an AI companion, what is actually separable: ending a conversation, canceling payment, deleting an account, and removing conversational data? This is a documentation audit, NOT a live UX test or proof of manipulative intent.

## Primary vendor sources (accessed 2026-11-16)
### Replika
1. Subscription cancellation: https://help.replika.com/hc/en-us/articles/360032500012-How-to-cancel-your-subscription
   Explicitly says deleting the app does not cancel subscription; subscription must be canceled through the purchase platform. For App Store / Google Play, cancellation is managed there.
2. Account deletion: https://help.replika.com/hc/en-us/articles/115001095932-How-do-I-delete-my-account
   In-app Settings > Account Settings > Delete Replika; choose reason, reenter password, confirm. Deletion irreversible.
3. Chat history: https://help.replika.com/hc/en-us/articles/4410750548493-Can-I-delete-my-conversations
   Official FAQ says no way to delete entire message history without deleting account.
4. Current English terms: https://replika.com/legal/terms/en
   Distinguishes app-store subscriptions from web subscriptions; says account deletion does not itself cancel an app-store subscription; web deletion cancels web subscription at current paid period's end. Use terms over older generic FAQ when interpreting differences.
5. Current privacy policy: https://replika.com/legal/privacy/en
   Specifies retention of profile and related data for up to 60 days after deletion, subject to policy exceptions; while account open, conversation history retained for 24 months for text and 12 months for media, with exceptions. Do NOT equate UI 'permanent deletion' with instantaneous removal from every backup or legally retained record.

### Character.AI
1. Account deletion: https://support.character.ai/hc/en-us/articles/15063461160475-How-do-I-delete-my-account
   Web: Profile > Profile Settings > Account > Manage Account & Data > Delete Account; mobile: Profile > settings > Remove Account. Irreversible.
2. c.ai+ subscription management: https://support.character.ai/hc/en-us/articles/17399592326555-How-do-I-manage-or-cancel-my-c-ai-subscription
   Web subscriptions managed via customer portal from Settings > Account > Manage, with email link; mobile subscriptions managed via Apple/Google.
3. c.ai lite FAQ: https://support.character.ai/hc/en-us/articles/55388952900379--c-ai-lite-FAQ
   Different tier/checkout routes may have different support processes; do not assume c.ai+ and lite web cancellation routes identical.

## Source conflict and care
Replika generic FAQ says deleting the app/account does not automatically cancel subscriptions; newer current Terms distinguish web subscriptions (account deletion cancels) from app-store subscriptions (must cancel in store). Explain payment-channel distinctions instead of treating this as a universal contradiction. Current policy may change.

## Evidence table
| Question | Replika official docs | Character.AI official docs | Conclusion |
|---|---|---|---|
| Can account be deleted? | Yes, irreversible, with confirmation | Yes, irreversible | Documented paths, not hands-on tested |
| Does app deletion cancel subscription? | No | Not established from inspected docs | Do not generalize |
| How cancel paid plan? | In-app/web or store according to billing | Web customer portal or app store | Billing exit distinct from account exit |
| Can all chats be erased while keeping account? | FAQ says no | Not established here | Need direct product-specific confirmation |
| Are all data erased instantly? | No; policy specifies retention schedules | Not checked | Avoid instant-deletion claim |
| Are farewell scripts manipulative? | Not tested | Not tested | Cannot infer from account/billing documents |

## Editorial finding
The defensible unique insight is the 'four exits' model:
1. Conversational exit — saying goodbye.
2. Financial exit — stopping future billing.
3. Account exit — disabling/deleting identity and companion.
4. Data exit — deletion, retention and portability of interaction records.
These are not necessarily coupled. The published Season III essay 08 already covers ethical respect for refusal; Season V must use this concrete operational distinction, not repeat generic human-connection reflections.

## Next evidence gates
- Obtain reproducible product screenshots or independent hands-on testing before describing UX friction or manipulative pop-ups.
- Verify export/data portability provisions in primary policies; no assumption that chat export is available or complete.
- Reconcile HBS versioned experimental figures against exact tables.
- Conduct full cross-season paragraph overlap and title clearance.
- No public site change or external product interaction performed.
