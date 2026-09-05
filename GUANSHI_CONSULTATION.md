# RUNLU GUANSHI · Consultation & Validation Protocol

Status: **V1.6 · two consultation routes + live analysis + protected public usage + validation loop + fixed traditional mechanics**

Public routes:
- `guanshi-consult.html` — **Start GUANSHI / 开始观势**
- `guanshi-traditional-consult.html` — **Traditional View / 传统观势**
- `guanshi-validation.html` — **Validation Lab / 观势验证台**

Server analysis:
- Supabase Edge Function: `runlu-guanshi-ai`
- OpenAI route: RUNLU Cloudflare GPT Gateway
- deterministic calendar/casting/site layer before AI interpretation

## Product principle

GUANSHI has two doors, one evidence discipline, and one review loop.

**Consult → Calculate / Cast → Interpret → Freeze → Wait → Review → Reweight**

**咨询 → 计算 / 起卦 → 解读 → 冻结 → 等待 → 复盘 → 调权**

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

Supported categories:
- Bazi / Four Pillars;
- Ganzhi / timing;
- Six Lines;
- Meihua;
- Feng Shui;
- mixed / not-sure traditional request.

The page shows method-specific inputs instead of one universal form.

## V1.6 deterministic traditional mechanics

The AI does not invent a chart, cast or compass result. Mechanical inputs are computed first and supplied to the interpretation layer as structured data.

### Bazi

For Bazi requests with a birth date, the server uses `lunar-javascript` 1.7.7 to calculate a civil-time Four Pillars layer that may include:
- year / month / day / hour pillars;
- Day Master;
- Five-Phase labels;
- hidden stems;
- Ten-God relations.

The calculation uses the civil birth date/time exactly as supplied. It does **not** currently apply true-solar-time correction or historical timezone reconstruction. Boundary conventions may differ by school.

A correct chart calculation is not treated as proof that a traditional life prediction is correct.

### Six Lines · fixed digital three-coin v1

When the user submits a Six Lines question:
- the server generates one cryptographic seed;
- three digital coins are derived for each of six lines;
- H = 3, T = 2;
- totals 6 / 7 / 8 / 9 are recorded bottom-to-top;
- 6 and 9 are changing lines;
- the relating hexagram is derived by flipping changing lines;
- the result prints the seed, all 18 coin faces, six line values, changing-line positions, primary hexagram and relating hexagram.

This makes the casting procedure explicit and auditable. It does **not** establish predictive validity.

### Meihua · fixed submission-moment v1

The public prototype freezes one disclosed time-casting rule:
- the exact local civil submission moment is recorded;
- year/hour use Earthly-Branch ordinals;
- month/day use lunar-calendar numbers;
- year + month + day modulo 8 gives the upper trigram;
- adding hour and modulo 8 gives the lower trigram;
- the same four-part total modulo 6 gives the moving line;
- exact multiples use 8 or 6 rather than zero;
- trigram order is Qian 1, Dui 2, Li 3, Zhen 4, Xun 5, Kan 6, Gen 7, Kun 8.

The result prints the frozen moment, timezone metadata, lunar inputs, arithmetic, trigrams, moving line, primary hexagram and relating hexagram.

This is a frozen GUANSHI implementation for prospective testing, not a claim that every Meihua school uses the same convention.

### Feng Shui · structured site ledger v1

When Feng Shui is selected, the page may collect:
- site type and main use;
- facing degree and how it was obtained;
- daylight;
- ventilation;
- noise;
- moisture;
- movement / circulation;
- layout notes;
- outside environment;
- intended site outcome;
- other known real-world facts.

If a facing degree is supplied, the server derives:
- the 8-direction sector;
- the 24-mountain label.

These compass labels are deterministic traditional coordinates. They do not establish that directional symbolism causes real-world outcomes.

### No post-hoc switching

After a cast or site rule is generated:
- do not change the method because the first result is unattractive;
- do not silently switch Six Lines / Meihua schools after seeing the outcome;
- do not recast the same event until a more desirable answer appears;
- if multiple methods are intentionally compared, define that comparison before the outcome.

## Three-ledger rule for Traditional View

### 1. Calculation / casting ledger
Stores deterministic mechanics: chart conversion, coin results, arithmetic, compass orientation and method version.

### 2. Traditional interpretation ledger
May include symbolic relationships, traditional timing and clearly identified school-specific interpretive rules.

### 3. Reality ledger
Separately records known facts, constraints, base rates, measurable environment, behavioural/context variables, real options and downside.

### Integrated conclusion
Traditional material may generate questions, hypotheses or cultural interpretation. It does not silently outrank stronger evidence.

For high-stakes medical, legal, financial, safety or mental-health decisions, evidence-based and qualified professional methods control the practical recommendation.

## Validation Lab

A successful consultation exposes a **Freeze for later review / 冻结为验证案例** action.

The consultation page places the latest successful result into browser `sessionStorage` for handoff to the Validation Lab. The frozen record can therefore include the original deterministic chart/cast/site structure together with the interpretation.

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

## V1.6 privacy state

Consultation fields are processed server-side when the user presses Generate.

- consultation text is not written to the GUANSHI usage ledger;
- usage metadata is stored separately for budget/abuse protection;
- deterministic chart/cast/site structures are returned to the browser with the consultation;
- frozen validation cases are local-first in browser `localStorage`;
- users may export/import the validation ledger as JSON;
- there is no server-side persistent consultation or validation history yet.

## Public-usage guardrails

GUANSHI has a dedicated usage ledger separate from Forum AI usage.

Current conservative prototype limits are enforced server-side and atomically:
- **2 free AI analyses per identity per UTC day**;
- **8 analyses per network per UTC day**;
- **10 analyses globally per rolling hour**;
- **45 seconds minimum between analyses from one browser/device**;
- **same request blocked for 10 minutes**;
- **USD 1.50 protected GUANSHI reservation budget per UTC day**;
- **USD 0.05 conservative internal reservation estimate per analysis**;
- approved RUNLU origins only;
- honeypot and minimum page-load time against simple automated submissions.

The application-level protected budget and the provider's actual invoice are different concepts. The reservation estimate is deliberately conservative.

## Identity state

V1.6 uses a persistent anonymous browser/device identity for ordinary visitors. The server already supports account-based counting when a valid authenticated Supabase JWT is supplied.

There is **not yet a public RUNLU account sign-in UI**. Do not describe public account login as live until identity UX and retention policy are deliberately implemented.

## Remaining infrastructure hardening

The official GUANSHI route is protected at the Supabase/database layer. A second independent hard cap or signed server-to-server authorization at the **Cloudflare GPT Gateway** is still desirable.

Do not claim that gateway-level hard cap is complete until the Worker itself is updated and verified.

## Next product work after V1.6

1. accumulate low-stakes frozen cases before making any performance claim;
2. separate calibration by comparable case class and by method;
3. add intelligent follow-up questions when missing information would materially change the analysis;
4. add actual environmental measurements to Feng Shui cases when users have them;
5. add optional physical-coin / manual Six Lines entry as a separately labeled method if needed;
6. add user-controlled account/history only after retention rules are defined;
7. add Cloudflare gateway hard budget/authentication;
8. consider server anchoring of validation hashes without storing case text.

## Core sentence

> **Calculate before interpreting. Freeze before knowing. Let reality answer last.**
>
> **先算清楚，再作解释；先把话留下，再让现实回答。**
