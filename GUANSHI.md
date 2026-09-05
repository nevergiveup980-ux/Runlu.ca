# RUNLU GUANSHI · 观势 · Trend Dynamics

Status: **V1.6 · source spine complete + live consultation + protected AI + validation loop + fixed traditional mechanics + intelligent clarification**

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

V1.5 adds the operational review rule:

> Do not rewrite the original judgment after reality answers. Append the review.

**结果出来以后，不改原判；只追加复盘。命中的留下，失误的也留下。**

V1.6 adds the traditional-mechanics rule:

> Calculate before interpreting. Freeze the method before knowing the outcome.

**先算清楚，再作解释；先把方法固定，再等现实回答。**

V1.6 also adds the consultation-quality rule:

> Ask only what can materially change the judgment.

**只追问真正可能改变结论的资料。**

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

**Original meaning → structural abstraction → deterministic mechanics where applicable → observable variables → testable relationship → frozen judgment → recorded outcome**

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

V1.6 shows method-specific inputs instead of treating birth data as a universal entry requirement.

Traditional View now preserves three ledgers:
1. **calculation / casting ledger**;
2. **traditional interpretation ledger**;
3. **reality ledger**.

### Intelligent clarification gate

Before the analysis request, the public consultation pages run a local, zero-AI information check.

If important information is missing, GUANSHI asks at most **2–3 high-impact questions in one round**. Users may answer, write “not sure”, or skip and continue.

The follow-up logic is topic/method aware. Examples include:
- career: current role/compensation, concrete alternatives, decision horizon, non-negotiables;
- business: traction/resources, actual options, budget/time/cash-flow limits;
- relationship: current state, desired outcome, time window, boundaries;
- Bazi: birth time when known and relevant current reality;
- Six Lines / Meihua: testable event definition, reality baseline and action relevance;
- Feng Shui: intended site outcome, direction only when relevant, layout/surroundings and measured facts.

Clarification itself does **not** call the AI route and does **not** consume one of the daily free AI analyses. The actual AI call occurs only after the user completes or skips the clarification step.

### Deterministic traditional layer · V1.6

**Bazi**
- civil-time Four Pillars are computed before interpretation;
- chart conversion and life claims remain separate evidence layers.

**Six Lines**
- fixed server-side digital three-coin method;
- one cryptographic seed;
- H=3 / T=2;
- six lines bottom-to-top;
- 6 and 9 changing;
- seed, all 18 coin faces, six line values, moving lines, primary and relating hexagrams returned with the consultation.

**Meihua**
- fixed submission-moment method;
- year/hour use Earthly-Branch ordinals;
- lunar month/day are used;
- modulo 8 determines upper/lower trigrams;
- modulo 6 determines the moving line;
- moment, timezone metadata and arithmetic are returned with the consultation.

**Feng Shui**
- site type/use, facing degrees, measurement basis, daylight, ventilation, noise, moisture, circulation, layout and outside environment can be recorded separately;
- facing degrees are deterministically converted to an 8-direction sector and 24-mountain label;
- measurable environmental mechanisms receive explanatory credit before symbolic compass rules.

None of these deterministic mechanics establishes predictive accuracy by itself.

### AI protection state
The public analysis route is protected server-side by conservative identity/network/hourly limits and a dedicated GUANSHI reservation budget. See `GUANSHI_CONSULTATION.md` for current operational limits.

A public RUNLU account UI is not yet live. A second independent Cloudflare Gateway hard cap remains desirable.

## Validation architecture

Public tool: `guanshi-validation.html`

Core loop:

**Consult → Clarify if needed → Calculate / Cast → Interpret → Freeze → Wait → Review → Reweight**

**咨询 → 必要时补问 → 计算 / 起卦 → 解读 → 冻结 → 等待 → 复盘 → 调权**

A successful consultation exposes **Freeze for later review / 冻结为验证案例**.

The latest successful consultation is handed to the Validation Lab through browser `sessionStorage` so the source question, deterministic structure and interpretation can be frozen together without creating a server-side case history.

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

The browser tool computes a SHA-256 integrity fingerprint over the original block. Because the case and hash are stored together locally, this detects accidental change but is **not** an independent public timestamp or tamper-proof certification.

Possible later improvement: server-anchor only `case hash + timestamp` without storing consultation text.

### Local-first privacy
Validation cases and reviews are stored in browser `localStorage`.

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

Do not advertise accuracy from cherry-picked, mixed or tiny samples. Separate comparable case classes — and eventually traditional methods — as the ledger grows.

A traditional model earns additional research weight only through prospectively recorded added value over a reasonable reality baseline. A model that merely redescribes known facts receives no predictive credit.

## Decision loop

**Observe → Frame → Clarify if needed → Estimate → Decide → Calculate / Cast when relevant → Freeze → Review → Reweight**

1. **Observe** — separate known facts, assumptions and unknowns.
2. **Frame** — define the real question, alternatives, horizon and stakes.
3. **Clarify** — ask only the 2–3 missing questions that could materially change the judgment; skip this step when the input is already sufficient.
4. **Estimate** — use base rates, probabilities, scenarios and explicit uncertainty where appropriate.
5. **Decide** — prefer robust action over dramatic narrative.
6. **Calculate / Cast** — when a traditional method is selected, use a fixed disclosed mechanism before interpretation.
7. **Freeze** — record the exact judgment, confidence, method structure and review date before the outcome.
8. **Review** — append what actually happened, including misses and surprises.
9. **Reweight** — increase, keep, reduce or reject method/assumption weight based on repeated evidence.

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
- **zero-AI intelligent clarification gate with one-round / max-three-question follow-up**;
- deterministic Bazi chart layer before AI interpretation;
- **deterministic Six Lines digital three-coin casting workflow**;
- **fixed Meihua submission-moment arithmetic workflow**;
- **structured Feng Shui site/environment intake with deterministic compass labels**;
- protected public AI quotas/budget;
- local-first Validation Lab;
- frozen case fingerprint;
- append-only review workflow;
- binary Brier scoring;
- calibration snapshot;
- JSON export/import of the validation ledger.

### Next
1. accumulate low-stakes, comparable, pre-registered cases;
2. separate calibration by case class and by method instead of pooling everything;
3. add actual environmental measurements when users have them;
4. add optional physical-coin/manual Six Lines entry as a separately labeled method if demand appears;
5. add optional account/history only after retention policy is defined;
6. add independent Cloudflare Gateway authorization/budget protection;
7. consider privacy-preserving server anchoring of case hashes.

## Boundaries

GUANSHI must not use divination or traditional symbolism as the deciding basis for high-stakes medical, legal, financial, safety or mental-health decisions.

Feng Shui symbolism must not replace structural engineering, building/fire code compliance, environmental testing, hazard assessment, medical advice or legal/property due diligence.

For high-stakes domains, traditional lenses may be discussed as cultural or symbolic context only; evidence-based and professional methods control the recommendation.

All public GUANSHI pages must be complete in English, Simplified Chinese, French and Spanish under RUNLU's multilingual policy.
