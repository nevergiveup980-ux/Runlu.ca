/**
 * RUNLU KNOWLEDGE editorial quality report (read-only).
 * Usage: node knowledge/report-quality.mjs
 */
import { readFileSync } from "node:fs";
import { auditKnowledge } from "./validate-publication.mjs";

const drafts=JSON.parse(readFileSync(new URL("./data/records.json",import.meta.url),"utf8"));
const published=JSON.parse(readFileSync(new URL("./data/published.json",import.meta.url),"utf8"));
const audit=auditKnowledge(drafts,published);
const labels={
 "review-incomplete-facts_verified":"Fact verification",
 "review-incomplete-license_verified":"Rights approval",
 "review-incomplete-translations_verified":"Four-language approval",
 "missing-reviewer":"Named editorial reviewer",
 "invalid-reviewed-at":"Valid review date",
 "missing-review-evidence":"Review evidence reference",
 "missing-translation-reviewer":"Named language reviewer"
};
const explain=code=>{
 if(code.startsWith("source-rights-not-permitted-"))return "Source reproduction-rights decision";
 if(code.startsWith("factual-reference-assessment-missing-"))return "Factual-reference use assessment";
 if(code.startsWith("source-use-prohibited-"))return "Prohibited source use";
 if(code.startsWith("missing-source-rights-basis-"))return "Documented rights basis";
 if(code.startsWith("missing-source-rights-evidence-"))return "Rights evidence reference";
 return labels[code]??code;
};
const rows=audit.draftReadiness.map(r=>({
 id:r.id,
 status:r.readyForEditorialDecision?"Review-ready":"On hold",
 blockerCount:r.blockers.length,
 blockers:[...new Set(r.blockers.map(explain))]
}));
const priority = rows.find(r=>r.id==="RK-0005" && r.blockerCount>0) ?? rows.find(r=>r.blockerCount>0);
const nextStep = priority ? `Resolve ${priority.id} blockers (${priority.blockerCount}): ${priority.blockers.slice(0,3).join("; ")}. Do not auto-approve or publish.` : "No draft blockers reported. Confirm independent editorial decision before publication.";
const out=[
 "# RUNLU KNOWLEDGE — Editorial Quality Report",
 "",
 "Generated from repository records; does not constitute independent approval.",
 "",
 `Draft records: ${audit.drafts} | Published records: ${audit.published} | Publication dataset safe: ${audit.publicationSafe?"yes":"NO"}`,
 "",
 "| Record | State | Blockers |",
 "| --- | --- | ---: |",
 ...rows.map(r=>`| ${r.id} | ${r.status} | ${r.blockerCount} |`),
 "",
 ...rows.flatMap(r=>[`## ${r.id}`,"",...r.blockers.map(b=>"- "+b),""]),
 "## Next step",
 "",
 nextStep,
 ""
].join("\n");
process.stdout.write(out);
if(!audit.publicationSafe)process.exitCode=1;
