/* RUNLU Warehouse OS V8 cloud bridge. Read-only.
   A provider supplies rows; this module never writes inventory.
*/
(() => {
  'use strict';

  async function loadCarpet(provider) {
    if (!provider || typeof provider.readCarpetRows !== 'function') {
      throw new Error('V8 carpet provider is not available.');
    }
    const rows = await provider.readCarpetRows();
    const check = window.RUNLU_V8.loadRows(rows, 'Cloud');
    if (window.RUNLU_V8_RENDER) window.RUNLU_V8_RENDER();
    return check;
  }

  window.RUNLU_V8_CLOUD = Object.freeze({ loadCarpet });
})();