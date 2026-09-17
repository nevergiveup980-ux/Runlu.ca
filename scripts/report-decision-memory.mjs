import fs from 'node:fs';

const rows = fs.readFileSync('RUNLU_DECISION_LOG.jsonl', 'utf8')
  .split(/\r?\n/)
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

const countBy = (items, key) => items.reduce((acc, row) => {
  const value = row[key] ?? '(none)';
  acc[value] = (acc[value] ?? 0) + 1;
  return acc;
}, {});

const editorial = rows.filter(row => row.type === 'editorial');
const incidents = rows.filter(row => row.type === 'incident');
const corrections = rows.filter(row => row.type === 'correction' || row.type === 'reassessment');
const openRevisit = rows.filter(row => row.revisit_if && !row.reassessment_of && row.status !== 'closed');

console.log('RUNLU Decision Memory — retrospective signal');
console.log(`Entries: ${rows.length}`);
console.log(`Date range: ${rows[0]?.date ?? 'n/a'} → ${rows.at(-1)?.date ?? 'n/a'}`);
console.log('Types:', countBy(rows, 'type'));
console.log('Editorial decisions:', countBy(editorial, 'decision'));
console.log(`Recorded incidents: ${incidents.length}`);
console.log(`Recorded corrections/reassessments: ${corrections.length}`);
console.log(`Open evidence-triggered revisits: ${openRevisit.length}`);

for (const row of openRevisit) {
  console.log(`- ${row.date} · ${row.subject ?? row.decision}: revisit if ${row.revisit_if}`);
}

console.log('\nInterpretation guard: these are descriptive counts, not a quality score.');
console.log('A higher publication count is not treated as improvement; holds, corrections, and silence remain valid outcomes.');
