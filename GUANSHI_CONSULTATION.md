# RUNLU GUANSHI · Consultation Protocol

Status: **V1.4 · two consultation routes + live analysis + protected public usage**

Public routes:
- `guanshi-consult.html` — **Start GUANSHI / 开始观势**
- `guanshi-traditional-consult.html` — **Traditional View / 传统观势**

Server analysis:
- Supabase Edge Function: `runlu-guanshi-ai`
- OpenAI route: RUNLU Cloudflare GPT Gateway
- Bazi calendar calculation: `lunar-javascript` 1.7.7 before AI interpretation

## Product principle

GUANSHI has two doors but one evidence discipline.

### Route A · Start GUANSHI / 开始观势

Default route for most users.

First question:

> **What are you trying to see clearly?**
>
> **你现在最想看清楚的一件事是什么？**

The intake asks only for information relevant to the real decision:
- topic;
- time horizon;
- question;
- options / alternatives;
- known facts;
- constraints / non-negotiables;
- stakes / reversibility;
- whether the user wants a separate traditional observation layer.

Birth information is **not required by default**.

Operational order:

**Question → reality baseline → key dynamics → integrated GUANSHI → next steps → later review**

The live result is organized into four sections:
1. Reality Baseline / 现实基线;
2. Key Dynamics / 关键态势;
3. Integrated GUANSHI / 综合观势;
4. Next Steps / 下一步.

### Route B · Traditional View / 传统观势

For a user who explicitly wants a traditional consultation from the beginning.

Supported intake categories:
- Bazi / Four Pillars;
- Ganzhi / timing;
- Six Lines;
- Meihua;
- Feng Shui;
- mixed / not-sure traditional request.

The intake may collect:
- exact traditional question;
- birth date, time and place when relevant;
- event/deadline or target period;
- site/layout/orientation for environmental questions;
- known real-world facts;
- the real decision attached to the reading.

The live result is organized into four sections:
1. Traditional Interpretation / 传统解读;
2. Reality Check / 现实核对;
3. Integrated GUANSHI / 综合观势;
4. Next Steps / 下一步.

## Bazi calculation boundary

For Bazi requests with a birth date, the server performs a deterministic calendar calculation before sending the structured chart to the AI interpretation layer.

Current V1.4 chart layer may include:
- year / month / day / hour pillars;
- Day Master;
- Five-Phase labels;
- hidden stems;
- Ten-God relations.

The calculation uses the civil birth date/time exactly as supplied. It does **not** currently apply true-solar-time correction or historical timezone reconstruction. Boundary-hour/date conventions can differ by school and must be disclosed.

A correct chart calculation is not treated as proof that a traditional life prediction is correct.

## Two-ledger rule

Traditional consultations preserve two separate ledgers.

### Traditional ledger

May include chart mechanics, symbolic relationships, traditional timing and clearly identified school-specific interpretive rules.

### Reality ledger

Separately records known facts, constraints, base rates, environment, behavioural/context variables, real options and downside.

### Integrated conclusion

Traditional material may generate questions, hypotheses or cultural interpretation. It does not silently outrank stronger evidence.

For high-stakes medical, legal, financial, safety or mental-health decisions, evidence-based and qualified professional methods control the practical recommendation.

## V1.4 privacy / implementation state

The consultation is server-processed when the user presses the generate-result button.

- form fields are sent to the RUNLU server-side AI route for the requested analysis;
- the Edge Function forwards the analysis prompt through the RUNLU Cloudflare GPT Gateway to OpenAI;
- consultation text is **not** written to the GUANSHI usage ledger;
- the usage ledger stores only hashed browser/network identifiers, optional account ID when a real authenticated JWT exists, route, request hash, timestamps and estimated-cost metadata;
- the page does not yet create a persistent user consultation history;
- users may copy the full input + result locally after generation.

Do not claim that consultation data never leaves the browser.

## V1.4 public-usage guardrails

GUANSHI now has a dedicated usage ledger. It no longer shares the Forum AI budget ledger.

Current conservative prototype limits are enforced server-side and atomically:

- **2 free AI analyses per identity per UTC day** — authenticated account when a valid account JWT exists; otherwise persistent browser/device identity;
- **8 analyses per network per UTC day** — secondary anti-abuse limit;
- **10 analyses globally per rolling hour** — protects against bursts;
- **45 seconds minimum between analyses from one browser/device**;
- **same request blocked for 10 minutes** — prevents duplicate-click / replay waste;
- **USD 1.50 protected GUANSHI reservation budget per UTC day**;
- **USD 0.05 conservative internal reservation estimate per AI analysis** for budget control; this is not a statement of exact provider billing;
- only approved RUNLU web origins may call the GUANSHI Edge Function;
- a hidden honeypot and minimum page-load time reject simple automated submissions;
- all quota/budget checks occur on the server. Changing browser buttons or JavaScript alone cannot bypass the database guardrail.

The application-level protected budget and the provider's actual invoice are different concepts. The reservation estimate is deliberately conservative and must be reviewed against real token usage before limits are increased.

## Identity state

V1.4 establishes a persistent anonymous browser/device identity and the server already supports account-based counting when a valid authenticated Supabase JWT is supplied.

There is **not yet a public RUNLU account sign-in UI** in the repository. Therefore ordinary visitors are currently controlled as anonymous device identities plus network limits. Do not describe public account login as live until the account UX and retention policy are deliberately implemented.

## Remaining infrastructure hardening

The official GUANSHI path is protected at the Supabase/database layer. A second independent hard cap or signed server-to-server authorization at the **Cloudflare GPT Gateway itself** is still desirable so that even a hypothetical bypass of the application route cannot create uncontrolled provider spend.

That gateway layer should be added when the Cloudflare Worker source/management connection is available. Do not claim the Cloudflare gateway hard cap is complete before then.

## Next backend work

1. add user-controlled account sign-in/history only after identity and retention policy are defined;
2. add a second independent Cloudflare gateway budget/authentication barrier;
3. monitor actual token/provider cost and tune the conservative reservation estimate;
4. add deterministic casting workflows for Six Lines / Meihua before claiming exact method results;
5. add stronger site-measurement inputs for Feng Shui;
6. preserve original forecasts for later outcome review rather than rewriting them;
7. keep the consultation route visible in any future case record (`general` vs `traditional`).

## Core sentence

> **Two doors. One GUANSHI discipline. Protected by evidence — and by a budget.**
>
> **两扇门，一套观势纪律；既守证据，也守预算。**
