import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ACK_FILE = 'flooring/warehouse-receipt-ack-v098.js';
const DRAWER_FILE = 'flooring/orders-drawer-v066.js';
const REVIEW_FILE = 'flooring/people-to-call-review-v095.js';
const WROOT = '_lab_warehouse_ai';
const WINDEX = `${WROOT}/index.html`;
const WVERSION = `${WROOT}/version.json`;

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const ackSource = read(ACK_FILE);
const drawerSource = read(DRAWER_FILE);
const reviewSource = read(REVIEW_FILE);
const warehouseIndex = read(WINDEX);
const warehouseVersion = JSON.parse(read(WVERSION));
const cycles = Math.max(100, Number(process.env.RUNLU_RECEIPT_ACK_CYCLES || 1000));
const sha = source => crypto.createHash('sha256').update(source).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

const F = {
  JOB: 'runlu_deerfoot_flooring_jobs_v1',
  PO: 'runlu_deerfoot_supplier_orders_v1',
  CALL: 'runlu_people_to_call_v066',
  ACTIVE: 'runlu_deerfoot_flooring_active_job_v1',
  CACHE: 'runlu-flooring-warehouse-work-v090'
};
const W = {
  INVDB: 'runlu_inventory_records_v21',
  ODB: 'runlu_orders_v20',
  EVENTDB: 'runlu_event_history_v52',
  PMDB: 'runlu_product_master_v21',
  CARPETDB: 'runlu_carpet_inventory_v52',
  CUTDB: 'runlu_cutting_log_v52',
  RAMDB: 'runlu_remnants_v55'
};

function memoryStorage() {
  const map = new Map();
  const writes = [];
  let failKey = null;
  return {
    getItem(key) {
      key = String(key);
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      key = String(key);
      writes.push(key);
      if (failKey === key) {
        failKey = null;
        throw new Error('LAB injected storage failure: ' + key);
      }
      map.set(key, String(value));
    },
    removeItem(key) {
      key = String(key);
      writes.push(key);
      if (failKey === key) {
        failKey = null;
        throw new Error('LAB injected storage failure: ' + key);
      }
      map.delete(key);
    },
    seed(key, value) {
      map.set(String(key), typeof value === 'string' ? value : JSON.stringify(value));
    },
    raw(key) {
      return map.get(String(key)) ?? null;
    },
    json(key) {
      return JSON.parse(map.get(String(key)) || 'null');
    },
    failNext(key) {
      failKey = String(key);
    },
    clearWrites() {
      writes.length = 0;
    },
    writes() {
      return writes.slice();
    },
    reset() {
      map.clear();
      writes.length = 0;
      failKey = null;
    },
    snapshot() {
      return Object.fromEntries([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    }
  };
}

function quietConsole() {
  return { log() {}, info() {}, warn() {}, error() {}, debug() {} };
}

function blockedNetwork(counter, name) {
  return function blocked() {
    counter.count += 1;
    throw new Error('LAB blocked network API: ' + name);
  };
}

function miniElement() {
  return {
    style: {}, dataset: {}, value: '', textContent: '', innerHTML: '',
    classList: { contains() { return false; }, toggle() {}, add() {}, remove() {} },
    appendChild() {}, prepend() {}, remove() {}, addEventListener() {}, setAttribute() {},
    getAttribute() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }
  };
}

function bootFlooring() {
  const localStorage = memoryStorage();
  const notes = new Map();
  const network = { count: 0 };
  const document = {
    readyState: 'loading',
    visibilityState: 'visible',
    documentElement: { dataset: {} },
    head: { appendChild() {} },
    body: { appendChild() {}, prepend() {} },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll(selector) {
      if (selector === '[data-r95-note]') {
        return [...notes].map(([id, value]) => ({ dataset: { r95Note: id }, value, style: {} }));
      }
      return [];
    },
    createElement() { return miniElement(); },
    addEventListener() {}
  };
  class MutationObserver { observe() {} disconnect() {} }
  const window = {
    document, localStorage, console: quietConsole(), MutationObserver,
    addEventListener() {}, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}
  };
  window.window = window;
  const box = {
    window, document, localStorage, console: window.console, MutationObserver,
    Intl, Date, JSON, Math, Number, String, Array, Object, Boolean, RegExp, Error, TypeError, Promise, Map, Set, URL, URLSearchParams,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout, setInterval: window.setInterval, clearInterval: window.clearInterval,
    fetch: blockedNetwork(network, 'fetch'),
    XMLHttpRequest: class { constructor() { network.count += 1; throw new Error('LAB blocked XMLHttpRequest'); } },
    WebSocket: class { constructor() { network.count += 1; throw new Error('LAB blocked WebSocket'); } },
    EventSource: class { constructor() { network.count += 1; throw new Error('LAB blocked EventSource'); } }
  };
  vm.createContext(box, { name: 'RUNLU Flooring Verified Receipt LAB V0.8' });
  vm.runInContext(drawerSource, box, { filename: DRAWER_FILE, timeout: 1500 });
  const drawer = window.RUNLUOrdersDrawerV066;
  must(drawer && typeof drawer.syncPeopleToCall === 'function', 'Orders Drawer authority missing');
  window.RUNLUOrdersDrawerV066 = { syncPeopleToCall: drawer.syncPeopleToCall, refresh() {} };
  vm.runInContext(reviewSource, box, { filename: REVIEW_FILE, timeout: 1500 });
  vm.runInContext(ackSource, box, { filename: ACK_FILE, timeout: 1500 });
  const ack = window.RUNLUWarehouseReceiptAckV098;
  const review = window.RUNLUPeopleToCallReviewV095;
  must(ack && typeof ack.acknowledgePO === 'function', 'receipt acknowledgement candidate missing');
  must(review && typeof review.route === 'function', 'Sales Review authority missing');
  return { localStorage, notes, ack, review, network: () => network.count };
}

