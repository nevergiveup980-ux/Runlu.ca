import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const unique = values => [...new Set(values)];

const catalog = read('view-catalog.js');
const health = read('health.html');
const decisions = read('RUNLU_DECISION_LOG.jsonl')
  .split(/\r?\n/)
  .filter(line => line.trim())
  .map(line => JSON.parse(line));
const map = JSON.parse(read('RUNLU_KNOWLEDGE_MAP.json'));

const viewNumbers = [...catalog.matchAll(/\bn:'(\d{3})'/g)].map(match => match[1]);
const healthNumbers = unique([...health.matchAll(/data-en="View (\d{3})(?:\s|·|")/g)].map(match => match[1]));
const latestView = viewNumbers.at(-1) ?? 'n/a';
const latestHealth = healthNumbers.at(-1) ?? 'n/a';
const mappedView = map.nodes.filter(node => node.stream === 'VIEW').length;
const mappedHealth = map.nodes.filter(node => node.stream === 'HEALTH_VIEW').length;
const openRevisits = decisions.filter(row => row.revisit_if && !row.reassessment_of && row.status !== 'closed');
const incidents = decisions.filter(row => row.type === 'incident').length;
const corrections = decisions.filter(row => row.type === 'correction' || row.type === 'reassessment').length;

console.log('RUNLU Operational State Snapshot');
console.log('--------------------------------');
console.log(`VIEW: ${viewNumbers.length} catalog entries · latest ${latestView}`);
console.log(`HEALTH VIEW: ${healthNumbers.length} landing entries · latest ${latestHealth}`);
console.log(`Decision memory: ${decisions.length} entries · ${incidents} incidents · ${corrections} corrections/reassessments`);
console.log(`Open evidence-triggered revisits: ${openRevisits.length}`);
console.log(`Knowledge map: ${map.topics.length} topics · ${map.nodes.length} nodes · ${map.edges.length} relationships`);
console.log(`Knowledge-map coverage: VIEW ${mappedView}/${viewNumbers.length} · HEALTH VIEW ${mappedHealth}/${healthNumbers.length}`);

if (openRevisits.length) {
  console.log('\nOpen revisit conditions:');
  for (const row of openRevisits) console.log(`- ${row.subject ?? row.decision}: ${row.revisit_if}`);
}

console.log('\nInterpretation guard: this snapshot describes current organizational state; it is not a performance score.');
console.log('Knowledge-map coverage is intentionally allowed to stay partial until relationships are editorially useful.');
