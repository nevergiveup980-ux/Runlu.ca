# RUNLU GUANSHI · T08 Feng Shui · 环境的语法

Status: **V1.2 · structured site ledger live**

Public page: `guanshi-fengshui.html`  
Live consultation: `guanshi-traditional-consult.html`

## Core position

Feng Shui is studied as a layered tradition about **site, environment, orientation, form, movement and symbolic order**.

GUANSHI does **not** assume that every traditional Feng Shui prescription has a measurable causal effect. Instead it separates:

1. measurable environmental conditions;
2. spatial and behavioural effects;
3. traditional form/compass/symbolic rules;
4. outcome claims.

Core rule:

> The environment can matter. Why it matters must be demonstrated layer by layer.

**环境可以重要；它为什么重要，必须一层一层证明。**

A second rule:

> Measure first. Symbolize second. Test added value last.

**先测环境，再看象征，最后检验增量价值。**

## V1.2 operational site ledger

The public consultation now collects a structured environmental record instead of relying on a single free-text “Feng Shui description.”

### Measurable / observable inputs

When Feng Shui is selected, the user may record:

- site type: home / workplace / business / room / other;
- main use of the space;
- facing direction in degrees, 0–359.9;
- how the direction was obtained: compass / plan-map / estimate / unknown;
- daylight quality;
- ventilation / air movement;
- noise level;
- moisture / dampness status;
- movement / circulation quality;
- layout notes: entrance, doors, windows, bed/desk and main paths;
- outside environment: roads, slope, water, surrounding buildings and noise sources;
- the outcome the user hopes to improve;
- other known real-world facts and constraints.

The purpose is not to pretend that every item has equal scientific weight. It is to stop the consultation from jumping directly from a symbolic direction to a life conclusion without first describing the actual place.

### Deterministic orientation layer

If a facing degree is supplied, the server calculates two traditional coordinate labels **before AI interpretation**:

1. **8-direction sector** — N / NE / E / SE / S / SW / W / NW, associated with the corresponding trigram label;
2. **24-mountain label** — one of 壬子癸、丑艮寅、甲卯乙、辰巽巳、丙午丁、未坤申、庚酉辛、戌乾亥.

The original degree and the measurement basis are preserved with the result.

These are deterministic compass labels, not evidence that the symbolic direction causes prosperity, health, relationship or career outcomes.

### Credit rule

If a recommendation works because it improves:

- light;
- ventilation;
- noise exposure;
- moisture control;
- circulation;
- privacy;
- accessibility;
- heat / sun exposure;
- safety;

then GUANSHI credits that measurable mechanism first.

A symbolic Feng Shui rule receives separate attention only for **incremental value beyond the measurable explanation**.

## Historical caution

`葬书 / Zangshu` is an important traditional textual anchor for later Feng Shui discourse, especially around burial siting, qi, wind and water.

However, transmitted attribution and textual history require caution. Modern digital cataloguing and received tradition may associate the work with Guo Pu, while the textual record itself has attribution/layering uncertainty. GUANSHI therefore distinguishes:

- received traditional attribution;
- surviving textual edition;
- later commentary and school development;
- modern historical reconstruction.

No later Luo Pan, Flying Stars, Eight Mansions or school-specific rule is projected unchanged back into the earliest textual layer.

## Two ledgers

### Ledger A · measurable environment

Examples:

- daylight / solar exposure;
- indoor temperature and thermal stability;
- ventilation and air quality;
- neighbourhood and indoor noise;
- access and circulation;
- crowding and usable space;
- safety hazards and accessibility;
- privacy and visual exposure;
- terrain, slope and drainage;
- moisture and water management;
- orientation where it changes sun, wind, heat or view;
- vegetation and surrounding built form where they alter measurable conditions.

These are investigated with building science, environmental health, ergonomics, architecture, planning and direct measurement.

### Ledger B · traditional / symbolic rules

Examples:

- qi;
- zang feng / de shui formulations;
- mountain/water symbolic forms;
- dragon, tiger, bright hall and other form-language;
- directional auspiciousness;
- compass-school calculations;
- bagua / five-phase correspondences;
- Eight Mansions, Flying Stars and other school-specific prescriptions;
- prosperity, relationship, health or fate claims attached to directions/forms.

