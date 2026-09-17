import fs from 'node:fs';

const file = 'RUNLU_KNOWLEDGE_MAP.json';
const fail = (message) => { console.error(`KNOWLEDGE MAP FAIL: ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`KNOWLEDGE MAP OK: ${message}`);

if (!fs.existsSync(file)) {
  fail(`${file} is missing`);
  process.exit();
}

let map;
try { map = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (error) {
  fail(`invalid JSON: ${error.message}`);
  process.exit();
}

if (map.schema !== 'runlu.knowledge-map.v1') fail(`unexpected schema ${map.schema}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(map.updated || '')) fail('updated must be ISO YYYY-MM-DD');
if (!Array.isArray(map.topics) || !map.topics.length) fail('topics must be non-empty');
if (!Array.isArray(map.nodes) || !map.nodes.length) fail('nodes must be non-empty');
if (!Array.isArray(map.edges)) fail('edges must be an array');

const unique = (items, label) => {
  const seen = new Set();
  for (const item of items) {
    if (!item?.id) { fail(`${label} contains item without id`); continue; }
    if (seen.has(item.id)) fail(`duplicate ${label} id: ${item.id}`);
    seen.add(item.id);
  }
  return seen;
};

const topicIds = unique(map.topics || [], 'topic');
const nodeIds = unique(map.nodes || [], 'node');

for (const node of map.nodes || []) {
  if (!node.path || !fs.existsSync(node.path)) fail(`${node.id}: missing repository path ${node.path}`);
  if (!Array.isArray(node.topics) || !node.topics.length) fail(`${node.id}: must have at least one topic`);
  for (const topic of node.topics || []) if (!topicIds.has(topic)) fail(`${node.id}: unknown topic ${topic}`);
}

const edgeKeys = new Set();
for (const edge of map.edges || []) {
  if (!nodeIds.has(edge.from)) fail(`edge has unknown from node ${edge.from}`);
  if (!nodeIds.has(edge.to)) fail(`edge has unknown to node ${edge.to}`);
  if (!edge.relation) fail(`edge ${edge.from} -> ${edge.to} has no relation`);
  if (!edge.note) fail(`edge ${edge.from} -> ${edge.to} has no editorial note`);
  const key = `${edge.from}|${edge.to}|${edge.relation}`;
  if (edgeKeys.has(key)) fail(`duplicate edge ${key}`);
  edgeKeys.add(key);
}

if (!process.exitCode) ok(`${map.topics.length} topics, ${map.nodes.length} nodes, ${map.edges.length} editorial relationships validated`);
