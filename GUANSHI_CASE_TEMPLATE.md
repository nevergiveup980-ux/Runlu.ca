# RUNLU GUANSHI · Case & Validation Template

Version: **V1.0 · aligned with GUANSHI V1.5 Validation Lab**

Purpose: freeze a judgment **before** the outcome is known, then append dated reviews later without rewriting the original record.

Public tool:
- `guanshi-validation.html` — **Validation Lab / 观势验证台**

## 1. Case identity
- Case ID:
- Created at:
- Source route: general / traditional / manual
- Judgment type: binary forecast / decision judgment
- Review date:
- Stakes: low / medium / high

## 2. Question
- Exact question:
- Decision deadline / event horizon:
- What would count as resolved?

## 3. Known facts
Record only information known **before** the outcome.

- Fact 1:
- Fact 2:
- Fact 3:
- Missing information:

## 4. Reality layer
- Resources:
- Constraints:
- Environment:
- Relevant history:
- Observable behavior:
- External conditions:
- Base rate / reference class when available:

## 5. GUANSHI lenses
- 易 · Change:
- 象 · Pattern:
- 数 · Measure:
- 时 · Time:
- 地 · Environment:
- 人 · Person:
- 事 · Situation:
- 变 · Scenarios:
- 势 · Integrated direction:

## 6. Traditional layer — optional
For every traditional input, attach a label and never silently convert symbolic interpretation into factual certainty.

| Model | Input / interpretation | Label | Testable prediction? |
|---|---|---|---|
| Yijing / Bagua | | Symbolic / Traditional | |
| Yin–Yang / Five Phases | | Symbolic / Traditional | |
| Stems & Branches | | Traditional / Mixed | |
| Bazi | | Traditional | |
| Six Lines / Meihua | | Exploratory / Traditional | |
| Feng Shui | | Measurable / Symbolic / Traditional | |

## 7. Frozen pre-outcome judgment
This block must be completed **before** the outcome is known.

- Exact forecast / judgment to test:
- Recommended action, if any:
- Confidence: ___%
- Main reasons:
- Strongest counterargument:
- What would count against the judgment?
- What evidence would change the recommendation?
- What evidence would falsify a traditional interpretation?
- What evidence would falsify the modern-model assumption?

### Binary forecast fields
Use only when the target is genuinely yes / no.

- Predicted outcome: yes / no
- Confidence in predicted outcome: ___%
- Review deadline:

For scoring after resolution, convert to probability of **Yes**:
- if predicted Yes: `p = confidence`;
- if predicted No: `p = 1 - confidence`.

Then:

`Brier score = (p - y)^2`

where actual `y = 1` for Yes and `y = 0` for No.

Lower is better. A single Brier score is not proof of forecasting skill; use a series of comparable pre-registered cases.

### Decision judgment fields
Use when the question is about choosing an action rather than predicting a clean binary event.

- Recommended action:
- Confidence:
- Main downside:
- Robust fallback if the main assumption is wrong:

Do **not** manufacture a binary score when the case is not genuinely binary.

## 8. Integrity fingerprint
The V1.5 browser tool computes a SHA-256 fingerprint over the frozen original block.

This is useful for detecting accidental local changes. Because both the case and fingerprint are stored in the same browser, it is **not** a public timestamp or independent cryptographic proof of non-tampering.

Future enhancement: optionally anchor only the case hash + timestamp server-side without storing consultation text.

## 9. Outcome review
Complete only after the review date or when the event clearly resolves.

Each review is a **new dated entry**.

- Review status: interim / final
- Actual action taken:
- Actual outcome:
- What we predicted correctly:
- What we predicted incorrectly:
- Important surprise:
- Was confidence calibrated?
- Did any traditional lens add information beyond ordinary facts/base rates?
- Did a traditional lens merely redescribe what was already known?
- Did any modern method fail because inputs or assumptions were poor?

For a resolved binary case:
- actual outcome: yes / no
- Brier score:
- directional hit: yes / no

## 10. Weight adjustment
- Increase weight:
- Keep weight:
- Reduce weight:
- Reject / archive:
- Reason:

Weight adjustments apply to **methods or assumptions**, not to rewriting the historical case.

## 11. Calibration discipline
Track, at minimum:
- number of frozen cases;
- number of final reviews;
- number of resolved binary forecasts;
- directional accuracy for resolved binary forecasts;
- mean Brier score for resolved binary forecasts.

Do not advertise accuracy from a tiny, cherry-picked or mixed sample. Separate comparable case classes where possible.

## 12. Audit rule

> **Do not edit the original prediction after the outcome is known. Add corrections and reflections as a dated review so the historical record remains intact.**

Chinese:

> **结果出来以后，不改原判；只追加复盘。命中的留下，失误的也留下。**
