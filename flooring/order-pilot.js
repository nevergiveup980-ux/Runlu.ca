/* Separate pilot: no installed application modules or business storage keys. */
(() => {
  'use strict';
  const URL = 'https://ekrnknlawekeoszzkamd.supabase.co';
  // Existing project publishable key. Authorization is enforced by database RLS.
  const KEY = 'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const by = id => document.getElementById(id);
  let session = null, selected = null, rows = [], busy = false;
  function status(message) { by('status').textContent = message; }
  async function request(path, options = {}) {
    const response = await fetch(URL + path, {...options, headers: {
      apikey: KEY, 'Content-Type': 'application/json',
      ...(session ? {Authorization: 'Bearer ' + session.access_token} : {}),
      ...(options.headers || {})
    }});
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 409) throw new Error('This test order may already have been saved. Load cloud orders and open its ID before continuing; retrying will not create a duplicate.');
      if (response.status === 401) throw new Error('Session expired. Sign out and sign in again. Unsaved form values remain visible until sign-out.');
      throw new Error(data?.message || data?.error_description || 'Cloud request failed. Nothing was confirmed saved.');
    }
    return data;
  }
  async function run(action) {
    if (busy) return;
    busy = true;
    document.querySelectorAll('button').forEach(b => b.disabled = true);
    try { await action(); } catch (error) { status(error.message); }
    finally { busy = false; document.querySelectorAll('button').forEach(b => b.disabled = false); }
  }
  function open(row) {
    selected = row ? {...row} : null;
    by('editor').reset();
    by('heading').textContent = row ? `TEST ${row.id} · version ${row.revision}` : 'New test order';
    if (row) {
      by('customer').value = row.customer; by('description').value = row.description;
      by('quantity').value = row.quantity; by('price').value = row.unit_price;
      by('stage').value = row.status;
    }
  }
  async function reload() {
    rows = await request('/rest/v1/flooring_order_pilot?select=*&order=updated_at.desc&limit=100');
    by('orders').replaceChildren();
    for (const row of rows) {
      const button = document.createElement('button'); button.type = 'button';
      button.textContent = `TEST ${row.id} · ${row.customer} · ${row.status} · v${row.revision}`;
      button.addEventListener('click', () => {
        if (confirm('Open this cloud version? Any unsaved form edits will be discarded.')) open(row);
      });
      by('orders').append(button);
    }
  }
  by('login').addEventListener('submit', event => {
    event.preventDefault(); run(async () => {
      session = await request('/auth/v1/token?grant_type=password', {method:'POST', body:JSON.stringify({email:by('email').value.trim(), password:by('password').value})});
      by('password').value = ''; by('login').hidden = true; by('workspace').hidden = false;
      by('identity').textContent = `Signed in: ${session.user.email}. Same account required on both devices.`;
      open(null); await reload(); status('Connected. Showing your latest 100 test orders.');
    });
  });
  by('refresh').addEventListener('click', () => run(async () => {
    await reload(); status('Cloud list refreshed. Open a listed order to load its latest version; your form was preserved.');
  }));
  by('new').addEventListener('click', () => { if (confirm('Start a new test order? Unsaved edits will be discarded.')) open(null); });
  by('logout').addEventListener('click', () => run(async () => {
    try { await request('/auth/v1/logout?scope=local', {method:'POST'}); }
    finally {
      session = null; selected = null; rows = []; by('orders').replaceChildren();
      by('editor').reset(); by('identity').textContent = '';
      by('workspace').hidden = true; by('login').hidden = false;
      status('Signed out on this device. No order data or tokens are retained in browser storage.');
    }
  }));
  by('editor').addEventListener('submit', event => {
    event.preventDefault(); run(async () => {
      if (!session) throw new Error('Sign in first.');
      const payload = {customer:by('customer').value.trim(), description:by('description').value.trim(),
        quantity:Number(by('quantity').value), unit_price:Number(by('price').value), status:by('stage').value};
      if (!payload.customer || !payload.description || !Number.isFinite(payload.quantity) || payload.quantity <= 0 || payload.quantity > 1000000 || !Number.isFinite(payload.unit_price) || payload.unit_price < 0 || payload.unit_price > 1000000) throw new Error('Enter a customer, description, positive quantity and valid price.');
      // Reserve an ID before sending: retries after an ambiguous network failure cannot create a duplicate.
      if (!selected) selected = {id:crypto.randomUUID(), revision:0};
      const creating = selected.revision === 0;
      const path = creating ? '/rest/v1/flooring_order_pilot' : `/rest/v1/flooring_order_pilot?id=eq.${selected.id}&revision=eq.${selected.revision}`;
      const saved = await request(path, {method:creating ? 'POST' : 'PATCH', headers:{Prefer:'return=representation'},
        body:JSON.stringify(creating ? {...payload,id:selected.id,owner_id:session.user.id} : payload)});
      if (!saved?.length) throw new Error('Another device saved a newer version. Your edits remain here. Load cloud orders and open the latest version before editing again.');
      open(saved[0]);
      status(`Saved TEST ${saved[0].id}, version ${saved[0].revision}. On the other device, load cloud orders and open this ID.`);
      try { await reload(); } catch (_) { status('Order saved, but refreshing the list failed. Use Load cloud orders to retry.'); }
    });
  });
})();
