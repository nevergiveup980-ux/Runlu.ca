# RUNLU GUANSHI · T05 干支 / Stems & Branches

Status: **V0.8 · deep dive**

Public page: `guanshi-ganzhi.html`

## Working title

**干支 · 时间的语法 / Stems & Branches · The Grammar of Time**

## Core distinction

T05 separates four layers that are often mixed together:

1. **historical time-indexing** — the ten stems and twelve branches as chronological labels;
2. **calendrical correspondences** — later assignment to years, months, days, double-hours and related positions;
3. **traditional symbolic correspondences** — yin-yang, Five Phases, directions, animals and other correlative systems;
4. **predictive claims** — claims about luck, personality, fate, health, finance or event outcomes.

The first two can contain historically verifiable calendar structures. The third is recorded as traditional interpretation. The fourth requires prospective empirical testing.

## Historical structure

The ten stems:

甲 Jia · 乙 Yi · 丙 Bing · 丁 Ding · 戊 Wu · 己 Ji · 庚 Geng · 辛 Xin · 壬 Ren · 癸 Gui

The twelve branches:

子 Zi · 丑 Chou · 寅 Yin · 卯 Mao · 辰 Chen · 巳 Si · 午 Wu · 未 Wei · 申 Shen · 酉 You · 戌 Xu · 亥 Hai

The two ordered series advance together. Because 10 and 12 have a least common multiple of 60, the combined sequence returns to its starting pair after 60 positions. Only parity-compatible pairs occur, giving the familiar sixty stem–branch combinations.

Modern scholarship on early Chinese chronology documents the stems as day names by the Shang period and the combined stem–branch sequence as a sixty-day dating cycle. Later periods also applied the cycle to years and integrated it into wider cosmological and technical systems.

## GUANSHI principle

> A time label can identify when something happened. That does not make the label a cause of what happened.

Chinese:

> 时间标签可以说明“事情发生在什么时候”，但这不等于这个标签就是“事情为什么发生”的原因。

This distinction is essential because time labels can correlate with outcomes through confounding variables such as season, weather, human schedules, market regimes, agricultural cycles, holidays or institutional routines.

## T05 translation protocol

### Step 1 · Define the actual outcome

Examples:
- demand rises / falls;
- project delay;
- error rate;
- sleep quality;
- customer traffic;
- weather-linked event;
- decision success/failure.

The outcome must be defined before reviewing the stem–branch label.

### Step 2 · Record known real drivers

Examples:
- season;
- weekday;
- clock time;
- temperature;
- precipitation;
- workload;
- market conditions;
- age;
- location;
- industry cycle;
- holidays;
- policy or operational changes.

### Step 3 · Build a baseline model

Use only the real predictors and appropriate base rates.

### Step 4 · Add Ganzhi features

Possible experimental features:
- stem category;
- branch category;
- sixty-cycle position;
- preregistered traditional groupings.

These are added as categorical features, not assumed causal mechanisms.

### Step 5 · Out-of-sample test

Compare the baseline model with the baseline + Ganzhi model on later unseen cases.

Useful metrics depend on the problem:
- classification accuracy;
- log loss;
- Brier score;
- calibration;
- MAE/RMSE;
- decision utility;
- false-positive / false-negative costs.

### Step 6 · Credit only incremental value

If Ganzhi labels do not improve later predictions, calibration or decision quality, they receive **zero predictive weight**.

A post-hoc narrative does not count as added value.

## What T05 does not claim

T05 does not claim that:
- the ten stems or twelve branches are scientifically established forces;
- a person’s personality is determined by a stem or branch label;
- zodiac animals cause behavior;
- a stem–branch date is inherently lucky or unlucky;
- later Five-Phase mappings are identical to the earliest historical use;
- calendar periodicity automatically implies causal periodicity.

## Evidence labels

- **Established / historical** — documented chronological use.
- **Traditional** — later symbolic correspondence systems.
- **Exploratory** — preregistered Ganzhi-as-feature testing.
- **Rejected** — deterministic or causal claims repeatedly contradicted by evidence.

## Source anchors

1. Cambridge University Press excerpt on Chinese time-reckoning and the sexagenary cycle: documents ten-day stem naming by the Shang period, systematic pairing with twelve branches, the sixty-day cycle, and later use for years.
2. *Early China* scholarship on ten Gan and twelve Zhi in Shang civilization.
3. Chinese Text Project lexical/textual records for 干支 and later historical texts describing the ten stems, twelve branches and sixty combinations.

## Connection to prior GUANSHI nodes

- **T01 Yijing / Change** asks what changes.
- **T02 Yin–Yang / Relation** asks what contrasts and interacts.
- **T03 Five Phases / Systems** asks how multiple relationships form feedback structures.
- **T04 Bagua / States** asks how a situation can be compactly classified.
- **T05 Ganzhi / Time** asks where a state sits in a chronological cycle — while refusing to confuse temporal labeling with causal explanation.

## Next node

T06 Bazi / Four Pillars should be built on top of T05 only after separating:

1. factual birth-time/calendar conversion;
2. historical structure of Four Pillars / Ziping traditions;
3. symbolic interpretation rules;
4. deterministic personality/fate claims;
5. preregistered empirical testing against base rates and known personal variables.
