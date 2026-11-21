# RUNLU KNOWLEDGE — Editorial release protocol v0.1

Status: internal editorial workflow. This document does not approve any record for publication.
Updated: 2026-11-01

## Mission and boundary
RUNLU KNOWLEDGE is a multilingual, cross-industry knowledge platform. Flooring is the first collection, not the whole product. Product-specific calculations belong in Carpet Planner; inventory allocation belongs in SmartRoll; warehouse operations belong in Flooring OS.

## Record lifecycle
1. **Inbox** — candidate idea and source leads, not a knowledge claim.
2. **Draft** — original summary, scope, evidence links, and four-language drafts.
3. **Evidence review** — reviewer checks exact source section, publication date/version, applicability, and whether claims are supported.
4. **Rights review** — record whether content is original, factual, quoted, or licensed. Public access to a PDF is not permission to reproduce it. Each source must have explicit rights disposition and notes.
5. **Language review** — independently check terminology, units, qualifiers, and scope in EN/ZH/FR/ES.
6. **Approval** — named reviewer and review date; every required flag true; source license_status permitted; then create a separately reviewed published entry.
7. **Maintenance** — revision history, source recheck, correction/withdrawal process.

## Minimum acceptance checklist
- [ ] Specific claim and intended audience clearly stated
- [ ] Source title, issuing body, version/date, exact section and stable URL recorded
- [ ] Independent technical verification completed, with product/region exceptions documented
- [ ] No unsupported universal installation rule or invented waste percentage
- [ ] Reuse permission / original-expression analysis documented for each source
- [ ] EN/ZH/FR/ES translations checked by reviewer, including technical terms
- [ ] Record has reviewer, reviewed_at, version, and maintenance owner
- [ ] Public entry contains no private operational data, personal information, or unlicensed excerpts
- [ ] Published dataset passes schema/eligibility validation before deployment
- [ ] Live page checked in all four languages after deployment

## Current audit (2026-11-01)
- RK-0001 Open scholarly metadata: draft; facts, rights and translations unapproved.
- RK-0002 Carpet area units: facts_verified true; rights and translations unapproved.
- RK-0003 Carpet roll width and cut planning: facts_verified true; rights and translations unapproved.
- RK-0004 Carpet seams, pile and pattern: facts_verified true; rights and translations unapproved.
- published.json: empty; this is intentional until approvals are evidenced.

## Next editorial milestone
Produce one independently authored, four-language flooring entry (candidate RK-0002) with a claim-by-claim evidence sheet and recorded rights review. Do not set license_verified or translations_verified merely because a source is linked or the text looks plausible.

## Future taxonomy
- Flooring & Construction (initial collection)
- Canadian Life & Immigration
- Small Business Operations
- AI Tools & Digital Literacy
- Health & Wellbeing (stronger evidence and safety review)
- Independent Publishing

Taxonomy additions are proposals, not live categories. Each category needs a clear scope, source-quality policy, reviewer and maintenance cadence.

## Internal review v1.0 implementation

The operational gate now requires separate version-bound human records for facts,
practice, each of EN/ZH/FR/ES, and each source's rights, in addition to legacy flags.
Use [the v1.0 procedure](INTERNAL_REVIEW_V1.md). Internal review is not external expert
endorsement. AI assistance cannot approve a dimension or claim external status.
The factual-reference exception follows SOURCE_RIGHTS_POLICY v0.2; all other
third-party reproduction still requires documented permission. Nothing here
approves RK-0005, changes the public export or authorizes deployment.
