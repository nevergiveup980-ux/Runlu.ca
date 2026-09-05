# RUNLU GUANSHI · Consultation & Validation Protocol

Status: **V1.5 · two consultation routes + live analysis + protected public usage + validation loop**

Public routes:
- `guanshi-consult.html` — **Start GUANSHI / 开始观势**
- `guanshi-traditional-consult.html` — **Traditional View / 传统观势**
- `guanshi-validation.html` — **Validation Lab / 观势验证台**

Server analysis:
- Supabase Edge Function: `runlu-guanshi-ai`
- OpenAI route: RUNLU Cloudflare GPT Gateway
- Bazi calendar calculation: `lunar-javascript` 1.7.7 before AI interpretation

## Product principle

GUANSHI has two doors, one evidence discipline, and now one review loop.

**Consult → Freeze → Wait → Review → Reweight**

**咨询 → 冻结 → 等待 → 复盘 → 调权**

## Route A · Start GUANSHI / 开始观势

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

Live result sections:
1. Reality Baseline / 现实基线;
2. Key Dynamics / 关键态势;
3. Integrated GUANSHI / 综合观势;
4. Next Steps / 下一步.

## Route B · Traditional View / 传统观势

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

Live result sections:
1. Traditional Interpretation / 传统解读;
2. Reality Check / 现实核对;
3. Integrated GUANSHI / 综合观势;
4. Next Steps / 下一步.

## Bazi calculation boundary

For Bazi requests with a birth date, the server performs a deterministic calendar calculation before sending the structured chart to the AI interpretation layer.

Current chart layer may include:
- year / month / day / hour pillars;
- Day Master;
- Five-Phase labels;
- hidden stems;
- Ten-God relations.

The calculation uses the civil birth date/time exactly as supplied. It does **not** currently apply true-solar-time correction or historical timezone reconstruction. Boundary-hour/date conventions can differ by school and must be disclosed.

A correct chart calculation is not treated as proof that a traditional life prediction is correct.

## Two-ledger rule

Traditional consultations preserve two separate analytical ledgers.

### Traditional ledger
May include chart mechanics, symbolic relationships, traditional timing and clearly identified school-specific interpretive rules.

### Reality ledger
Separately records known facts, constraints, base rates, environment, behavioural/context variables, real options and downside.

### Integrated conclusion
Traditional material may generate questions, hypotheses or cultural interpretation. It does not silently outrank stronger evidence.

For high-stakes medical, legal, financial, safety or mental-health decisions, evidence-based and qualified professional methods control the practical recommendation.

## V1.5 Validation Lab

A successful consultation now exposes a **Freeze for later review / 冻结为验证案例** action.

The consultation page places the latest successful result into browser `sessionStorage` only for handoff to the Validation Lab. The validation page pre-fills the source question and source consultation when available.

### Two supported judgment classes

**A. Binary forecast**
- exact yes/no event;
- predicted outcome;
- confidence 50–99%;
- review date;
- later actual outcome yes/no;
- Brier score calculated after resolution.

**B. Decision judgment**
- exact decision claim;
- recommended action, if any;
- confidence;
- reasons;
- strongest counterargument;
- falsifier;
- later qualitative review.

Do not force a decision judgment into a binary score when the target is not genuinely binary.

### Anti-hindsight firewall

At freeze time, the original block stores:
- case ID;
- creation timestamp;
- source route;
- judgment type;
- question;
- exact claim;
- predicted outcome when binary;
- confidence;
- review date;
- stakes;
- recommendation;
- reasons;
- strongest counterargument;
- falsifier;
- optional source consultation.

After freezing, reviews are appended as new dated entries. The product does not provide an edit workflow for the original frozen block.

### Integrity fingerprint

The browser computes SHA-256 over the frozen original block and displays the fingerprint later.

This detects accidental local changes, but because the case and fingerprint are stored together in the same browser, it is **not** an independent public timestamp or proof against deliberate tampering.

Future option: server-anchor only `case hash + timestamp` without storing consultation text.

### Calibration snapshot

The Validation Lab displays:
- frozen case count;
- final review count;
- resolved binary forecast count;
- directional accuracy for resolved binary forecasts;
- mean Brier score for resolved binary forecasts.

Small samples are descriptive, not evidence of validated forecasting skill. Comparable case classes should eventually be separated rather than pooled indiscriminately.

## V1.5 local-first validation privacy

Validation case content is stored in browser `localStorage` under the validation ledger key.

- frozen case text is not sent to the GUANSHI usage ledger;
- validation reviews are local-first;
- users may export the complete validation ledger as JSON;
- users may import a previously exported GUANSHI validation JSON file;
- there is no server-side persistent validation history in V1.5.

This choice preserves the validation discipline without expanding sensitive-data retention before an account/retention policy is deliberately designed.

## Public-usage guardrails

GUANSHI has a dedicated usage ledger separate from Forum AI usage.

Current conservative prototype limits are enforced server-side and atomically:
- **2 free AI analyses per identity per UTC day** — authenticated account when a valid account JWT exists; otherwise persistent browser/device identity;
- **8 analyses per network per UTC day**;
- **10 analyses globally per rolling hour**;
- **45 seconds minimum between analyses from one browser/device**;
- **same request blocked for 10 minutes**;
- **USD 1.50 protected GUANSHI reservation budget per UTC day**;
- **USD 0.05 conservative internal reservation estimate per analysis**;
- only approved RUNLU web origins may call the GUANSHI Edge Function;
- honeypot and minimum page-load time reject simple automated submissions;
- quota/budget checks occur server-side.

The application-level protected budget and the provider's actual invoice are different concepts. The reservation estimate is deliberately conservative.

## Identity state

V1.5 uses a persistent anonymous browser/device identity for ordinary visitors. The server already supports account-based counting when a valid authenticated Supabase JWT is supplied.

There is **not yet a public RUNLU account sign-in UI** in the repository. Do not describe public account login as live until identity UX and retention policy are deliberately implemented.

## Remaining infrastructure hardening

The official GUANSHI route is protected at the Supabase/database layer. A second independent hard cap or signed server-to-server authorization at the **Cloudflare GPT Gateway** is still desirable.

Do not claim that gateway-level hard cap is complete until the Worker itself is updated and verified.

## Next product work after V1.5

1. accumulate low-stakes frozen cases before making any performance claim;
2. separate calibration by comparable case class;
3. add deterministic casting workflows for Six Lines / Meihua before claiming exact method results;
4. add stronger site-measurement inputs for Feng Shui;
5. add intelligent follow-up questions when missing information would materially change the analysis;
6. add user-controlled account/history only after retention rules are defined;
7. add Cloudflare gateway hard budget/authentication;
8. consider server anchoring of validation hashes without storing case text.

## Core sentence

> **Two doors. One GUANSHI discipline. One record that reality is allowed to contradict.**
>
> **两扇门，一套观势纪律；让现实有权回来反驳我们。**
