# RUNLU Evolution Record

Started: 2026-09-17  
Purpose: preserve the evolution of RUNLU as a human-founded, AI-operated digital organization.

This is not a marketing timeline. It is an operational record. It should preserve successes, restraint, mistakes, reversals, and corrections rather than presenting a polished mythology after the fact.

## What this record tracks

- changes in the division of responsibility between founder and AI;
- editorial and operational systems added, changed, merged, or abandoned;
- important publication/QA failures and the safeguards created from them;
- meaningful decisions not to publish;
- introduction of independent AI reviewers or QA workers;
- changes in forum, promotion, research, and automation behavior;
- cases where later evidence materially confirms or weakens an earlier RUNLU judgment;
- major milestones in continuity and governance, if the founder later approves them.

## 2026 — From AI assistance toward AI operation

### Foundation phase
RUNLU developed as a human-founded collection of writing, software, research, health observations, and experiments. The site adopted a restrained "Honest Beta + Quiet Growth" direction: real states instead of invented activity, clear distinctions between released/demo/upcoming work, and no fabricated users, discussions, recommendations, analytics, or research conclusions.

### Multilingual editorial layer
RUNLU VIEW and HEALTH VIEW developed into four-language editorial streams (English, Chinese, French, Spanish). The operating preference became regular research without mandatory publication: **fixed research, unfixed publishing**.

### Publication closure lesson
Repeated cases showed that creating an article file did not guarantee that a reader could discover it from the corresponding section. RUNLU therefore adopted a hard publication rule: repository existence, visible navigation/catalog entry, language behavior, sitemap, metadata, evidence/limitations, mobile behavior, cache handling, and public verification are separate checks. A repository commit must never be reported as equivalent to a fully verified public release.

### AI editorial autonomy
The founder delegated ordinary reversible content operations to the AI executive operator. The founder continues to reserve major brand direction, legal matters, money, ownership, core-account control, and irreversible actions. The practical rule became: **small/reversible actions may proceed; major/irreversible actions are reported first.**

### 2026-09-17 — Operating charter established
`RUNLU_OPERATING_CHARTER.md` was added to turn previously conversational operating principles into a durable repository-level document. This marks a shift from relying only on chat context toward preserving institutional memory with the site itself.

The charter defines the current organizational direction:

- Founder — purpose, values, hard boundaries, reserved decisions.
- AI Executive Operator / Editor-in-Chief — ordinary research, judgment, execution, publication, QA follow-through, and iteration.
- Research Reviewer — planned independent challenge/fact-check role.
- Site QA — planned independent live-publication verification role.
- Promotion / Forum Operator — later role, with transparent AI identity and no manufactured engagement.

### 2026-09-17 — Evolution record started
This file was created so RUNLU can later answer a more important question than "how much did the AI publish?":

**Did its judgment improve?**

Future entries should include failures and non-actions as well as successes. If the record becomes self-congratulatory, it has failed its purpose.

### 2026-09-17 — Structured decision memory started
`RUNLU_DECISION_LOG.jsonl` was added as a lightweight machine-readable decision history. It records not only publications but holds, corrections, reasons, limitations, and verification state. The first entries preserve the decision to publish VIEW 024, the decision to hold overlapping AI-safety coverage, and the establishment of the log itself.

This creates a distinction between two kinds of memory: the Evolution Record explains major organizational changes for humans; the JSONL Decision Log preserves individual judgments in a form that can later be analyzed for consistency, error patterns, reversals, and improvement.

### 2026-09-17 — Independent publication QA established
RUNLU added `scripts/check-publication-closure.mjs` and the `RUNLU Publication QA` GitHub Actions workflow. The repository check is deterministic rather than another self-reviewing editorial voice. It tests VIEW sequence and discoverability, article files, four-language presence, canonical/Open Graph metadata, sitemap inclusion, static mobile guards, and independent HEALTH VIEW links. A separate scheduled job checks live/CDN publication state rather than assuming a repository commit equals a public release.

The first meaningful result arrived immediately: the new QA correctly detected that HEALTH VIEW 009 existed and was listed in the sitemap but was still absent from the visible HEALTH landing navigation. The defect was repaired in commit `206d0bb2459577b05cad56d3d5337e4a1684f74f`, and the repository publication-closure check then passed.

The QA was then expanded so scheduled live checks cover the newest HEALTH VIEW as well as the newest VIEW: live landing discoverability, canonical URL, sitemap presence, and four-language article bodies are now part of the public closure test. An attempted extra static guard was rejected after the QA itself exposed that the assumption did not match the site's actual responsive structure. The guard was corrected rather than changing the site merely to satisfy the test.

This is an important organizational change: the system that creates content is no longer the only system deciding whether publication is complete, and the QA rules themselves are treated as fallible systems that must earn trust through real failures.

### 2026-09-17 — Institutional memory integrity guard established
RUNLU added `scripts/check-decision-log.mjs` and the `RUNLU Memory Integrity` workflow. The machine-readable Decision Log is now checked for valid JSONL, schema version, ISO dates, recognized decision types, reasons/findings, chronological append order, and probable duplicate entries. The workflow also confirms that the Operating Charter, Evolution Record, and Decision Log remain present.

The first validation run passed. This creates a small but important distinction: RUNLU not only keeps institutional memory; it now checks that the memory remains machine-readable enough to be used later for retrospective analysis.

### 2026-09-17 — Knowledge network foundation started
`RUNLU_KNOWLEDGE_MAP.json` was added as a deliberately small relationship layer over existing RUNLU material. The first map contains seven durable topic questions, fifteen verified VIEW/HEALTH VIEW nodes, and seven editorial relationships. It connects sequences such as closed-loop intelligence → company as robot → red-button authority → goal-setting, and formal mathematics → proof verification → executable scientific papers.

The map is not a recommendation engine and is not intended to manufacture internal links. Each relationship requires an editorial reason, and a connection does not imply equal evidence strength or agreement. `scripts/check-knowledge-map.mjs` now verifies unique topic/node identities, real repository paths, valid topic references, valid edge endpoints, relationship labels, and editorial notes. The Memory Integrity workflow runs this validator alongside the Decision Log validator.

No public-facing related-reading interface was added in this step. The network begins as auditable internal structure first; reader-facing navigation should be introduced only when the relationships are useful enough to improve discovery rather than decorate the site.

## Next operational milestones

These are directions, not promises or artificial deadlines.

1. Let the structured decision log accumulate naturally; do not manufacture retrospective entries merely to make the dataset look larger.
2. Introduce an independent Research Reviewer when a genuinely separate model/service is connected; do not simulate independence with another label on the same process.
3. Let Site QA accumulate real failures and tune it from evidence; avoid turning it into a brittle checklist that produces noise.
4. Expand the knowledge map only when a relationship is editorially useful; later expose selected relationships to readers rather than dumping the graph into the interface.
5. Develop restrained promotion and multi-AI forum workflows only when real channels/APIs and identity provenance are available.
6. Keep continuity/governance planning separate from execution until the founder explicitly approves legal, financial, ownership, and succession arrangements.

## Record discipline

Every material entry should be dated. Claims about public deployment should distinguish repository state from verified live state. External AI participation must name the real system used. Decisions and mistakes should not be rewritten later merely to make RUNLU appear more successful.
