(function () {
  "use strict";
  if (window.__runluSmartInventoryPickerV072) return;
  window.__runluSmartInventoryPickerV072 = true;

  const SUPABASE_URL = "https://ekrnknlawekeoszzkamd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn";
  const AUTH_STORAGE = "runlu-flooring-auth-v1";
  const DATASETS = [
    "runlu_carpet_inventory_v52",
    "runlu_inventory_records_v21",
    "runlu_product_master_v21",
  ];
  const CACHE_KEY = "runlu-flooring-smart-inventory-picker-v072";
  let sb = null;
  let inventory = [];
  let activeRow = null;
  let selectedId = "";
  let offline = false;
  let lastSync = "";
  let observer = null;
  let inputTimer = null;
  let installed = false;
  let connectionMessage = "";

  const by = (id) => document.getElementById(id);
  const str = (v) => String(v == null ? "" : v).trim();
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const norm = (v) =>
    str(v)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const esc = (v) =>
    str(v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const payload = (row) =>
    row && row.payload && typeof row.payload === "object" ? row.payload : {};
  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    } catch (_) {
      return null;
    }
  }
  function writeCache(value) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    } catch (_) {}
  }
  function displayNumber(v, digits) {
    return num(v).toLocaleString("en-CA", {
      maximumFractionDigits: digits == null ? 2 : digits,
    });
  }
  function masterName(master) {
    return [master.brand, master.series, master.name]
      .map(str)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .join(" · ");
  }
  function explicitHold(p) {
    const amount =
      p.holdQuantity ??
      p.quantityOnHold ??
      p.reservedQuantity ??
      p.allocatedQuantity;
    const holds = Array.isArray(p.holds) ? p.holds : [];
    if (amount != null || holds.length) {
      return {
        known: true,
        amount: num(amount) || holds.reduce((s, h) => s + num(h.quantity), 0),
        details: holds,
      };
    }
    return { known: false, amount: 0, details: [] };
  }
  function buildInventory(rows) {
    const masterRows = rows.filter(
      (r) => r.dataset_key === "runlu_product_master_v21",
    );
    const masters = new Map();
    masterRows.forEach((r) => {
      const p = payload(r);
      [p.id, r.record_id]
        .filter(Boolean)
        .forEach((id) => masters.set(str(id), p));
    });
    const carpets = rows
      .filter((r) => r.dataset_key === "runlu_carpet_inventory_v52")
      .map((r) => {
        const p = payload(r);
        const hold = explicitHold(p);
        return {
          id: "carpet:" + str(r.record_id || p.roll || p.id),
          kind: "Carpet Roll",
          name: str(p.collection || p.product || "Carpet"),
          colour: str(p.colour || p.color),
          sku: "",
          roll: str(p.roll),
          manufacturerRoll: str(p.manufacturerRoll),
          lot: str(p.lot),
          location: str(p.location),
          status: str(p.status || "Active"),
          measure: str(p.measure),
          width: str(p.width),
          quantity: num(p.length),
          unit: "LF",
          hold,
          available: Math.max(0, num(p.length) - hold.amount),
          notes: str(p.reviewNote || p.notes),
          updatedAt: str(p.updatedAt || r.updated_at),
          selectable:
            num(p.length) > 0 &&
            !p.transferredOut &&
            str(p.warehouseScope).toLowerCase() !== "external" &&
            !/used up|transferred|at store/i.test(str(p.status)),
          raw: p,
        };
      });
    const goods = rows
      .filter((r) => r.dataset_key === "runlu_inventory_records_v21")
      .map((r) => {
        const p = payload(r);
        const master = masters.get(str(p.masterId)) || {};
        const hold = explicitHold(p);
        const quantity = num(p.quantity);
        return {
          id: "stock:" + str(r.record_id || p.inventoryId || p.id),
          kind: str(master.category || p.inventoryType || "Stock Item"),
          name: masterName(master) || str(p.product || p.name || p.inventoryId),
          colour: str(master.color || master.colour || p.colour || p.color),
          sku: str(master.sku || p.sku || p.inventoryId),
          roll: "",
          manufacturerRoll: "",
          lot: str(p.lotNumber || p.lot),
          location: str(p.location),
          status: str(p.lifecycleStatus || p.status || "Active"),
          measure: "",
          width: str(master.width),
          quantity,
          unit: str(p.unit || master.coverageUnit || "EA").toUpperCase(),
          hold,
          available: Math.max(0, quantity - hold.amount),
          pending: num(p.quantityPending),
          notes: str(p.notes || master.notes),
          updatedAt: str(p.lastUpdatedAt || p.updated || r.updated_at),
          selectable:
            quantity > 0 &&
            !/inactive|used up|transferred|archived/i.test(
              str(p.lifecycleStatus || p.status),
            ) &&
            str(p.warehouseScope).toLowerCase() !== "external",
          raw: p,
        };
      });
    inventory = [...carpets, ...goods].sort(
      (a, b) =>
        Number(b.selectable) - Number(a.selectable) ||
        a.name.localeCompare(b.name) ||
        b.available - a.available,
    );
  }
  function searchable(item) {
    return norm(
      [
        item.name,
        item.colour,
        item.sku,
        item.roll,
        item.manufacturerRoll,
        item.lot,
        item.location,
        item.kind,
      ].join(" "),
    );
  }
  function matches(item, query) {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const hay = searchable(item);
    return words.every((word) => hay.includes(word));
  }
  function resultSet() {
    const q = by("sip72q")?.value || "";
    const kind = by("sip72kind")?.value || "all";
    return inventory
      .filter((item) => !q || matches(item, q))
      .filter(
        (item) =>
          kind === "all" ||
          (kind === "carpet") === (item.kind === "Carpet Roll"),
      )
      .slice(0, 100);
  }
  function quantityText(item) {
    if (item.kind === "Carpet Roll")
      return `${displayNumber(item.available)} LF available · ${esc(item.width || "—")}' wide`;
    return `${displayNumber(item.available)} ${esc(item.unit)} available`;
  }
  function holdText(item) {
    if (!item.hold.known) return "Hold tracking not recorded for this item";
    return item.hold.amount
      ? `${displayNumber(item.hold.amount)} ${item.unit} on hold`
      : "No active hold recorded";
  }
  function renderResults() {
    const el = by("sip72results");
    if (!el) return;
    const rows = resultSet();
    el.innerHTML = rows.length
      ? rows
          .map(
            (item) =>
              `<button type="button" class="sip72row ${
                item.id === selectedId ? "selected" : ""
              } ${item.selectable ? "" : "disabled"}" data-sip72-id="${esc(
                item.id,
              )}"><span><b>${esc(item.name)}</b><small>${esc(
                [item.colour, item.sku].filter(Boolean).join(" · ") ||
                  "No colour / SKU",
              )}</small></span><span><b>${esc(
                item.roll ? "Roll " + item.roll : item.kind,
              )}</b><small>${esc(
                [
                  item.lot && "Dye lot " + item.lot,
                  item.location && "Location " + item.location,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—",
              )}</small></span><span><b>${quantityText(item)}</b><small>${esc(
                item.status,
              )}${item.measure ? " · " + esc(item.measure) : ""}</small></span></button>`,
          )
          .join("")
      : !inventory.length && offline
        ? `<div class="sip72empty sip72connect"><b>Connect Warehouse OS inventory</b><p>${esc(
            connectionMessage ||
              "Warehouse OS inventory is not connected on this browser.",
          )}</p><div><input id="sip72email" type="email" autocomplete="username" placeholder="Staff email"><input id="sip72password" type="password" autocomplete="current-password" placeholder="Password"><button type="button" id="sip72signin">Connect & load inventory</button></div><small>This connection is read-only here. Selecting a record does not change Warehouse OS inventory or create a Hold.</small></div>`
        : '<div class="sip72empty">No live Warehouse OS inventory matches this search.</div>';
    el.querySelectorAll("[data-sip72-id]").forEach((button) =>
      button.addEventListener("click", () =>
        selectDetail(button.dataset.sip72Id),
      ),
    );
    by("sip72signin")?.addEventListener("click", connectWarehouse);
    by("sip72count").textContent =
      `${rows.length} shown · ${inventory.length} loaded`;
  }
  function selectDetail(id) {
    selectedId = id;
    renderResults();
    const item = inventory.find((x) => x.id === id);
    const el = by("sip72detail");
    if (!el || !item) return;
    const holdDetails = item.hold.details.length
      ? `<div class="sip72holds">${item.hold.details
          .map(
            (h) =>
              `<div>${esc(h.jobNumber || h.po || h.customer || "Hold")} · ${esc(
                h.quantity || "",
              )} ${esc(item.unit)}</div>`,
          )
          .join("")}</div>`
      : "";
    el.innerHTML = `<div class="sip72detailHead"><div><span>${esc(
      item.kind,
    )}</span><h3>${esc(item.name)}</h3><p>${esc(item.colour || "No colour")}</p></div><span class="sip72availability ${
      item.selectable ? "ok" : "no"
    }">${item.selectable ? "AVAILABLE" : "NOT AVAILABLE"}</span></div><dl><div><dt>Roll / Stock ID</dt><dd>${esc(
      item.roll || item.sku || "—",
    )}</dd></div><div><dt>Manufacturer Roll</dt><dd>${esc(
      item.manufacturerRoll || "—",
    )}</dd></div><div><dt>Dye lot / Batch</dt><dd>${esc(
      item.lot || "—",
    )}</dd></div><div><dt>Location</dt><dd>${esc(
      item.location || "—",
    )}</dd></div><div><dt>Physical Quantity</dt><dd>${displayNumber(
      item.quantity,
    )} ${esc(item.unit)}</dd></div><div><dt>Available</dt><dd>${displayNumber(
      item.available,
    )} ${esc(item.unit)}</dd></div><div><dt>Size</dt><dd>${esc(
      item.kind === "Carpet Roll"
        ? `${item.width || "—"}' × ${displayNumber(item.quantity)} LF`
        : item.width || "—",
    )}</dd></div><div><dt>Hold</dt><dd>${esc(
      holdText(item),
    )}</dd></div><div><dt>Status</dt><dd>${esc(
      [item.status, item.measure].filter(Boolean).join(" · "),
    )}</dd></div><div><dt>Last Updated</dt><dd>${esc(
      item.updatedAt || "—",
    )}</dd></div></dl>${holdDetails}${
      item.notes ? `<p class="sip72note">${esc(item.notes)}</p>` : ""
    }<button type="button" id="sip72use" class="action primary" ${
      item.selectable ? "" : "disabled"
    }>Use this inventory record</button>`;
    by("sip72use")?.addEventListener("click", () => useItem(item));
  }
  function setField(row, field, value, overwrite) {
    const el = row?.querySelector(`[data-f="${field}"]`);
    if (!el || (!overwrite && str(el.value))) return;
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function useItem(item) {
    if (!activeRow || !activeRow.isConnected || !item.selectable) return;
    setField(activeRow, "style", item.name, true);
    setField(activeRow, "colour", item.colour, true);
    setField(activeRow, "sku", item.sku || item.manufacturerRoll, false);
    setField(activeRow, "sourceType", "Stock", true);
    const reference = item.roll
      ? [
          "Roll " + item.roll,
          item.manufacturerRoll && "Mfr " + item.manufacturerRoll,
          item.lot && "Lot " + item.lot,
          item.location && "Loc " + item.location,
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          item.sku,
          item.lot && "Lot " + item.lot,
          item.location && "Loc " + item.location,
        ]
          .filter(Boolean)
          .join(" · ");
    setField(activeRow, "sourceRef", reference, true);
    const badge =
      activeRow.querySelector("[data-sip72-picked]") ||
      document.createElement("div");
    badge.dataset.sip72Picked = "1";
    badge.className = "sip72picked";
    badge.textContent = `Warehouse selected · ${reference} · ${quantityText(item)}`;
    if (!badge.isConnected) activeRow.appendChild(badge);
    closePicker();
  }
  function ensureStyle() {
    if (by("sip72style")) return;
    const style = document.createElement("style");
    style.id = "sip72style";
    style.textContent = `
