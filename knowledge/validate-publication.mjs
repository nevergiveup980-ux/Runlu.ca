/**
 * RUNLU KNOWLEDGE publication gate.
 * Read-only validation: never promotes drafts or modifies source files.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LANGUAGES = ["en", "zh", "fr", "es"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const nonblank = x => typeof x === "string" && x.trim().length > 0;
const validDate = x => DATE.test(x ?? "") && !Number.isNaN(Date.parse(x + "T00:00:00Z")) &&
  new Date(x + "T00:00:00Z").toISOString().slice(0,10) === x;
const httpsUrl = x => { try { return new URL(x).protocol === "https:"; } catch { return false; } };

export function inspectRecord(r, { forPublication = false } = {}) {
  const problems = [];
  if (!r || typeof r !== "object" || Array.isArray(r)) return ["invalid-record"];
  if (!nonblank(r.id)) problems.push("missing-id");
  if (!nonblank(r.category)) problems.push("missing-category");
  if (!r.scope || !["global", "regional", "national", "local"].includes(r.scope.type)) problems.push("invalid-scope");
  if (!Number.isInteger(r.version) || r.version < 1) problems.push("invalid-version");
  for (const lang of LANGUAGES) {
    if (!nonblank(r.titles?.[lang])) problems.push("missing-title-" + lang);
    if (!nonblank(r.summaries?.[lang])) problems.push("missing-summary-" + lang);
  }
  if (!Array.isArray(r.sources) || r.sources.length === 0) problems.push("missing-sources");
  else r.sources.forEach((s,i) => {
    if (!httpsUrl(s?.url)) problems.push("invalid-source-url-" + i);
    if (!nonblank(s?.publisher)) problems.push("missing-source-publisher-" + i);
    if (!["unknown", "permitted", "restricted", "prohibited"].includes(s?.license_status)) problems.push("invalid-source-rights-" + i);
    if (!validDate(s?.checked_at)) problems.push("invalid-source-date-" + i);
    if (forPublication && s?.use_type === "factual_reference") {
      if (!nonblank(s?.rights_basis) || !nonblank(s?.rights_evidence)) problems.push("factual-reference-assessment-missing-" + i);
      if (s?.license_status === "prohibited" || s?.license_status === "restricted") problems.push("source-use-requires-review-" + i);
    } else if (forPublication && s?.license_status !== "permitted") problems.push("source-rights-not-permitted-" + i);
    if (forPublication && !nonblank(s?.rights_basis)) problems.push("missing-source-rights-basis-" + i);
    if (forPublication && !nonblank(s?.rights_evidence)) problems.push("missing-source-rights-evidence-" + i);
  });
  if (forPublication) {
    if (r.status !== "published") problems.push("not-published");
    for (const key of ["facts_verified", "license_verified", "translations_verified"]) {
      if (r.review?.[key] !== true) problems.push("review-incomplete-" + key);
    }
    if (!nonblank(r.review?.reviewer)) problems.push("missing-reviewer");
    if (!validDate(r.review?.reviewed_at)) problems.push("invalid-reviewed-at");
    if (!nonblank(r.review?.evidence_ref)) problems.push("missing-review-evidence");
    if (!nonblank(r.review?.translation_reviewer)) problems.push("missing-translation-reviewer");
  }
  return problems;
}

export function auditKnowledge(drafts, published) {
  if (!Array.isArray(drafts) || !published || !Array.isArray(published.entries)) {
    throw new TypeError("expected draft array and published dataset with entries");
  }
  const seen = new Set(), findings = [], draftReadiness = [];
  for (const [source, entries] of [["draft", drafts], ["published", published.entries]]) {
    for (const record of entries) {
      const id = record?.id ?? "(missing)";
      const key = source + ":" + id;
      if (seen.has(key)) findings.push({id,source,problems:["duplicate-id"]});
      seen.add(key);
      const problems = inspectRecord(record,{forPublication:source==="published"});
      if (source === "published" && drafts.some(d=>d?.id===id && d?.version===record?.version)) problems.push("published-version-still-in-drafts");
      if (source === "draft") {
        // Preview publication blockers without modifying the draft or declaring it published.
        const candidate = {...record, status:"published"};
        const blockers = inspectRecord(candidate,{forPublication:true});
        draftReadiness.push({id,readyForEditorialDecision:blockers.length===0,blockers});
      }
      if (problems.length) findings.push({id,source,problems});
    }
  }
  return {
    drafts: drafts.length,
    published: published.entries.length,
    findings,
    draftReadiness,
    publicationSafe: findings.every(f => f.source !== "published"),
    draftIssues: findings.filter(f=>f.source==="draft").length
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const drafts = JSON.parse(readFileSync(new URL("./data/records.json",import.meta.url),"utf8"));
  const published = JSON.parse(readFileSync(new URL("./data/published.json",import.meta.url),"utf8"));
  const result = auditKnowledge(drafts,published);
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  if (!result.publicationSafe) process.exitCode = 1;
}