These remain **Traditional** or **Symbolic** unless a specific measurable claim survives independent testing.

## Five working layers

### 1 · Site facts

Record first:

- location context without collecting more precise address data than the question needs;
- facing degree and measurement basis;
- surrounding roads/buildings;
- slope, drainage and water exposure;
- climate and prevailing weather when relevant;
- floor plan, room dimensions and openings when available;
- occupancy and actual use.

### 2 · Measurable environmental variables

Measure or classify where relevant:

- illuminance / daylight pattern;
- temperature;
- humidity;
- air exchange / ventilation proxy;
- indoor pollutants where relevant;
- sound levels;
- walking paths / bottlenecks;
- sightlines and privacy;
- trip/fall or other safety risks.

The public prototype currently uses structured qualitative categories for several variables. Future versions may accept actual measurements where users have them.

### 3 · Human-use outcomes

Define outcomes before redesign:

- comfort;
- ease of movement;
- task efficiency;
- sleep-environment satisfaction (not medical diagnosis);
- room-use frequency;
- perceived privacy;
- wayfinding;
- maintenance burden;
- low-stakes preference ratings.

### 4 · Traditional interpretation

Only after the physical record is established, document:

- school used;
- directional/form rule;
- symbolic rationale;
- predicted outcome;
- confidence;
- time horizon.

No switching schools after observing the result.

### 5 · Comparative test

Compare:

- **M0:** measurable environment + known behavioural/context variables;
- **M1:** M0 + one preregistered Feng Shui rule set.

If M1 does not improve prediction, explanation, design choice or repeatable low-stakes outcome beyond M0, the symbolic rule receives no factual weight.

## Translation protocol

For every Feng Shui prescription:

**traditional statement → possible physical mechanism → measurable variables → baseline → intervention/observation → outcome → reweight**

Example:

Traditional statement: “this orientation is favourable.”

GUANSHI asks:

1. Does the orientation change daylight?
2. Does it change heat gain or prevailing wind exposure?
3. Does it alter noise, privacy, view or access?
4. Can those differences explain the outcome?
5. If known variables already explain the result, is there any residual signal left for the traditional rule?

If no observable mechanism or repeatable incremental signal remains, the claim stays **Symbolic/Traditional**.

## What T08 may legitimately preserve even without predictive validation

Feng Shui can still be studied as:

- a historical language of siting and spatial order;
- a cultural framework for noticing relationships between people and place;
- a prompt for inspecting neglected environmental variables;
- a structured way to discuss thresholds, enclosure, exposure, flow and orientation;
- a design-reflection tool.

These uses must not be mislabeled as proof that symbolic directional rules control fate.

## Evidence boundary

Environmental effects are domain-specific. Evidence for temperature, air quality, noise, crowding, safety or accessibility does **not** validate unrelated compass or auspiciousness rules.

Likewise, a traditional rule that happens to point toward a good environmental design outcome does not establish its stated metaphysical mechanism.

## High-stakes boundary

Feng Shui symbolism must not replace:

- structural engineering;
- fire/building code compliance;
- environmental testing;
- medical advice;
- legal/property due diligence;
- flood, radon, mould or other professional hazard assessment.

For high-downside choices, qualified evidence and professional standards control the recommendation.

## Source anchors

### Traditional

- `葬书 / Zangshu`, Chinese Text Project transmitted edition.
- Richard J. Smith, *Fortune-tellers and Philosophers*, for historical discussion of Chinese divination/geomancy traditions.

### Modern environmental evidence

- World Health Organization, *WHO Housing and Health Guidelines* (2018): evidence-based recommendations on healthy housing, including indoor temperature, injury hazards, accessibility, air quality, neighbourhood noise, crowding and related environmental conditions.

## T08 output

Feng Shui enters GUANSHI not as a certified causal science, but as a final environmental lens:

**Environment = measurable place conditions + human use + traditional spatial symbolism + outcome audit**

With T08, the traditional learning line is complete:

**Change → Relation → System → State → Time → Person × Time → Event → Environment**

GUANSHI then asks the integrative question:

> After facts, context, time, people, events and environment are separated and weighted by evidence — what is the actual direction of the situation?

That is **势 / Dynamics**.
