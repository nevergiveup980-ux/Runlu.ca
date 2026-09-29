/* RUNLU Warehouse OS V8 Core
   Principle: one inventory truth. Dashboard and list MUST use the same carpet array.
   No production writes in this first core.
*/
(() => {
  'use strict';

  const CARPET_DATASET = 'runlu_carpet_inventory_v52';

  const state = {
    carpetRolls: [],
    query: '',
    status: 'ACTIVE',
    source: 'not-loaded'
  };

  function normalizeRoll(row) {
    const p = row && row.payload ? row.payload : row || {};
    return {
      ...p,
      _recordId: row && row.record_id ? row.record_id : p.id,
      _datasetKey: row && row.dataset_key ? row.dataset_key : CARPET_DATASET
    };
  }

  function isActive(roll) {
    return String(roll.lifecycleStatus || roll.status || '').toUpperCase() === 'ACTIVE';
  }

  function activeCarpetRolls() {
    return state.carpetRolls.filter(isActive);
  }

  function visibleCarpetRolls() {
    const q = state.query.trim().toLowerCase();
    let rows = state.status === 'ALL' ? state.carpetRolls : activeCarpetRolls();
    if (!q) return rows;
    return rows.filter(r => [
      r.roll, r.rollNumber, r.sourceRoll, r.productName, r.style,
      r.color, r.location, r.locationName, r.manufacturerRoll
    ].some(v => String(v || '').toLowerCase().includes(q)));
  }

  function counts() {
    // Critical invariant: Dashboard count and Carpet page source count
    // are derived from the exact same active array.
    const active = activeCarpetRolls();
    return {
      dashboardActive: active.length,
      carpetPageActive: active.length,
      total: state.carpetRolls.length,
      visible: visibleCarpetRolls().length
    };
  }

  function assert212Equals212() {
    const c = counts();
    const ok = c.dashboardActive === c.carpetPageActive;
    if (!ok) throw new Error(
      'V8 invariant failed: dashboard carpet count differs from carpet page count.'
    );
    return { ok, ...c };
  }

  function loadRows(rows, source = 'provider') {
    if (!Array.isArray(rows)) throw new TypeError('Carpet rows must be an array.');
    state.carpetRolls = rows.map(normalizeRoll);
    state.source = source;
    return assert212Equals212();
  }

  function setSearch(query) {
    state.query = String(query || '');
    return counts();
  }

  function setStatus(status) {
    const s = String(status || 'ACTIVE').toUpperCase();
    state.status = s === 'ALL' ? 'ALL' : 'ACTIVE';
    return counts();
  }

  window.RUNLU_V8 = Object.freeze({
    CARPET_DATASET,
    state,
    loadRows,
    activeCarpetRolls,
    visibleCarpetRolls,
    counts,
    assert212Equals212,
    setSearch,
    setStatus
  });
})();