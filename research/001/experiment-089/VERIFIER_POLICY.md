# E089 — Verifier Policy

Every verification record must bind:
- verifier ID/version;
- ruleset ID/version;
- artifact digest;
- observed result;
- expected result;
- execution/verification time.

When verifier logic changes:
1. distinguish BUG_FIX from RULESET_CHANGE;
2. replay retained critical artifacts when possible;
3. mark old acceptances VERIFIER_OBSOLETE if a bug-fixed verifier rejects them under the same rule;
4. propagate the change through the claim dependency graph;
5. never silently reinterpret an old PASS under a new ruleset.

Missing replay metadata yields UNREPRODUCIBLE_VERIFICATION.

## Next drill — E090
Verifier consensus is not automatically truth.

Create two independently implemented verifiers against the same explicit specification plus adversarial fixtures. Separate:
AGREEMENT_PASS, AGREEMENT_FAIL, VERIFIER_DISAGREEMENT, and SHARED_SPECIFICATION_RISK.

Question: if two verifiers agree because both implement the same flawed specification, what evidence is actually independent?
