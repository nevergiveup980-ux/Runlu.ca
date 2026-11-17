# RUNLU FRONTIERS V — Essay 06 Experiment Directory Access Gate v1.4
Date: 2026-11-17
Status: INTERNAL RESEARCH; HOLD.

## Attempted direct source access
Target repository: https://github.com/preacceptance/chatbot_manipulation
The repository landing page identifies e1_reddit, e2_intervention_study, e3_duration_study, e4_brand_risks_study, pre_study, process.R, and top-level configuration files.

Attempted direct GitHub connector fetch for these three paths:
- e2_intervention_study
- e3_duration_study
- e4_brand_risks_study
All three returned 'GitHub path points to a directory, not a file'. This **confirms they are directories**, but the connector fetch_file action cannot enumerate their contents.

Attempted public GitHub web folder URLs; all returned restricted URL fetch errors. Therefore **no child filenames, datasets, scripts or analysis outputs were directly inspected this round**. Do not infer missing data from failed directory listing.

## Reproducibility status
- Repository and top-level directory existence: verified.
- process.R copyright restriction: directly inspected in prior v1.3.
- Per-study file inventory: BLOCKED by available directory listing.
- Data dictionary and exclusion records: NOT CHECKED.
- Study 2/3/4 numerical reproduction: NOT DONE.
- Preregistration-to-analysis comparison: PENDING.
- Study 1 374/1200 vs 374/1000: arithmetic from published paper, not independent reproduction.

## Next permitted paths
1. Use a GitHub connector action that explicitly lists a repository tree or directory, if available later.
2. Alternatively inspect a downloadable public archive in a sandbox, only if public access succeeds, without republishing third-party code or data.
3. Pin repository commit SHA and inspect exact data/scripts with their licenses.
4. Recalculate study outcomes using licensed tooling and available deidentified data; otherwise clearly mark NOT REPRODUCIBLE FROM ACCESSIBLE MATERIALS.
5. Preserve paper-version and denominator cautions in any future prose.

## Editorial decision
No fabricated directory inventory or replication claim. Sixth essay remains CONDITIONAL HOLD; no public RUNLU site modifications, spending, or account actions.
