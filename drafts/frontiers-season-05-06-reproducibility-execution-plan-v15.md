# RUNLU FRONTIERS V — Essay 06 Reproducibility Execution Plan v1.5
Date: 2026-11-17
Status: INTERNAL RESEARCH; no independent replication, drafting or publishing clearance.

## What was actually attempted this round
- Reopened public research repository landing page https://github.com/preacceptance/chatbot_manipulation ; confirmed e1_reddit, e2_intervention_study, e3_duration_study, e4_brand_risks_study, pre_study, process.R.
- Public folder links for e2 and e3 failed in the available web fetch with restricted URL.
- Tried GitHub public tree API URL https://api.github.com/repos/preacceptance/chatbot_manipulation/git/trees/main?recursive=1 ; the available web fetch could not access the URL.
- Tried a sandbox read-only Python HTTP request for the same tree API; the sandbox had no DNS/network access.
- Previously the connected GitHub file reader rejected directory paths, saying they were directories, not files.
**Result: archive not downloaded, per-folder filenames not inventoried, and no data or scripts executed.**

## Reproducible read-only procedure for a network-enabled environment
1. Open https://github.com/preacceptance/chatbot_manipulation and use Code > Download ZIP (or download https://github.com/preacceptance/chatbot_manipulation/archive/refs/heads/main.zip).
2. Record archive URL, date, SHA-256 checksum and repository commit SHA before examining contents. Do not assume main remains unchanged.
3. Extract in a temporary isolated directory and list file paths and sizes only; flag files containing personal data, proprietary scripts, or restrictive licenses.
4. Inventory each of e1_reddit, e2_intervention_study, e3_duration_study, e4_brand_risks_study, pre_study: README, preregistration, data dictionary, deidentified datasets, cleaning scripts, analysis scripts, outputs, environment requirements, and licenses.
5. Never redistribute process.R: its header identifies Andrew F. Hayes PROCESS, all rights reserved with redistribution restrictions. Do not package the third-party code or datasets in RUNLU products.
6. For each statistical table, first document which exact dataset and script generated it. Match preregistered variables, exclusions and sample size. Recompute using authorized, suitably licensed software if data are available.
7. Specifically recompute six-platform farewell counts and report both 374/1200 and 374/1000 with explicit denominators; do not call arithmetic from published tables independent replication.
8. If missing data or scripts prevent reproduction, mark the outcome NOT REPRODUCIBLE FROM AVAILABLE MATERIALS, not disproven.

## Audit log template
| Study | Source commit | Files seen | Raw/deidentified data | Analysis script | License checked | Prereg match | Recomputed output | Status |
|---|---|---|---|---|---|---|---|---|
| E1 Reddit | pending | pending | pending | pending | pending | n/a | pending | NOT INSPECTED |
| E2 intervention | pending | pending | pending | pending | pending | pending | pending | NOT INSPECTED |
| E3 duration | pending | pending | pending | pending | pending | pending | pending | NOT INSPECTED |
| E4 brand risks | pending | pending | pending | pending | pending | pending | pending | NOT INSPECTED |
| Pre-study | pending | pending | pending | pending | pending | pending | pending | NOT INSPECTED |

## Editorial decision
Maintain conditional HOLD for Essay 06. This file provides an actionable reproducibility procedure, not a completed experiment audit. No published RUNLU files, third-party code, accounts or subscriptions changed.
