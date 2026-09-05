# RUNLU GUANSHI · T07 六爻 / 梅花

Status: **V1.2 · fixed operational casting workflows live**

Public page: `guanshi-liuyao-meihua.html`  
Live consultation: `guanshi-traditional-consult.html`

## Working title

**六爻 / 梅花 · 事件与预测的语法**  
**Six Lines / Meihua · The Grammar of Events & Forecasts**

## Core separation

T07 does **not** treat Six Lines and Meihua as one unchanged ancient method.

They are stored as two historically distinct divination families that share one modern audit protocol.

### A · Six Lines / line-divination family

Relevant historical layers include:

1. Zhouyi / Xici divination with yarrow-stalk procedures and changing lines;
2. Han-period Jing Fang traditions, including Eight Palaces and later-associated structures such as shi/ying and na-jia;
3. later Six-Relative / line-role systems and Huozhulin-style practice;
4. later coin-casting methods used for convenience.

The exact genealogy of every later rule must be sourced separately. A later practice must not be projected unchanged back into the Zhouyi or Han period.

### B · Meihua / image-number family

The received Meihua tradition uses time, number, observed cues, sounds, characters or events to generate trigrams/hexagrams and changing lines.

Shao Yong is a real Northern Song thinker strongly associated with Yijing image-number learning, cyclic time and observation. However, authorship of the received `梅花易数 / Meihua Yishu` text is not secure. GUANSHI therefore records:

- **intellectual association with Shao Yong** — historically plausible / supported;
- **direct authorship of the received manual by Shao Yong** — uncertain / disputed;
- **later stories of spectacular predictions** — traditional narratives, not evidence of predictive accuracy.

## Core rule

> A forecast must exist before the outcome does.

> **预测必须先于结果存在。**

> A method that can explain every outcome after the fact has not yet shown predictive skill.

> **如果一种方法在事后什么结果都能解释，它还没有证明自己会预测。**

## V1.2 operational casting firewall

GUANSHI now fixes the casting mechanism **before interpretation**. The server returns the complete mechanical record with the consultation so the result can later be frozen in Validation Lab.

### Six Lines · GUANSHI digital three-coin v1

The public prototype uses one disclosed digital three-coin method:

1. one cryptographic seed is generated on the server when the user submits the question;
2. each line derives three digital coin faces from that seed;
3. H = 3 and T = 2;
4. three values are summed into 6 / 7 / 8 / 9;
5. six lines are recorded **bottom to top**;
6. 6 and 9 are changing lines;
7. the changing lines are flipped to derive the relating hexagram;
8. the result prints the seed, all 18 coin faces, all six line values, moving-line positions, primary hexagram and relating hexagram.

The seed is returned for auditability. This does **not** make the reading scientifically predictive; it only makes the casting mechanism explicit and reproducible as a digital procedure.

A later physical-coin or yarrow workflow may be added as a separate method, but it must never be silently mixed with this digital method in one validation series.

### Meihua · GUANSHI submission-moment v1

GUANSHI freezes one time-casting rule for the public prototype:

- the local civil moment when the user presses **Generate** is recorded;
- year uses the ordinal of the year Earthly Branch: Zi=1 through Hai=12;
- hour uses the ordinal of the two-hour Earthly Branch;
- month and day use lunar-calendar numbers;
- upper trigram = `(year branch ordinal + lunar month + lunar day) mod 8`, with exact multiples treated as 8;
- lower trigram = `(year branch ordinal + lunar month + lunar day + hour branch ordinal) mod 8`, with exact multiples treated as 8;
- moving line = the same four-part total `mod 6`, with exact multiples treated as 6;
- trigram number order is Qian 1, Dui 2, Li 3, Zhen 4, Xun 5, Kan 6, Gen 7, Kun 8.

The consultation prints the frozen moment, timezone metadata, lunar inputs, all arithmetic, upper/lower trigrams, moving line, primary hexagram and relating hexagram.

This is a **frozen GUANSHI experimental implementation of a transmitted Meihua time method**, not a claim that every Meihua school uses exactly the same convention.

### No post-hoc method switching

Once a cast exists:

- do not recast because the first result feels unsatisfactory;
- do not swap Six Lines for Meihua after seeing the first result and then keep only the more attractive answer;
- do not change the arithmetic convention after the outcome;
- if a second method is intentionally compared, preregister it as a separate M1/M2 comparison before the outcome.

## Five ledgers

### 1 · Question / event definition

Freeze before casting:

- exact question;
- target event;
- decision relevance;
- time horizon;
- what counts as success / failure / partial success;
- known facts available at the time.

Vague prompts such as “看看最近运势” are not suitable for validation.

### 2 · Casting / encoding mechanism

Record exactly how the symbolic state was generated.

For Six Lines:

- method version;
- seed or physical procedure;
- every line result;
- base hexagram;
- moving lines;
- changed hexagram;
- school-specific line assignments if added later.

