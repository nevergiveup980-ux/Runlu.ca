/* RUNLU Warehouse OS V8 Pilot — read-only Supabase provider.
   Uses a publishable browser key only. No inventory write methods are exposed.
*/
(() => {
  'use strict';
  const PROJECT_URL = 'https://ekrnknlawekeoszzkamd.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const DATASET = 'runlu_carpet_inventory_v52';

  window.RUNLU_V8_PROVIDER = Object.freeze({
    async readCarpetRows() {
      const qs = new URLSearchParams({
        select: 'record_id,payload,updated_at',
        dataset_key: 'eq.' + DATASET,
        deleted_at: 'is.null',
        order: 'updated_at.asc'
      });
      const response = await fetch(PROJECT_URL + '/rest/v1/warehouse_records?' + qs.toString(), {
        method: 'GET',
        headers: {
          apikey: PUBLISHABLE_KEY,
          Authorization: 'Bearer ' + PUBLISHABLE_KEY,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error('Cloud read failed (' + response.status + ')' + (detail ? ': ' + detail.slice(0, 180) : ''));
      }
      return await response.json();
    }
  });
})();