.sip72field{position:relative}.sip72launch{position:absolute;right:4px;top:22px;border:0;border-radius:5px;background:#e6f1eb;color:#23543f;font-size:9px;font-weight:900;padding:4px 6px;cursor:pointer}.sip72field input{padding-right:64px!important}.sip72picked{grid-column:1/-1;border-left:4px solid #438061;background:#eef6f1;color:#315746;padding:6px 8px;border-radius:5px;font-size:9px;font-weight:700}.sip72backdrop{position:fixed;inset:0;z-index:100000;background:rgba(12,28,21,.62);display:flex;align-items:center;justify-content:center;padding:8px}.sip72backdrop[hidden]{display:none!important}.sip72modal{width:calc(100vw - 16px);height:calc(100vh - 16px);background:#fff;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.3);display:grid;grid-template-rows:auto auto minmax(0,1fr);overflow:hidden}.sip72top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 16px;background:#173d30;color:#fff}.sip72top h2{margin:0;font-size:22px}.sip72top p{margin:4px 0 0;font-size:12px;opacity:.8}.sip72top button{border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff;border-radius:7px;padding:6px 9px;cursor:pointer}.sip72tools{display:grid;grid-template-columns:minmax(220px,1fr) 170px auto auto;gap:8px;padding:11px 14px;border-bottom:1px solid #dce5e0;background:#f6f9f7}.sip72tools input,.sip72tools select{padding:11px;font-size:13px;border:1px solid #cbd8d1;border-radius:7px;background:#fff}.sip72sync{font-size:9px;font-weight:900;border-radius:999px;padding:6px 8px;background:#e8f3ed;color:#245841;align-self:center}.sip72sync.off{background:#fff0d4;color:#745000}.sip72body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(390px,1fr);min-height:0}.sip72results{overflow:auto;padding:9px;background:#f4f7f5}.sip72row{width:100%;display:grid;grid-template-columns:minmax(180px,1.4fr) minmax(150px,1fr) minmax(180px,1fr);gap:12px;text-align:left;border:1px solid #d9e3de;border-radius:8px;background:#fff;padding:12px;margin-bottom:7px;cursor:pointer}.sip72row:hover,.sip72row.selected{border-color:#3f765d;box-shadow:0 0 0 1px #3f765d}.sip72row.disabled{opacity:.52}.sip72row b{display:block;color:#203d31;font-size:13px}.sip72row small{display:block;color:#718078;font-size:11px;margin-top:3px}.sip72detail{overflow:auto;padding:20px;border-left:1px solid #dce5e0}.sip72detailHead{display:flex;justify-content:space-between;gap:10px}.sip72detailHead span{font-size:9px;font-weight:900;color:#66756e}.sip72detailHead h3{margin:5px 0;font-size:23px;color:#173d30}.sip72detailHead p{margin:0;color:#67766e;font-size:13px}.sip72availability{height:max-content;border-radius:999px;padding:5px 7px;font-size:8px}.sip72availability.ok{background:#e4f3e9;color:#23653d}.sip72availability.no{background:#fde8e5;color:#8a3327}.sip72detail dl{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:15px 0;border:1px solid #dce5e0;border-radius:8px;overflow:hidden}.sip72detail dl div{padding:8px;border-bottom:1px solid #e5ebe8}.sip72detail dt{font-size:10px;text-transform:uppercase;color:#78857f;font-weight:900}.sip72detail dd{margin:4px 0 0;font-size:13px;color:#263d32;font-weight:700}.sip72note,.sip72holds{font-size:11px;color:#5e6d65;background:#f3f7f5;padding:8px;border-radius:7px}.sip72empty{padding:30px;text-align:center;color:#738078}.sip72connect>b{display:block;color:#173d30;font-size:14px}.sip72connect p{line-height:1.45}.sip72connect>div{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;max-width:680px;margin:12px auto}.sip72connect input,.sip72connect button{padding:9px;border:1px solid #cbd8d1;border-radius:7px}.sip72connect button{background:#245b44;color:#fff;font-weight:800;cursor:pointer}.sip72connect small{display:block;line-height:1.4}.sip72intro{color:#6b7972;font-size:11px;line-height:1.5}.sip72count{font-size:9px;color:#697870;align-self:center}@media(max-width:760px){.sip72backdrop{padding:5px}.sip72modal{height:98vh;width:99vw}.sip72tools{grid-template-columns:1fr 110px}.sip72body{grid-template-columns:1fr}.sip72detail{border-left:0;border-top:1px solid #dce5e0;max-height:44vh}.sip72row{grid-template-columns:1fr 1fr}.sip72row span:last-child{grid-column:1/-1}.sip72detail dl{grid-template-columns:1fr 1fr}.sip72connect>div{grid-template-columns:1fr}.sip72connect{padding:18px 10px}}`;
    document.head.appendChild(style);
  }
  function ensureModal() {
    if (by("sip72")) return;
    const wrap = document.createElement("div");
    wrap.id = "sip72";
    wrap.className = "sip72backdrop";
    wrap.hidden = true;
    wrap.innerHTML = `<div class="sip72modal" role="dialog" aria-modal="true" aria-labelledby="sip72title"><div class="sip72top"><div><h2 id="sip72title">Smart Inventory Picker</h2><p>Live Warehouse OS inventory · read-only selection</p></div><button type="button" id="sip72close">Close</button></div><div class="sip72tools"><input id="sip72q" autocomplete="off" placeholder="Search product, colour, roll, dye lot, SKU"><select id="sip72kind"><option value="all">All inventory</option><option value="carpet">Carpet rolls</option><option value="stock">Hard surface / stock</option></select><span id="sip72count" class="sip72count"></span><span id="sip72sync" class="sip72sync">CONNECTING</span></div><div class="sip72body"><div id="sip72results" class="sip72results"></div><div id="sip72detail" class="sip72detail"><p class="sip72intro">Select an inventory record to inspect its roll, dye lot, location, physical quantity and any hold data currently recorded by Warehouse OS.</p></div></div></div>`;
    document.body.appendChild(wrap);
    by("sip72close").addEventListener("click", closePicker);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) closePicker();
    });
    by("sip72q").addEventListener("input", renderResults);
    by("sip72kind").addEventListener("change", renderResults);
  }
  function openPicker(row, query) {
    activeRow = row;
    selectedId = "";
    ensureModal();
    by("sip72").hidden = false;
    by("sip72q").value = str(query);
    by("sip72detail").innerHTML =
      '<p class="sip72intro">Select an inventory record to see complete Warehouse OS details. Selecting here does not change inventory or create a Hold.</p>';
    renderResults();
    setTimeout(() => by("sip72q")?.focus(), 0);
    if (!inventory.length) refresh(false);
  }
  function rowQuery(row) {
    return [
      row?.querySelector('[data-f="style"]')?.value,
      row?.querySelector('[data-f="colour"]')?.value,
    ]
      .map(str)
      .filter(Boolean)
      .join(" ");
  }
  function closePicker() {
    if (by("sip72")) by("sip72").hidden = true;
    selectedId = "";
  }
  function decorateRows() {
    document.querySelectorAll("[data-po-native-row]").forEach((row) => {
      const input = row.querySelector('[data-f="style"]');
      const field = input?.parentElement;
      if (!input || !field || field.dataset.sip72) return;
      field.dataset.sip72 = "1";
      field.classList.add("sip72field");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sip72launch";
      button.textContent = "Inventory";
      button.title = "Search live Warehouse OS inventory";
      button.addEventListener("click", () => openPicker(row, rowQuery(row)));
      field.appendChild(button);
    });
  }
  function projectSessionCandidate(value) {
    const seen = new Set();
    function walk(node, depth) {
      if (!node || typeof node !== "object" || depth > 5 || seen.has(node))
        return null;
      seen.add(node);
      if (str(node.access_token) && str(node.refresh_token)) {
        try {
          const middle = str(node.access_token).split(".")[1];
          const base64 = middle.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(
            atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)),
          );
          const issuer = str(decoded.iss);
          const ref = str(decoded.ref);
          if (
            issuer.includes("ekrnknlawekeoszzkamd.supabase.co") ||
            ref === "ekrnknlawekeoszzkamd"
          )
            return {
              access_token: node.access_token,
              refresh_token: node.refresh_token,
            };
        } catch (_) {}
      }
      for (const key of Object.keys(node)) {
        const found = walk(node[key], depth + 1);
        if (found) return found;
      }
      return null;
    }
    return walk(value, 0);
  }
  async function recoverWarehouseSession(c) {
    const current = await c.auth.getSession();
    if (current?.data?.session) return current.data.session;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index) || "";
      if (key === AUTH_STORAGE || !/auth|supabase|warehouse/i.test(key))
        continue;
      try {
        const candidate = projectSessionCandidate(
          JSON.parse(localStorage.getItem(key) || "null"),
        );
        if (!candidate) continue;
        const restored = await c.auth.setSession(candidate);
        if (restored?.data?.session) return restored.data.session;
      } catch (_) {}
    }
    return null;
  }
  async function connectWarehouse() {
    const email = str(by("sip72email")?.value);
    const password = by("sip72password")?.value || "";
    const button = by("sip72signin");
    if (!email || !password) {
      connectionMessage = "Enter the staff email and password used for RUNLU central services.";
      renderResults();
      return;
    }
    if (button) {
      button.disabled = true;
      button.textContent = "Connecting…";
    }
    try {
      const c = await client();
      const signed = await c.auth.signInWithPassword({ email, password });
      if (signed.error) throw signed.error;
      connectionMessage = "";
      await refresh(true);
    } catch (error) {
      connectionMessage = `Connection failed: ${error?.message || error}`;
      offline = true;
      renderResults();
    }
  }
  async function client() {
    if (sb) return sb;
    for (let i = 0; i < 40 && !window.supabase?.createClient; i++)
      await new Promise((resolve) => setTimeout(resolve, 200));
    if (!window.supabase?.createClient)
      throw new Error("Supabase client unavailable");
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        storageKey: AUTH_STORAGE,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return sb;
  }
  function setSync() {
    const state = by("sip72sync");
    if (!state) return;
    state.textContent = offline
      ? inventory.length
        ? "OFFLINE CACHE"
        : "NOT CONNECTED"
      : `LIVE · ${lastSync || "SYNCED"}`;
    state.classList.toggle("off", offline);
  }
  async function refresh(manual) {
    try {
      const c = await client();
      const session = await recoverWarehouseSession(c);
      if (!session) throw new Error("Warehouse OS sign-in was not found");
      const res = await c
        .from("warehouse_records")
        .select("dataset_key,record_id,payload,version,updated_at")
        .in("dataset_key", DATASETS)
        .is("deleted_at", null)
        .limit(1000);
      if (res.error) throw res.error;
      buildInventory(Array.isArray(res.data) ? res.data : []);
      offline = false;
      connectionMessage = "";
      lastSync = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      writeCache({ rows: res.data, lastSync });
    } catch (error) {
      const cache = readCache();
      if (cache?.rows) buildInventory(cache.rows);
      offline = true;
      connectionMessage = cache?.rows?.length
        ? "Live Warehouse OS connection is unavailable; showing the last inventory saved on this browser."
        : `${error?.message || "Warehouse OS connection failed"}. Open Warehouse OS in this browser and sign in once, then reopen this picker.`;
      lastSync = cache?.lastSync || "";
      if (manual)
        console.warn(
          "Smart Inventory Picker refresh:",
          error?.message || error,
        );
    }
    setSync();
    if (by("sip72") && !by("sip72").hidden) renderResults();
  }
  function install() {
    ensureStyle();
    ensureModal();
    decorateRows();
    if (installed) return;
    installed = true;
    refresh(false);
    document.addEventListener(
      "input",
      (e) => {
        const input = e.target?.matches?.(
          '[data-po-native-row] [data-f="style"], [data-po-native-row] [data-f="colour"]',
        )
          ? e.target
          : null;
        if (!input) return;
        clearTimeout(inputTimer);
        const row = input.closest("[data-po-native-row]");
        const query = rowQuery(row);
        if (norm(input.value).length < 2 || norm(query).length < 2) return;
        inputTimer = setTimeout(
          () => openPicker(row, rowQuery(row)),
          450,
        );
      },
      true,
    );
    document.addEventListener(
      "click",
      (e) => {
        if (
          e.target?.closest?.(
            "#poAddNativeItemBtn,[data-po-open],[data-po-remove],#nav [data-page='purchasing']",
          )
        )
          setTimeout(decorateRows, 80);
      },
      true,
    );
    if (!observer) {
      observer = new MutationObserver(() => decorateRows());
      const target = by("poNativeItems") || document.body;
      observer.observe(target, { childList: true, subtree: true });
    }
  }
  window.RUNLUSmartInventoryPickerV072 = {
    install,
    refresh,
    open: () => openPicker(document.querySelector("[data-po-native-row]"), ""),
    inventory: () => inventory.slice(),
  };
  setTimeout(install, 500);
})();
