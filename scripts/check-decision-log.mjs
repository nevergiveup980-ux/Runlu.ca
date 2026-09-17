import fs from 'node:fs';

const path = 'RUNLU_DECISION_LOG.jsonl';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/).filter(line => line.trim());
const fail = (m) => { throw new Error(m); };

if (!lines.length) fail('Decision log is empty.');

const allowedTypes = new Set(['system','editorial','incident','correction','reassessment','governance','qa','promotion','forum','research']);
let previousDate = '';
const seen = new Set();

lines.forEach((line, index) => {
  const n = index + 1;
  let row;
  try { row = JSON.parse(line); }
  catch (e) { fail(`Line ${n}: invalid JSON: ${e.message}`); }

  if (row.schema !== 'runlu.decision.v1') fail(`Line ${n}: unsupported schema ${row.schema ?? '(missing)'}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date ?? '')) fail(`Line ${n}: invalid or missing ISO date`);
  if (!allowedTypes.has(row.type)) fail(`Line ${n}: unsupported type ${row.type ?? '(missing)'}`);
  if (!row.decision && !row.subject) fail(`Line ${n}: needs decision or subject`);
  if (!row.reason && !row.finding) fail(`Line ${n}: needs reason or finding`);
  if (previousDate && row.date < previousDate) fail(`Line ${n}: date ${row.date} is older than previous entry ${previousDate}; append chronologically`);
  previousDate = row.date;

  const identity = JSON.stringify([row.date,row.type,row.decision ?? '',row.subject ?? '',row.result ?? '',row.status ?? '']);
  if (seen.has(identity)) fail(`Line ${n}: probable duplicate decision entry`);
  seen.add(identity);
});

console.log(`RUNLU decision memory passed: ${lines.length} valid chronological entries.`);