For Meihua:

- frozen moment or other predefined input;
- calendar convention;
- arithmetic mapping rule;
- upper/lower trigram;
- moving line;
- changed hexagram.

The rule cannot be changed after the outcome is known.

### 3 · Interpretation rule

Before seeing the outcome, record which interpretive school is being used.

Examples:

- line text only;
- Jing Fang / na-jia style;
- six relatives / shi-ying rules;
- Meihua body-function (体用) style;
- image-number reading;
- hybrid method.

Hybrid methods must disclose all added rules. More rules create more flexibility and therefore a larger hindsight risk.

### 4 · Forecast claim

A testable forecast should contain:

- predicted outcome;
- probability or confidence range;
- time window;
- strongest alternative;
- what observation would count against the forecast.

Avoid protected language such as “大概有变”“有喜亦有忧” unless it is operationalized.

### 5 · Outcome scoring

After the deadline:

- preserve the original forecast unchanged;
- record actual outcome;
- score hit / miss / partial according to predeclared criteria;
- use probability scoring where possible;
- append a dated review;
- never reinterpret the original forecast to fit the result.

## GUANSHI event-test protocol

### Baseline M0

Use only known real-world information:

- base rates;
- current conditions;
- resources and constraints;
- historical frequency;
- expert / domain evidence where relevant;
- obvious leading indicators.

### M1 · Six Lines added

Add the fixed Six Lines reading without changing M0 inputs.

### M2 · Meihua added

Add the fixed Meihua reading only under a predefined comparison design or on separate cases.

### Compare

Ask whether M1 or M2 improves:

- calibration;
- discrimination;
- accuracy;
- useful decision timing;
- robustness;
- information gain beyond M0.

A memorable correct story is not enough. The unit of evidence is a series of frozen, scored cases.

## Anti-leakage rules

1. The reader should not receive outcome information accidentally.
2. If possible, hide irrelevant identifying details.
3. Freeze school/rules before reading the case.
4. Do not select only “interesting” cases after outcomes are known.
5. Record misses as carefully as hits.
6. Do not change the time horizon after the deadline passes.
7. Do not award credit for statements too broad to fail.

## What may survive even without predictive advantage

Even if event-forecasting value is not demonstrated, parts of the practice may still be useful as **decision scaffolds**, for example:

- forcing a precise question;
- slowing impulsive judgment;
- generating alternative scenarios;
- exposing assumptions;
- creating a decision journal;
- prompting explicit timing and falsification conditions.

These benefits must be credited to the decision process itself, not misreported as proof that divination predicts the future.

## Evidence labels

- Zhouyi/Xici yarrow divination as received textual practice — **Traditional / historical**.
- Jing Fang and received Jing-family line systems — **Traditional / historical, layered**.
- digital three-coin cast mechanics — **Reproducible computation**, not predictive proof.
- modern Six Lines predictive accuracy — **Test required**.
- Shao Yong's image-number intellectual context — **Supported historical context**.
- direct authorship of received `Meihua Yishu` by Shao Yong — **Uncertain / disputed**.
- GUANSHI Meihua arithmetic — **Reproducible frozen rule**, not predictive proof.
- Meihua predictive accuracy — **Test required**.

## Source seeds

1. Stanford Encyclopedia of Philosophy, `Chinese Philosophy of Change (Yijing)` — received Xici divination and yarrow-stalk procedure.
   https://plato.stanford.edu/entries/chinese-change/
2. Chinese Text Project, `京氏易传` — received Jing Fang tradition; Eight Palaces, shi/ying, flying/hidden structures, na-jia and later divination context.
   https://ctext.org/jingshi-yizhuan/zh
3. Richard J. Smith, *Fortune-tellers and Philosophers: Divination in Traditional Chinese Society* — broader historical/cultural context of Chinese divination.
4. Peter K. Bol, “On Shao Yong's Method for Observing Things,” *Monumenta Serica* 61 (2013): 287–299 — Shao Yong's observation method and intellectual context.
5. Received `梅花易数` year-month-day-hour rule — year/hour Earthly-Branch ordinals, lunar month/day, remainder 8 for trigrams and remainder 6 for the moving line; GUANSHI freezes one disclosed implementation for prospective testing.
6. Three-coin convention — H=3, T=2; totals 6/7/8/9; six lines bottom-to-top; 6/9 changing — used here as an explicit digital prototype method.

## Boundary

T07 must not be used as the deciding basis for high-stakes medical, legal, financial, safety or mental-health decisions.

In high-stakes settings, traditional readings may be discussed as cultural/symbolic prompts only. Evidence-based domain methods control the recommendation.

## Transition to T08

T07 asks: **What will happen in this event, and did the forecast exist before the result?**

T08 Feng Shui shifts from event prediction to environment:

**Which parts of environmental judgment are measurable, which are symbolic, and which claims survive controlled comparison?**