function extractFunction(name) {
  const needle = `function ${name}`;
  const start = warehouseIndex.indexOf(needle);
  if (start < 0) throw new Error('Warehouse function missing: ' + name);
  const open = warehouseIndex.indexOf('(', start);
  let parenDepth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let close = -1;
  for (let i = open; i < warehouseIndex.length; i += 1) {
    const c = warehouseIndex[i];
    const n = warehouseIndex[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i += 1; continue; }
    if (c === '/' && n === '*') { blockComment = true; i += 1; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '(') parenDepth += 1;
    if (c === ')' && --parenDepth === 0) { close = i; break; }
  }
  const brace = warehouseIndex.indexOf('{', close + 1);
  let depth = 0;
  quote = '';
  escaped = false;
  lineComment = false;
  blockComment = false;
  for (let i = brace; i < warehouseIndex.length; i += 1) {
    const c = warehouseIndex[i];
    const n = warehouseIndex[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i += 1; continue; }
    if (c === '/' && n === '*') { blockComment = true; i += 1; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    if (c === '}' && --depth === 0) return warehouseIndex.slice(start, i + 1);
  }
  throw new Error('Unclosed Warehouse function: ' + name);
}

const warehouseFunctionNames = [
  'load', 'save', 'normalizeText', 'normKey', 'loadMasters', 'loadInventoryRecords',
  'inventoryRecordIdentity', 'findInventoryRecordByIdentity', 'ensureOperationProductLink',
  'operationStockQuantity', 'operationStockUnit', 'carpetTransferParts', 'validateOperationForImpact',
  'applyInventoryDelta', 'applyInventoryTransfer', 'updateLinkedOrder', 'applySingleOperationImpact'
];
const warehouseExactSource = warehouseFunctionNames.map(extractFunction).join('\n\n');

function bootWarehouse() {
  const localStorage = memoryStorage();
  const network = { count: 0 };
  const alerts = [];
  const document = { documentElement: { setAttribute() {} }, getElementById() { return null; } };
  const box = {
    console: quietConsole(), localStorage, document,
    Date, JSON, Math, Number, String, Array, Object, Boolean, RegExp, Error, TypeError, Promise, Map, Set,
    ...W,
    alert(message) { alerts.push(String(message)); },
    queueCloudSave() {}, isQuotaError() { return false; }, pruneLocalApplicationCache() { return {}; }, aggressiveSafeStorageCleanup() { return {}; },
    renderBackupStatus() {}, underlaymentSpec() { return null; }, normalizeInventoryLifecycleRecord(record) { return record; },
    finalizeCustomerOrderInventory() { return { records: 0, quantity: 0 }; },
    fetch: blockedNetwork(network, 'fetch'),
    XMLHttpRequest: class { constructor() { network.count += 1; throw new Error('LAB blocked XMLHttpRequest'); } },
    WebSocket: class { constructor() { network.count += 1; throw new Error('LAB blocked WebSocket'); } }
  };
  box.window = box;
  box.window.addEventListener = () => {};
  vm.createContext(box, { name: 'RUNLU Warehouse Receipt Proof V0.8' });
  vm.runInContext(warehouseExactSource, box, { filename: 'warehouse-index-exact-functions', timeout: 2000 });
  return { localStorage, box, alerts, network: () => network.count };
}

function seedWarehouse(env) {
  env.localStorage.seed(W.PMDB, [
    { id: 'P1', name: 'LAB TILE', color: 'GREY' },
    { id: 'P2', name: 'LAB ADHESIVE', color: 'WHITE' }
  ]);
  env.localStorage.seed(W.INVDB, [
    { id: 'INV1', inventoryId: 'INV1', masterId: 'P1', location: 'A1', quantity: 0, unit: 'Box', inventoryType: 'GENERAL', lifecycleStatus: 'ACTIVE', warehouseScope: 'warehouse' },
    { id: 'INV2', inventoryId: 'INV2', masterId: 'P2', location: 'A2', quantity: 0, unit: 'Pail', inventoryType: 'GENERAL', lifecycleStatus: 'ACTIVE', warehouseScope: 'warehouse' }
  ]);
  env.localStorage.seed(W.ODB, []);
  env.localStorage.seed(W.EVENTDB, []);
  env.localStorage.seed(W.CARPETDB, []);
  env.localStorage.seed(W.CUTDB, []);
  env.localStorage.seed(W.RAMDB, []);
  env.localStorage.clearWrites();
}

function warehouseReceive(env, args) {
  const record = {
    id: args.id,
    status: 'Completed',
    type: 'Supplier Pickup / Receiving / Put-away',
    inventoryMode: 'Stock',
    productId: args.productId,
    inventoryRecordId: args.inventoryRecordId,
    product: args.product,
    quantity: args.quantity,
    unit: args.unit,
    location: args.location,
    po: String(args.po),
    date: '2026-09-15',
    customer: '',
    supplier: 'LAB SUPPLIER'
  };
  const ok = env.box.applySingleOperationImpact(record);
  must(ok === true, 'Warehouse receipt rejected: ' + (env.alerts.at(-1) || 'unknown'));
  must(record.impactApplied === true, 'Warehouse receipt did not set impactApplied');
  return record;
}

function makeTask(poNumber, quantity = 10, extra = {}) {
  return {
    id: 'TASK-' + poNumber,
    po_number: Number(poNumber),
    status: 'Ready',
    fulfillment_method: 'Pickup',
    items: [{ style: 'LAB TILE', colour: 'GREY', qty: quantity, unit: 'box' }],
    received_items: [{ style: 'LAB TILE', colour: 'GREY', ordered_qty: String(quantity), received_qty: String(quantity), condition: 'OK' }],
    ...extra
  };
}

function certify(task, operations) {
  const ordered = task.items || [];
  const received = task.received_items || [];
  must(ordered.length > 0 && received.length === ordered.length, 'certificate task lines invalid');
  must(operations.length === ordered.length, 'certificate operation count mismatch');
  const verifiedItems = ordered.map((item, index) => {
    const operation = operations[index];
    const orderedQty = Number(item.qty);
    const receivedQty = Number(received[index].received_qty);
    must(operation?.impactApplied === true && operation.status === 'Completed', 'operation is not inventory-applied');
    must(operation.type === 'Supplier Pickup / Receiving / Put-away', 'wrong Warehouse operation type');
    must(String(operation.po).replace(/\D/g, '') === String(task.po_number).replace(/\D/g, ''), 'operation PO mismatch');
    must(Number(operation.quantity) === orderedQty && receivedQty === orderedQty, 'operation quantity mismatch');
    must(String(operation.unit || '').toLowerCase() === String(item.unit || '').toLowerCase(), 'operation unit mismatch');
    return { ordered_qty: orderedQty, received_qty: receivedQty, operation_id: String(operation.id) };
  });
  return {
    ...clone(task),
    inventory_verified: true,
    inventory_verified_po_number: String(task.po_number),
    inventory_verified_at: '2026-09-15T22:30:00.000Z',
    inventory_operation_ids: operations.map(operation => String(operation.id)),
    inventory_verified_items: verifiedItems
  };
}

function seedFlooring(env, { jobs, pos, tasks }) {
  env.localStorage.reset();
  env.notes.clear();
  env.localStorage.seed(F.JOB, jobs);
  env.localStorage.seed(F.PO, pos);
  env.localStorage.seed(F.CALL, []);
  env.localStorage.seed(F.CACHE, { tasks, events: [], lastSync: 'LAB' });
  env.localStorage.clearWrites();
}

function makeJob(id, number) {
  return { id, jobNumber: String(number), customerName: 'Synthetic Customer', status: 'In Progress', peopleToCallHistory: [] };
}

function makePO(id, jobId, jobNumber, poNumber, quantity = 10, extra = {}) {
  return {
    id, jobId, jobNumber: String(jobNumber), poNumber: String(poNumber), customerName: 'Synthetic Customer',
    status: 'Submitted', supplier: 'LAB SUPPLIER', fulfillment: 'Pickup',
    items: [{ style: 'LAB TILE', colour: 'GREY', qty: quantity, unit: 'BOX' }],
    ...extra
  };
}

function certifiedTask(poNumber, quantity = 10, extra = {}) {
  const base = makeTask(poNumber, quantity, extra);
  return {
    ...base,
    inventory_verified: true,
    inventory_verified_po_number: String(poNumber),
    inventory_verified_at: 'LAB',
    inventory_operation_ids: ['OP-' + poNumber],
    inventory_verified_items: [{ ordered_qty: quantity, received_qty: quantity }]
  };
}

function check(name, fn) {
  try {
    return { name, pass: true, ...(fn() || {}) };
  } catch (error) {
    return { name, pass: false, error: error?.message || String(error) };
  }
}

const tests = [];

tests.push(check('Candidate exposes fail-closed safety contract', () => {
  const env = bootFlooring();
  must(env.ack.version === '0.9.8', 'candidate version mismatch');
  must(env.ack.requiresInventoryCertificate, 'inventory certificate flag missing');
  must(env.ack.requiresFullReceipt, 'full receipt flag missing');
  must(env.ack.duplicateEvidenceFailsClosed, 'duplicate evidence flag missing');
  must(env.ack.atomicPOAndPeopleToCall, 'atomic PO/queue flag missing');
  must(env.ack.productionAutoInstall === false, 'candidate unexpectedly auto-installs');
  return { version: env.ack.version };
}));

tests.push(check('Exact Warehouse receipt creates inventory proof for one PO acknowledgement', () => {
  const warehouse = bootWarehouse();
  seedWarehouse(warehouse);
  const operation = warehouseReceive(warehouse, { id: 8001, po: 181700, productId: 'P1', inventoryRecordId: 'INV1', product: 'LAB TILE', quantity: 10, unit: 'Box', location: 'A1' });
  must(warehouse.localStorage.json(W.INVDB).find(row => row.id === 'INV1').quantity === 10, 'Warehouse stock not posted');
  const task = certify(makeTask(181700), [operation]);
  const flooring = bootFlooring();
  seedFlooring(flooring, { jobs: [makeJob('J1', 181700)], pos: [makePO('PO1', 'J1', 181700, 181700)], tasks: [task] });
  const result = flooring.ack.acknowledgePO(181700);
  must(result.ok && result.changed && result.code === 'ACKNOWLEDGED', 'receipt acknowledgement failed');
  must(flooring.localStorage.json(F.PO)[0].status === 'Received', 'Flooring PO not Received');
  const queue = flooring.localStorage.json(F.CALL)[0];
  must(queue?.status === 'Not Called' && queue.sourcePOs.includes('181700'), 'People TO Call not created');
  must(warehouse.network() === 0 && flooring.network() === 0, 'network attempted');
  return { warehouseQty: 10, poStatus: 'Received', peopleToCall: queue.status };
}));

const blockedCases = [
  ['Missing inventory certificate is blocked', task => task, 'INVENTORY_NOT_VERIFIED', false],
  ['Partial received quantity is blocked', task => { task.received_items[0].received_qty = '9'; return task; }, 'NOT_FULL_RECEIPT', true],
  ['Over received quantity is blocked', task => { task.received_items[0].received_qty = '11'; return task; }, 'NOT_FULL_RECEIPT', true],
  ['Blank received quantity is blocked', task => { task.received_items[0].received_qty = ''; return task; }, 'INVALID_QUANTITY', true],
  ['Non-final Warehouse task is blocked', task => { task.status = 'In Progress'; return task; }, 'TASK_NOT_RECEIVED', true],
  ['Certificate PO mismatch is blocked', task => { task.inventory_verified_po_number = '999999'; return task; }, 'CERT_PO_MISMATCH', true],
  ['Certificate quantity mismatch is blocked', task => { task.inventory_verified_items[0].received_qty = 9; return task; }, 'CERT_QUANTITY_MISMATCH', true]
];
for (const [name, mutate, expectedCode, certified] of blockedCases) {
  tests.push(check(name, () => {
    const env = bootFlooring();
    let task = certified ? certifiedTask(181701) : makeTask(181701);
    task = mutate(task);
    seedFlooring(env, { jobs: [makeJob('J1', 181701)], pos: [makePO('PO1', 'J1', 181701, 181701)], tasks: [task] });
    const before = JSON.stringify(env.localStorage.snapshot());
    const result = env.ack.acknowledgePO(181701);
    must(!result.ok && result.code === expectedCode, `expected ${expectedCode}, got ${result.code}`);
    must(JSON.stringify(env.localStorage.snapshot()) === before, 'blocked evidence mutated state');
    return { blocked: expectedCode };
  }));
}

tests.push(check('Duplicate Warehouse task rows fail closed', () => {
  const env = bootFlooring();
  const task = certifiedTask(181702);
  seedFlooring(env, { jobs: [makeJob('J1', 181702)], pos: [makePO('PO1', 'J1', 181702, 181702)], tasks: [task, { ...task, id: 'TASK-DUP' }] });
  const before = JSON.stringify(env.localStorage.snapshot());
  const result = env.ack.acknowledgePO(181702);
  must(!result.ok && result.code === 'DUPLICATE_WAREHOUSE_TASK', 'duplicate task accepted');
  must(JSON.stringify(env.localStorage.snapshot()) === before, 'duplicate task mutated state');
  return { safeReject: true };
}));

tests.push(check('Duplicate local PO rows fail closed', () => {
  const env = bootFlooring();
  const po = makePO('PO1', 'J1', 181703, 181703);
  seedFlooring(env, { jobs: [makeJob('J1', 181703)], pos: [po, { ...po, id: 'PO2' }], tasks: [certifiedTask(181703)] });
  const before = JSON.stringify(env.localStorage.snapshot());
  const result = env.ack.acknowledgePO(181703);
  must(!result.ok && result.code === 'DUPLICATE_LOCAL_PO', 'duplicate local PO accepted');
  must(JSON.stringify(env.localStorage.snapshot()) === before, 'duplicate local PO mutated state');
  return { safeReject: true };
}));

tests.push(check('Acknowledgement is durable-idempotent on refresh/retry', () => {
  const env = bootFlooring();
  seedFlooring(env, { jobs: [makeJob('J1', 181705)], pos: [makePO('PO1', 'J1', 181705, 181705)], tasks: [certifiedTask(181705)] });
  must(env.ack.acknowledgePO(181705).changed, 'first acknowledgement did not change state');
  const before = env.localStorage.raw(F.PO);
  const historyCount = env.localStorage.json(F.PO)[0].warehouseReceiptHistory.length;
  env.localStorage.clearWrites();
  const retry = env.ack.acknowledgePO(181705);
  must(retry.ok && !retry.changed && retry.code === 'ALREADY_ACKNOWLEDGED', 'retry is not idempotent');
  must(env.localStorage.raw(F.PO) === before, 'retry mutated PO bytes');
  must(env.localStorage.json(F.PO)[0].warehouseReceiptHistory.length === historyCount, 'retry duplicated audit');
  must(env.localStorage.writes().length === 0, 'retry wrote storage');
  return { historyCount };
}));

tests.push(check('PO write failure restores exact pre-ack state', () => {
  const env = bootFlooring();
  seedFlooring(env, { jobs: [makeJob('J1', 181706)], pos: [makePO('PO1', 'J1', 181706, 181706)], tasks: [certifiedTask(181706)] });
  const before = JSON.stringify(env.localStorage.snapshot());
  env.localStorage.failNext(F.PO);
  const result = env.ack.acknowledgePO(181706);
  must(!result.ok && result.code === 'PO_WRITE_FAILED', 'PO failure reported success');
  must(JSON.stringify(env.localStorage.snapshot()) === before, 'PO failure rollback mismatch');
  return { safeRollback: true };
}));

tests.push(check('People TO Call write failure restores PO and queue', () => {
  const env = bootFlooring();
  seedFlooring(env, { jobs: [makeJob('J1', 181707)], pos: [makePO('PO1', 'J1', 181707, 181707)], tasks: [certifiedTask(181707)] });
  const before = JSON.stringify(env.localStorage.snapshot());
  env.localStorage.failNext(F.CALL);
  const result = env.ack.acknowledgePO(181707);
  must(!result.ok && result.code === 'PEOPLE_TO_CALL_COMMIT_FAILED', 'queue failure reported success');
  must(JSON.stringify(env.localStorage.snapshot()) === before, 'cross-store rollback mismatch');
  return { rollback: result.rollback };
}));

tests.push(check('Supplier Delivery is safely held until People TO Call authority supports it', () => {
  const env = bootFlooring();
  const po = makePO('PO1', 'J1', 181708, 181708, 10, { fulfillment: 'Supplier Delivery' });
  const task = certifiedTask(181708, 10, { fulfillment_method: 'Supplier Delivery' });
  seedFlooring(env, { jobs: [makeJob('J1', 181708)], pos: [po], tasks: [task] });
  const before = JSON.stringify(env.localStorage.snapshot());
  const result = env.ack.acknowledgePO(181708);
  must(!result.ok && result.code === 'PEOPLE_TO_CALL_COMMIT_FAILED', 'Supplier Delivery bypassed queue authority');
  must(JSON.stringify(env.localStorage.snapshot()) === before, 'Supplier Delivery hold mutated state');
  return { held: true };
}));

tests.push(check('Two-PO Job closes Warehouse → People TO Call → Pick Up → People TO Call → Active loop', () => {
  const warehouse = bootWarehouse();
  seedWarehouse(warehouse);
  const op1 = warehouseReceive(warehouse, { id: 9001, po: 181710, productId: 'P1', inventoryRecordId: 'INV1', product: 'LAB TILE', quantity: 10, unit: 'Box', location: 'A1' });
  const op2 = warehouseReceive(warehouse, { id: 9002, po: 181711, productId: 'P2', inventoryRecordId: 'INV2', product: 'LAB ADHESIVE', quantity: 2, unit: 'Pail', location: 'A2' });
  const task1 = certify(makeTask(181710), [op1]);
  const task2Base = makeTask(181711, 2, {
    items: [{ style: 'LAB ADHESIVE', colour: 'WHITE', qty: 2, unit: 'pail' }],
    received_items: [{ style: 'LAB ADHESIVE', colour: 'WHITE', ordered_qty: '2', received_qty: '2', condition: 'OK' }]
  });
  const task2 = certify(task2Base, [op2]);
  const flooring = bootFlooring();
  const job = makeJob('JLOOP', 181799);
  const po1 = makePO('P1', 'JLOOP', 181799, 181710);
  const po2 = makePO('P2', 'JLOOP', 181799, 181711, 2, { items: [{ style: 'LAB ADHESIVE', colour: 'WHITE', qty: 2, unit: 'PAIL' }] });
  seedFlooring(flooring, { jobs: [job], pos: [po1, po2], tasks: [task1, task2] });

  must(flooring.ack.acknowledgePO(181710).ok, 'first PO acknowledgement failed');
  let queue = flooring.localStorage.json(F.CALL)[0];
  flooring.notes.set(queue.id, 'Second PO still pending');
  must(flooring.review.route(queue.id, 'JLOOP', 'pickup') === true, 'Sales pickup route failed');
  must(flooring.localStorage.json(F.PO).find(row => row.id === 'P1').status === 'Received', 'first PO lost Received status');
  must(flooring.localStorage.json(F.PO).find(row => row.id === 'P2').status === 'Submitted', 'second PO moved early');

  must(flooring.ack.acknowledgePO(181711).ok, 'second PO acknowledgement failed');
  queue = flooring.localStorage.json(F.CALL)[0];
  must(queue.status === 'Not Called' && queue.sourcePOs.length === 2, 'People TO Call did not reopen with both POs');
  flooring.notes.set(queue.id, 'All material verified received');
  must(flooring.review.route(queue.id, 'JLOOP', 'active') === true, 'Sales Active route failed');
  const finalJob = flooring.localStorage.json(F.JOB)[0];
  must(finalJob.salesMaterialRoute === 'active' && finalJob.orderDrawerOverride === 'active', 'Job did not become Active');
  must(flooring.localStorage.json(F.PO).every(row => row.status === 'Received'), 'Sales Review mutated PO status');
  must(warehouse.network() === 0 && flooring.network() === 0, 'network attempted');
  return { finalRoute: finalJob.salesMaterialRoute, sourcePOs: queue.sourcePOs };
}));

function stress(count) {
  let completed = 0;
  let failure = null;
  for (let i = 0; i < count; i += 1) {
    try {
      const env = bootFlooring();
      const jobNumber = 300000 + i;
      const jobId = 'J' + i;
      const po1 = 400000 + i * 2;
      const po2 = po1 + 1;
      seedFlooring(env, {
        jobs: [makeJob(jobId, jobNumber)],
        pos: [makePO('A' + i, jobId, jobNumber, po1, 5), makePO('B' + i, jobId, jobNumber, po2, 7)],
        tasks: [certifiedTask(po1, 5), certifiedTask(po2, 7)]
      });
      must(env.ack.acknowledgePO(po1).ok, 'first acknowledgement');
      let queue = env.localStorage.json(F.CALL)[0];
      env.notes.set(queue.id, 'pending');
      must(env.review.route(queue.id, jobId, 'pickup') === true, 'pickup route');
      must(env.ack.acknowledgePO(po2).ok, 'second acknowledgement');
      queue = env.localStorage.json(F.CALL)[0];
      must(queue.status === 'Not Called' && queue.sourcePOs.length === 2, 'queue reopen');
      env.notes.set(queue.id, 'complete');
      must(env.review.route(queue.id, jobId, 'active') === true, 'active route');
      must(env.localStorage.json(F.PO).every(row => row.status === 'Received'), 'PO status mutated');
      must(env.localStorage.json(F.JOB)[0].salesMaterialRoute === 'active', 'Job route mismatch');
      must(env.network() === 0, 'network attempted');
      completed += 1;
    } catch (error) {
      failure = { cycle: i, error: error?.message || String(error) };
      break;
    }
  }
  return { pass: !failure, cyclesRequested: count, cyclesCompleted: completed, failure };
}

const stressResult = stress(cycles);
const pass = tests.every(test => test.pass) && stressResult.pass;
const report = {
  gate: 'RUNLU Flooring ↔ Warehouse Verified Receipt Ack LAB V0.8',
  pass,
  generatedAt: new Date().toISOString(),
  candidate: { file: ACK_FILE, version: '0.9.8', sha256: sha(ackSource), productionAutoInstall: false },
  warehouse: {
    runtime: `${warehouseVersion.version} Build${warehouseVersion.build}`,
    indexSha256: sha(warehouseIndex),
    exactFunctionsSha256: sha(warehouseExactSource),
    functions: warehouseFunctionNames
  },
  authorities: {
    ordersDrawer: { file: DRAWER_FILE, sha256: sha(drawerSource) },
    salesReview: { file: REVIEW_FILE, sha256: sha(reviewSource) }
  },
  scenarios: { passed: tests.filter(test => test.pass).length, total: tests.length, tests },
  stress: stressResult,
  isolation: { productionSupabaseAccess: false, hostLocalStorageAccess: false, networkApisBlocked: true, storage: 'ephemeral in-memory Map' },
  contract: [
    'A Flooring PO may auto-ack Received only from one exact shared Warehouse task.',
    'Task must be Ready/Completed with every received quantity exactly equal to ordered quantity.',
    'Task must carry a second inventory-verification certificate tied to the same PO and one or more applied Warehouse operation IDs.',
    'PO Received and People TO Call routing commit together or both stores restore.',
    'Sales Review remains unable to mutate Received PO status.',
    'This LAB verifies the certificate consumer contract; it does not publish the certificate to production Supabase or load V098 in production.'
  ],
  knownHold: ['Current V066 People TO Call authority only queues Pickup fulfillment; Supplier Delivery acknowledgement fails closed until that authority is generalized.']
};

fs.writeFileSync('flooring-warehouse-receipt-ack-v080-report.json', JSON.stringify(report, null, 2));
for (const test of tests) console.log(`${test.pass ? 'PASS' : 'FAIL'} · ${test.name}${test.error ? ' · ' + test.error : ''}`);
console.log(`${stressResult.pass ? 'PASS' : 'FAIL'} · verified-receipt two-PO stress · ${stressResult.cyclesCompleted}/${stressResult.cyclesRequested}`);
console.log(`Warehouse runtime · ${report.warehouse.runtime}`);
console.log('Isolation · VM memory only · network blocked · production Supabase/localStorage: NONE');
console.log(`VERIFIED RECEIPT ACK V0.8: ${pass ? 'PASS' : 'FAIL'}`);
if (!pass) process.exit(1);
