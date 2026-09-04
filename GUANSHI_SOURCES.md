# RUNLU GUANSHI · Scientific Source Ledger

Status: V0.2 seed library  
Rule: sources support **specific methods or claims**, never the framework as a whole.

## Source-quality policy

1. Prefer original peer-reviewed papers, major academic reference works, standards, and transparent institutional methods.
2. Record exactly what a source supports; do not stretch a source beyond its scope.
3. A famous or highly cited paper is not automatically current truth. Important findings may need replication/review checks before use as an operational rule.
4. Traditional texts document historical ideas; they do not by themselves establish empirical validity.
5. Every future public claim should link to an evidence label: Established / Supported / Exploratory / Traditional / Symbolic / Rejected.
6. High-stakes recommendations require domain-specific evidence and qualified professional standards; this general ledger is not sufficient.

---

## S001 · Normative decision theory under uncertainty

**Source**  
H. Orri Stefánsson & Katie Steele, “Decision Theory,” *Stanford Encyclopedia of Philosophy*, substantive revision 20 Aug 2025.  
https://plato.stanford.edu/entries/decision-theory/

**What it supports for GUANSHI**
- Decision theory explicitly concerns reasoning underlying choices.
- Uncertainty is central to real-world decision theory.
- Expected-utility approaches provide one important normative structure, while substantial debates and alternatives remain.
- Precise probabilities/preferences are not always available; models of imprecise uncertainty exist.

**GUANSHI use**
- Supports the distinction between options, beliefs/uncertainty, values and consequences.
- Supports avoiding the claim that one single decision rule solves all uncertain choices.

**Label:** Established background / academic reference.

---

## S002 · Heuristics and systematic judgment errors

**Source**  
Amos Tversky & Daniel Kahneman (1974), “Judgment under Uncertainty: Heuristics and Biases,” *Science*, 185(4157), 1124–1131.  
https://www.science.org/doi/10.1126/science.185.4157.1124

**What it supports for GUANSHI**
- Human probability/frequency judgments can rely on heuristics such as representativeness, availability and anchoring/adjustment.
- Intuitive judgment under uncertainty can produce systematic errors.

**GUANSHI use**
- Mandatory bias-check layer before accepting an intuitive, symbolic or narrative interpretation.
- Particularly relevant when a striking coincidence or memorable example seems more informative than a base rate.

**Label:** Established foundational finding; operational details should be checked against later literature where necessary.

---

## S003 · Choice framing and behavior under risk

**Source**  
Daniel Kahneman & Amos Tversky (1979), “Prospect Theory: An Analysis of Decision under Risk,” *Econometrica*, 47(2), 263–291.  
https://www.jstor.org/stable/1914185

**What it supports for GUANSHI**
- Expected-utility theory is not a complete descriptive account of how people actually choose under risk.
- Choices can differ depending on how gains/losses and prospects are framed.

**GUANSHI use**
- A decision should be reframed in more than one equivalent way before treating an intuitive preference as stable.
- “I do not want to lose what I already have” and “Which option has the best forward-looking trade-off?” should be examined separately.

**Label:** Established foundational behavioral model; exact operational assumptions require context.

---

## S004 · Calibration of probabilistic forecasts

**Source**  
Glenn W. Brier (1950), “Verification of Forecasts Expressed in Terms of Probability,” *Monthly Weather Review*, 78(1), 1–3.  
https://doi.org/10.1175/1520-0493(1950)078%3C0001:VOFEIT%3E2.0.CO;2

**What it supports for GUANSHI**
- Probabilistic forecasts can be evaluated quantitatively against observed outcomes.
- The Brier-score tradition provides a concrete route from subjective confidence statements to calibration testing.

**GUANSHI use**
- Where cases allow binary/event forecasts, record a probability before the outcome and compute a proper scoring metric later.
- Long-run GUANSHI evaluation should measure calibration, not only count memorable “hits.”

**Label:** Established forecasting method.

---

## S005 · Robust decisions under deep uncertainty

**Source**  
RAND research on Robust Decision Making (RDM), including the RDM methodology described in RAND RR-3017 and earlier foundational work by Lempert, Popper and Bankes.  
https://www.rand.org/content/dam/rand/pubs/research_reports/RR3000/RR3017/RAND_RR3017.pdf

**What it supports for GUANSHI**
- Under deep uncertainty, analysis can explore multiple plausible futures rather than force a single precise forecast.
- Robust strategies seek acceptable performance over a wide range of plausible futures instead of optimizing for one assumed future.
- Decision framing and iterative “deliberation with analysis” are central to the method.

**GUANSHI use**
- The “变 / Scenarios” lens should examine multiple plausible futures.
- The “势 / Dynamics” output should prefer robust actions when key assumptions are uncertain, especially when downside is large.

**Label:** Supported / established decision-analysis methodology, depending on the particular application.

---

## S006 · Preregistration and protection against after-the-fact rewriting

**Source**  
Center for Open Science, Registered Reports / preregistration resources and ongoing research on publication pre-commitment methods.  
https://www.cos.io/initiatives/registered-reports  
https://www.cos.io/r3ct/gfs-trial

**What it supports for GUANSHI**
- Preregistration and Registered Reports are pre-commitment approaches designed to reduce problems including HARKING and other after-the-fact analytical flexibility.
- Their actual effects remain an empirical research question; they should not be portrayed as a perfect cure.

**GUANSHI use**
- Freeze a case judgment before the outcome is known.
- Preserve the original prediction and append later reviews instead of rewriting history.
- Treat the anti-hindsight protocol as a bias-control mechanism, not proof that a prediction method is valid.

**Label:** Supported methodological practice; effectiveness should be reviewed as evidence develops.

---

# How sources connect to the GUANSHI loop

| GUANSHI step | Scientific support seeded in V0.2 |
|---|---|
| Observe | S002 — bias awareness |
| Frame | S001, S003, S005 — options, framing, decision structure |
| Estimate | S001, S004 — uncertainty and probabilistic forecasts |
| Decide | S001, S005 — consequences, robustness, multiple futures |
| Record | S006 — pre-commitment / preregistration principle |
| Review | S004, S006 — scoring, calibration, preserved record |
| Reweight | S004 + accumulated GUANSHI cases — reward calibration and added predictive value |

# Traditional-source protocol — next build

For Yijing, yin–yang, five phases, bagua, stems/branches, Bazi, divination and feng shui, create **two records** whenever possible:

1. **Historical-source record** — what the traditional text or school actually says, including date/version/translation uncertainty.
2. **Empirical-claim record** — whether a specific measurable claim has been tested, how it was tested, and whether credible evidence supports, fails to support, or contradicts it.

Never convert “historically documented” into “scientifically established.”
