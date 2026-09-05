# RUNLU GUANSHI · 观势 · Trend Dynamics

Status: **V1.5 · source spine complete + live consultation + protected AI + validation loop**

Public framework: `guanshi.html`  
Start GUANSHI: `guanshi-consult.html`  
Traditional View: `guanshi-traditional-consult.html`  
Validation Lab: `guanshi-validation.html`  
Knowledge map: `guanshi-map.html`  
Traditional source spine: `guanshi-tradition.html`  
Consultation protocol: `GUANSHI_CONSULTATION.md`  
Case protocol: `GUANSHI_CASE_TEMPLATE.md`

Traditional source nodes:
- T01 Yijing: `guanshi-yijing.html` / `GUANSHI_YIJING.md`
- T02 Yin–Yang: `guanshi-yinyang.html` / `GUANSHI_YINYANG.md`
- T03 Five Phases: `guanshi-wuxing.html` / `GUANSHI_WUXING.md`
- T04 Bagua: `guanshi-bagua.html` / `GUANSHI_BAGUA.md`
- T05 Stems & Branches: `guanshi-ganzhi.html` / `GUANSHI_GANZHI.md`
- T06 Bazi: `guanshi-bazi.html` / `GUANSHI_BAZI.md`
- T07 Six Lines / Meihua: `guanshi-liuyao-meihua.html` / `GUANSHI_LIUYAO_MEIHUA.md`
- T08 Feng Shui: `guanshi-fengshui.html` / `GUANSHI_FENGSHUI.md`

## Purpose

GUANSHI combines four layers without pretending they have the same evidence status:

1. evidence-based modern decision methods;
2. direct observation of real conditions and constraints;
3. traditional Chinese models as cultural, historical, symbolic or heuristic lenses;
4. prospective recording, outcome review and correction against reality.

It is **not** presented as a scientifically proven fortune-telling system.

## Core rules

> If a traditional claim conflicts with reliable evidence, evidence wins.

**任何传统理论一旦与可靠事实冲突，以事实为准。**

> Tradition may suggest a lens. Science determines what may be claimed. Practice decides what survives.

**传统可以提供观察视角；科学决定什么可以被声称；实践决定什么最终留下。**

> Translate before weighting. Test before trusting.

**先转译，再加权；先检验，再信任。**

> A correct chart is not the same thing as a correct life prediction.

**排盘正确，不等于人生预测正确。**

> A forecast must exist before the outcome does.

**预测必须先于结果存在。**

> The environment can matter. Why it matters must be demonstrated layer by layer.

**环境可以重要；它为什么重要，必须一层一层证明。**

V1.5 adds the operational rule:

> Do not rewrite the original judgment after reality answers. Append the review.

**结果出来以后，不改原判；只追加复盘。命中的留下，失误的也留下。**

## Nine lenses

- **易 — Change**: what is emerging, declining, turning or transforming?
- **象 — Pattern**: what recurring structure or relationship can be observed?
- **数 — Measure**: what can be quantified, compared or assigned uncertainty?
- **时 — Time**: what cycle, horizon and timing matter?
- **地 — Environment**: how do place, layout, access and external conditions shape the choice?
- **人 — Person**: what goals, abilities, habits, biases, resources and limits matter?
- **事 — Situation**: what concrete decision or event is actually in question?
- **变 — Scenarios**: how may the situation change under plausible futures?
- **势 — Dynamics**: after integration, which direction has the strongest evidence-adjusted momentum?

## Completed traditional source chain

**Yijing → Yin–Yang → Five Phases → Bagua → Stems & Branches → Bazi → Six Lines / Meihua → Feng Shui**

This is a **learning and model-dependency sequence, not a strict historical genealogy**.

The translation chain is:

**Change → Relation → System → State → Time → Person × Time → Event → Environment**

Operationally:

**What is changing? → What is interacting? → What system is forming? → What state are we in? → Where are we in time? → Does person/time coding add signal? → Can a frozen event forecast beat the reality baseline? → How does the actual environment shape the situation?**

Traditional input should move through:

**Original meaning → structural abstraction → observable variables → testable relationship → frozen judgment → recorded outcome**

If a claim cannot pass into observable or falsifiable form, it remains **Traditional** or **Symbolic** and receives no factual predictive weight.

## Evidence labels

- **Established** — supported by strong, relevant evidence.
- **Supported** — useful evidence exists but limits remain.
- **Exploratory** — plausible hypothesis or early signal.
- **Traditional** — historically/traditionally preserved; scientific support not established.
- **Symbolic** — cultural/philosophical interpretation, not an empirical fact.
- **Rejected** — contradicted by reliable evidence or repeatedly failed validation.

## Consultation architecture

### Door A · Start GUANSHI
Default for most users.

First question:

> **What are you trying to see clearly?**
>
> **你现在最想看清楚的一件事是什么？**

Reality, constraints, options, timing, uncertainty and downside come first. Traditional lenses are optional.

### Door B · Traditional View
For a user with an explicit Bazi, Ganzhi/timing, Six Lines, Meihua, Feng Shui or mixed traditional request.

Traditional interpretation and reality analysis remain separate ledgers before synthesis.

