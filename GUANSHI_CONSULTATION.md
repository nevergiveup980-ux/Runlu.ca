# RUNLU GUANSHI · Consultation Protocol

Status: **V1.3 · two consultation routes + live analysis engine**

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

Current V1.3 chart layer may include:
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

## V1.3 privacy / implementation state

The consultation is no longer local-only.

- form fields are sent to the RUNLU server-side AI route only when the user presses the generate-result button;
- the Edge Function processes the content and forwards the analysis prompt through the RUNLU Cloudflare GPT Gateway to OpenAI;
- the consultation function does not intentionally write consultation content to a RUNLU consultation database;
- the page does not yet create a persistent user consultation history;
- users may copy the full input + result locally after generation.

Do not claim that data never leaves the browser in V1.3.

## Operational protections

- JWT-protected Supabase Edge Function;
- origin-restricted CORS;
- per-client daily request limit;
- shared RUNLU daily AI budget guard;
- no request-content logging in application code;
- server prompt forbids invented chart/cast/site facts;
- high-stakes boundary rules remain active.

## Next backend work

1. add explicit user-controlled save/history only after retention policy is defined;
2. add deterministic casting workflows for Six Lines / Meihua before claiming exact method results;
3. add stronger site-measurement inputs for Feng Shui;
4. preserve original forecasts for later outcome review rather than rewriting them;
5. keep the consultation route visible in any future case record (`general` vs `traditional`).

## Core sentence

> **Two doors. One GUANSHI discipline.**
>
> **两扇门，一套观势纪律。**
