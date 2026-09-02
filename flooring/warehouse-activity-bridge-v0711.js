(function () {
  "use strict";
  if (window.__runluWarehouseActivityBridge0711) return;
  window.__runluWarehouseActivityBridge0711 = true;

  const SUPABASE_URL = "https://ekrnknlawekeoszzkamd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn";
  const AUTH_STORAGE = "runlu-flooring-auth-v1";
  const DATASET = "runlu_operations_log_v52";
  const CACHE_KEY = "runlu-flooring-warehouse-activity-v0711";
  const PAGE_ID = "warehouseActivity";
  const LIMIT = 300;
  let sb = null,
    records = [],
    offline = false,
    lastSync = "",
    timer = null;

  const by = (id) => document.getElementById(id);
  const text = (v) => String(v == null ? "" : v).trim();
  const norm = (v) =>
    text(v)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const esc = (v) =>
    text(v).replace(
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
  const arr = (v) => (Array.isArray(v) ? v : []);
  function read(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (_) {
      return fallback;
    }
  }
  function write(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {}
  }
  function jobsList() {
    try {
      return Array.isArray(window.jobs)
        ? window.jobs
        : read("runlu_deerfoot_flooring_jobs_v1", []);
    } catch (_) {
      return [];
    }
  }
  function activeJob() {
    try {
      return typeof window.active === "function"
        ? window.active()
        : jobsList().find(
            (j) =>
              j &&
              j.id ===
                localStorage.getItem("runlu_deerfoot_flooring_active_job_v1"),
          ) || jobsList()[0];
    } catch (_) {
      return null;
    }
  }
  function refs(job) {
    return [
      job?.jobNumber,
      job?.invoiceNumber,
      job?.supplierPO,
      job?.customerPO,
      job?.poNumber,
    ]
      .map(norm)
      .filter(Boolean);
  }
  function payload(row) {
    return row && row.payload && typeof row.payload === "object"
      ? row.payload
      : {};
  }
  function belongs(row, job) {
    if (!job) return false;
    const p = payload(row),
      tokens = refs(job);
    const opRefs = [
      p.po,
      p.poNumber,
      p.job,
      p.jobNumber,
      p.order,
      p.orderNumber,
      p.invoice,
      p.invoiceNumber,
      p.reference,
    ]
      .map(norm)
      .filter(Boolean);
    if (
      tokens.some((x) =>
        opRefs.some(
          (y) =>
            x === y ||
            (x.length > 4 && y.includes(x)) ||
            (y.length > 4 && x.includes(y)),
        ),
      )
    )
      return true;
    const customer = norm(job.customerName || job.customer),
      opCustomer = norm(p.customer || p.customerName);
    return customer.length > 4 && customer === opCustomer;
  }
  function linkedJob(row) {
    return jobsList().find((j) => belongs(row, j)) || null;
  }
  function when(row) {
    const p = payload(row),
      raw =
        p.timestamp ||
        p.completedAt ||
        p.updatedAt ||
        row.updated_at ||
        [p.date, p.time].filter(Boolean).join("T");
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? new Date(0) : d;
  }
  function label(row) {
    const p = payload(row);
    return text(
      p.type ||
        p.operationType ||
        p.action ||
        p.category ||
        "Warehouse Activity",
    );
  }
  function stage(row) {
    const p = payload(row),
      s = text(p.status || p.itemStatus || p.result).toLowerCase();
    if (
      /complete|received|shipped|picked up|returned|done|closed|success/.test(s)
    )
      return "Completed";
    if (/wait|pending|scheduled|ready|open/.test(s)) return "Waiting";
    return text(p.status || p.itemStatus || "Recorded");
  }
  function detail(row) {
    const p = payload(row),
      bits = [];
    if (p.po || p.poNumber) bits.push("PO " + text(p.po || p.poNumber));
    if (p.customer || p.customerName)
      bits.push(text(p.customer || p.customerName));
    if (p.location || p.toLocation)
      bits.push([p.location, p.toLocation].filter(Boolean).join(" → "));
    if (p.roll) bits.push("Roll " + text(p.roll));
    const items = arr(p.items);
    if (items.length)
      bits.push(items.length + " item" + (items.length === 1 ? "" : "s"));
    return bits.join(" · ") || "Warehouse operation recorded";
  }
  function stamp(row) {
    const d = when(row);
    return d.getTime()
      ? d.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  }
  function today(row) {
    const d = when(row),
      n = new Date();
    return d.toDateString() === n.toDateString();
  }

  function style() {
    if (by("wa711style")) return;
    const s = document.createElement("style");
    s.id = "wa711style";
    s.textContent = `
#warehouseActivity .wa-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.wa-state{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:#e8f3ed;color:#245841}.wa-state.off{background:#fff1d6;color:#7a5700}.wa-tools{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.wa-tools input,.wa-tools select{border:1px solid #ccd8d2;border-radius:6px;padding:8px;background:#fff;min-width:170px}.wa-list{display:grid;gap:8px}.wa-row{display:grid;grid-template-columns:145px minmax(170px,1fr) minmax(220px,2fr) 95px;gap:10px;align-items:center;padding:10px;border:1px solid #dce5e0;border-radius:8px;background:#fff}.wa-row b{color:#234b3b}.wa-row small{display:block;color:#748078;margin-top:3px}.wa-badge{justify-self:start;font-size:9px;font-weight:900;padding:4px 7px;border-radius:999px;background:#edf3f0}.wa-empty{padding:26px;text-align:center;color:#718078;border:1px dashed #cbd7d1;border-radius:8px}.wa-active{margin-top:7px;border-top:1px solid #dbe3df;padding-top:6px;font-size:10px}.wa-active div{margin-top:3px}.wa-active a{color:#245c47;font-weight:800;text-decoration:none}.wa-statgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.wa-stat{border:1px solid #dce5e0;border-radius:8px;padding:10px;text-align:center;background:#fff}.wa-stat b{display:block;font-size:20px;color:#244f3e}.wa-stat span{font-size:9px;color:#748078}@media(max-width:850px){.wa-row{grid-template-columns:1fr 1fr}.wa-statgrid{grid-template-columns:1fr 1fr}}`;
    document.head.appendChild(s);
  }
  function ensurePage() {
    if (by(PAGE_ID)) return;
    const main = document.querySelector("main");
    if (!main) return;
    const page = document.createElement("section");
    page.id = PAGE_ID;
    page.className = "page";
    page.innerHTML = `<div class="card"><div class="wa-head"><div><h2>Warehouse Activity</h2><p class="muted">Read-only activity mapped from Warehouse OS by PO / Job reference. Warehouse OS remains the inventory authority.</p></div><span id="wa711state" class="wa-state">CONNECTING</span></div><div id="wa711stats" class="wa-statgrid"></div><div class="wa-tools"><input id="wa711search" placeholder="Search PO, customer, operation"><select id="wa711filter"><option value="all">All activity</option><option value="waiting">Waiting</option><option value="completed">Completed</option><option value="active">Active order only</option></select><button id="wa711refresh" class="action primary" type="button">Refresh</button></div><div id="wa711list" class="wa-list"></div></div>`;
    main.appendChild(page);
    by("wa711search").addEventListener("input", render);
    by("wa711filter").addEventListener("change", render);
    by("wa711refresh").addEventListener("click", () => refresh(true));
  }
  function ensureNav() {
    const nav = by("nav");
    if (!nav || nav.querySelector('[data-page="' + PAGE_ID + '"]')) return;
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.page = PAGE_ID;
    b.textContent = "Warehouse Activity";
    b.onclick = () => open();
    const anchor = nav.querySelector('[data-page="invoice"]');
    anchor
      ? anchor.insertAdjacentElement("beforebegin", b)
      : nav.appendChild(b);
  }
  function ensureModule() {
    const grid = document.querySelector("#command .grid3");
    if (!grid || by("wa711module")) return;
    const b = document.createElement("button");
    b.id = "wa711module";
    b.className = "module";
    b.innerHTML =
      '<span class="ico">🔄</span><strong>Warehouse Activity</strong><small>Live read-only Warehouse OS operations mapped back to PO / Job.</small>';
    b.onclick = () => open();
    const anchor = Array.from(grid.children).find((x) =>
      /Warehouse OS/.test(x.textContent),
    );
    anchor ? anchor.insertAdjacentElement("afterend", b) : grid.appendChild(b);
  }
  function ensureActive() {
    const a = by("activeSummary");
    if (!a) return;
    let box = by("wa711active");
    if (!box) {
      box = document.createElement("div");
      box.id = "wa711active";
      box.className = "wa-active";
      a.insertAdjacentElement("afterend", box);
    }
    renderActive();
  }
  function open() {
    ensurePage();
    ensureNav();
    document
      .querySelectorAll(".page")
      .forEach((x) => x.classList.toggle("active", x.id === PAGE_ID));
    document
      .querySelectorAll("#nav button")
      .forEach((x) => x.classList.toggle("active", x.dataset.page === PAGE_ID));
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function renderActive() {
    const box = by("wa711active");
    if (!box) return;
    const job = activeJob(),
      found = records
        .filter((r) => belongs(r, job))
        .sort((a, b) => when(b) - when(a))
        .slice(0, 3);
    box.innerHTML = found.length
      ? "<b>Warehouse OS</b>" +
        found
          .map(
            (r) =>
              `<div>${esc(label(r))} · ${esc(stage(r))} <small>${esc(stamp(r))}</small></div>`,
          )
          .join("") +
        '<div><a href="#" id="wa711more">View warehouse activity →</a></div>'
      : '<b>Warehouse OS</b><div class="muted">No mapped warehouse activity for this order.</div>';
    by("wa711more")?.addEventListener("click", (e) => {
      e.preventDefault();
      open();
      by("wa711filter").value = "active";
      render();
    });
  }
  function render() {
    ensurePage();
    const list = by("wa711list");
    if (!list) return;
    const q = norm(by("wa711search")?.value),
      filter = by("wa711filter")?.value || "all",
      job = activeJob();
    let view = records.slice().sort((a, b) => when(b) - when(a));
    if (q)
      view = view.filter((r) =>
        norm([label(r), detail(r), stage(r)].join(" ")).includes(q),
      );
    if (filter === "waiting") view = view.filter((r) => stage(r) === "Waiting");
    if (filter === "completed")
      view = view.filter((r) => stage(r) === "Completed");
    if (filter === "active") view = view.filter((r) => belongs(r, job));
    const activeCount = records.filter((r) => belongs(r, job)).length;
    by("wa711stats").innerHTML =
      `<div class="wa-stat"><b>${records.filter(today).length}</b><span>Today</span></div><div class="wa-stat"><b>${records.filter((r) => stage(r) === "Waiting").length}</b><span>Waiting</span></div><div class="wa-stat"><b>${records.filter((r) => stage(r) === "Completed").length}</b><span>Completed</span></div><div class="wa-stat"><b>${activeCount}</b><span>Active Order</span></div>`;
    list.innerHTML = view.length
      ? view
          .map((r) => {
            const j = linkedJob(r);
            return `<div class="wa-row"><div><b>${esc(label(r))}</b><small>${esc(stamp(r))}</small></div><div>${esc(detail(r))}<small>${j ? "Mapped: " + esc(j.jobNumber || j.customerName || "Job") : "Unmapped operation"}</small></div><div><span class="wa-badge">${esc(stage(r))}</span></div><div><small>Warehouse OS</small></div></div>`;
          })
          .join("")
      : '<div class="wa-empty">No warehouse activity matches this view.</div>';
    const state = by("wa711state");
    if (state) {
      state.textContent = offline
        ? "OFFLINE CACHE"
        : "LIVE · " + (lastSync || "SYNCED");
      state.classList.toggle("off", offline);
    }
    renderActive();
  }

  async function client() {
    if (sb) return sb;
    for (let i = 0; i < 40 && !window.supabase?.createClient; i++)
      await new Promise((r) => setTimeout(r, 200));
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
  async function refresh(manual) {
    try {
      const c = await client(),
        session = await c.auth.getSession();
      if (!session?.data?.session) throw new Error("Sign in required");
      const res = await c
        .from("warehouse_records")
        .select("record_id,payload,version,updated_at")
        .eq("dataset_key", DATASET)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(LIMIT);
      if (res.error) throw res.error;
      records = arr(res.data);
      offline = false;
      lastSync = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      write(CACHE_KEY, { records, lastSync });
      render();
    } catch (e) {
      const cached = read(CACHE_KEY, { records: [], lastSync: "" });
      records = arr(cached.records);
      lastSync = cached.lastSync || "";
      offline = true;
      render();
      if (manual) console.warn("Warehouse Activity refresh:", e?.message || e);
    }
  }
  function install() {
    style();
    ensurePage();
    ensureNav();
    ensureModule();
    ensureActive();
    render();
    refresh(false);
    if (!timer) timer = setInterval(() => refresh(false), 60000);
  }
  document.addEventListener(
    "click",
    (e) => {
      if (e.target?.closest?.('#nav button[data-page="' + PAGE_ID + '"]')) {
        e.preventDefault();
        e.stopPropagation();
        open();
      } else if (
        e.target?.closest?.('#nav button[data-page="command"],#command')
      )
        setTimeout(ensureActive, 40);
    },
    true,
  );
  new MutationObserver(() => {
    ensurePage();
    ensureNav();
    ensureModule();
    ensureActive();
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.RUNLUWarehouseActivityBridgeV0711 = {
    install,
    refresh,
    render,
    belongsToJob: belongs,
  };
  setTimeout(install, 350);
})();