### AI protection state
The public analysis route is protected server-side by conservative identity/network/hourly limits and a dedicated GUANSHI reservation budget. See `GUANSHI_CONSULTATION.md` for the current operational limits.

A public RUNLU account UI is not yet live. A second independent Cloudflare Gateway hard cap remains desirable.

## Validation architecture · V1.5

Public tool: `guanshi-validation.html`

Core loop:

**Consult → Freeze → Wait → Review → Reweight**

**咨询 → 冻结 → 等待 → 复盘 → 调权**

A successful consultation exposes **Freeze for later review / 冻结为验证案例**.

The latest successful consultation is handed to the Validation Lab through browser `sessionStorage` so the source question and result can be pre-filled without creating a server-side case history.

### Judgment class A · Binary forecast
Use only for genuinely yes/no outcomes.

Freeze:
- exact event;
- predicted yes/no outcome;
- confidence;
- review date;
- reasons;
- counterargument;
- falsifier.

After resolution:
- actual yes/no outcome;
- directional hit/miss;
- Brier score.

For probability of Yes `p` and actual outcome `y ∈ {0,1}`:

`Brier = (p - y)^2`

Lower is better.

### Judgment class B · Decision judgment
Use for real-world action choices that are not honestly reducible to a binary event.

Freeze:
- exact judgment;
- recommended action;
- confidence;
- main reasons;
- strongest counterargument;
- falsifier;
- review date.

Review qualitatively rather than manufacturing a false numeric score.

### Anti-hindsight firewall
The original case block is frozen before the outcome. Later reviews are appended as dated entries.

The V1.5 browser tool computes a SHA-256 integrity fingerprint over the original block. Because the case and hash are stored together locally, this detects accidental change but is **not** an independent public timestamp or tamper-proof certification.

Possible later improvement: server-anchor only `case hash + timestamp` without storing the consultation text.

### Local-first privacy
Validation cases and reviews are stored in browser `localStorage` in V1.5.

Users can export/import the ledger as JSON. There is no server-side persistent validation database yet.

This is deliberate: the validation discipline is live without expanding sensitive personal-data retention before an account and retention policy is designed.

## Calibration discipline

The Validation Lab currently summarizes:
- frozen case count;
- final review count;
- resolved binary forecast count;
- directional accuracy for resolved binary forecasts;
- mean Brier score for resolved binary forecasts.

Small samples are descriptive, not proof.

Do not advertise accuracy from cherry-picked, mixed or tiny samples. Separate comparable case classes as the ledger grows.

A traditional model earns additional research weight only through prospectively recorded added value over a reasonable reality baseline. A model that merely redescribes known facts receives no predictive credit.

## Decision loop

**Observe → Frame → Estimate → Decide → Freeze → Review → Reweight**

1. **Observe** — separate known facts, assumptions and unknowns.
2. **Frame** — define the real question, alternatives, horizon and stakes.
3. **Estimate** — use base rates, probabilities, scenarios and explicit uncertainty where appropriate.
4. **Decide** — prefer robust action over dramatic narrative.
5. **Freeze** — record the exact judgment, confidence and review date before the outcome.
6. **Review** — append what actually happened, including misses and surprises.
7. **Reweight** — increase, keep, reduce or reject method/assumption weight based on repeated evidence.

## Weighting principles

GUANSHI does not use fixed universal percentages.

- reliable direct evidence outranks symbolic interpretation;
- strong domain base rates outrank unsupported intuition;
- measured environmental variables outrank symbolic spatial explanations when they already explain the outcome;
- reversible low-cost experiments may accept more exploratory inputs;
- irreversible/high-downside choices require stronger evidence;
- traditional models can gain research attention only through prospectively recorded added value;
- a model that merely redescribes known facts receives no predictive credit;
- repeated failure lowers weight or leads to rejection.

## Product phase

### Completed
- four-language public framework;
- knowledge map;
- evidence labels;
- traditional source spine T01–T08;
- two consultation routes;
- live server-side GUANSHI analysis;
- deterministic Bazi chart layer before AI interpretation;
- protected public AI quotas/budget;
- local-first Validation Lab;
- frozen case fingerprint;
- append-only review workflow;
- binary Brier scoring;
- calibration snapshot;
- JSON export/import of the validation ledger.

### Next
1. accumulate low-stakes, comparable, pre-registered cases;
2. separate calibration by case class instead of pooling everything;
3. add deterministic casting workflows for Six Lines / Meihua;
4. add structured measurement intake for Feng Shui;
5. add intelligent follow-up questions when missing information materially changes the answer;
6. add optional account/history only after retention policy is defined;
7. add independent Cloudflare Gateway authorization/budget protection;
8. consider privacy-preserving server anchoring of case hashes.

## Boundaries

GUANSHI must not use divination or traditional symbolism as the deciding basis for high-stakes medical, legal, financial, safety or mental-health decisions.

Feng Shui symbolism must not replace structural engineering, building/fire code compliance, environmental testing, hazard assessment, medical advice or legal/property due diligence.

For high-stakes domains, traditional lenses may be discussed as cultural or symbolic context only; evidence-based and professional methods control the recommendation.

All public GUANSHI pages must be complete in English, Simplified Chinese, French and Spanish under RUNLU's multilingual policy.
