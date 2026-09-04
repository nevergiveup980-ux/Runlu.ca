(function () {
  "use strict";
  if (window.__runluPoPaperInventoryBridgeV052) return;
  window.__runluPoPaperInventoryBridgeV052 = true;

  const PICKER = "RUNLUSmartInventoryPickerV072";
  const outer = document.getElementById("editor");
  let activePaperRow = null;
  let activePaperDoc = null;
  let fakeRow = null;
  let typingTimer = null;
  let applyTimer = null;
  let applying = false;
  let lastPaperDoc = null;

  const str = (v) => String(v == null ? "" : v).trim();

  function deepestPaperDoc(win, depth) {
    if (!win || depth > 8) return null;
    let doc;
    try {
      doc = win.document;
    } catch (_) {
      return null;
    }
    if (!doc) return null;
    if (doc.querySelector("#rows tr")) return doc;
    const frames = Array.from(doc.querySelectorAll("iframe"));
    for (const frame of frames) {
      try {
        const found = deepestPaperDoc(frame.contentWindow, depth + 1);
        if (found) return found;
      } catch (_) {}
    }
    return null;
  }

  function ensureFakeRow() {
    if (fakeRow && fakeRow.isConnected) return fakeRow;
    fakeRow = document.createElement("div");
    fakeRow.id = "ppb52FakeRow";
    fakeRow.hidden = true;
    fakeRow.innerHTML = [
      '<input data-f="style">',
      '<input data-f="colour">',
      '<input data-f="sku">',
      '<input data-f="sourceType">',
      '<input data-f="sourceRef">',
    ].join("");
    document.body.appendChild(fakeRow);
    fakeRow.addEventListener("input", scheduleApply);
    fakeRow.addEventListener("change", scheduleApply);
    return fakeRow;
  }

  function fake(field) {
    return ensureFakeRow().querySelector('[data-f="' + field + '"]');
  }

  function setFake(field, value) {
    const el = fake(field);
    if (el) el.value = value || "";
  }

  function ensurePaperStyle(pd) {
    if (!pd || !pd.head || pd.getElementById("ppb52Style")) return;
    const style = pd.createElement("style");
    style.id = "ppb52Style";
    style.textContent = `
      #rows td.ppb52StyleCell{position:relative!important;padding-right:4.2mm!important}
      .ppb52InventoryBtn{position:absolute!important;right:.45mm!important;top:50%!important;transform:translateY(-50%)!important;width:3.1mm!important;height:3.1mm!important;min-width:0!important;padding:0!important;margin:0!important;border:.18mm solid #8eaaa0!important;border-radius:50%!important;background:#eef6f1!important;cursor:pointer!important;z-index:30!important;line-height:1!important}
      .ppb52InventoryBtn::after{content:'⌕';display:block;color:#245a43;font-size:7pt;font-weight:900;line-height:2.6mm;text-align:center}
      .ppb52InventoryBtn:hover,.ppb52InventoryBtn:focus{background:#dceee4!important;border-color:#39745a!important;outline:none!important}
      #rows tr.ppb52Picked td:nth-child(3){box-shadow:inset 0 0 0 .25mm rgba(52,119,82,.45)!important;background:rgba(226,243,233,.28)!important}
      @media print{.ppb52InventoryBtn{display:none!important}#rows td.ppb52StyleCell{padding-right:0!important}#rows tr.ppb52Picked td:nth-child(3){box-shadow:none!important;background:transparent!important}}
    `;
    pd.head.appendChild(style);
  }

  function decoratePaper(pd) {
    if (!pd || !pd.querySelector("#rows")) return;
    ensurePaperStyle(pd);
    const rows = Array.from(pd.querySelectorAll("#rows tr"));
    rows.forEach((tr, index) => {
      const cells = tr.children;
      const styleCell = cells && cells[2];
      const colourCell = cells && cells[3];
      if (!styleCell || styleCell.dataset.ppb52Bound) return;
      styleCell.dataset.ppb52Bound = "1";
      styleCell.classList.add("ppb52StyleCell");

      const button = pd.createElement("button");
      button.type = "button";
      button.className = "ppb52InventoryBtn";
      button.contentEditable = "false";
      button.setAttribute("aria-label", "Search Warehouse OS inventory");
      button.title = "Search Warehouse OS inventory";
      button.dataset.ppb52Row = String(index);
      button.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openForRow(tr);
      });
      styleCell.appendChild(button);

      const autoOpen = () => {
        if (applying) return;
        clearTimeout(typingTimer);
        const query = [plainCellText(styleCell), plainCellText(colourCell)]
          .filter(Boolean)
          .join(" ");
        if (query.length < 2) return;
        typingTimer = setTimeout(() => openForRow(tr), 520);
      };
      styleCell.addEventListener("input", autoOpen);
      colourCell?.addEventListener("input", autoOpen);
      styleCell.addEventListener("dblclick", (e) => {
        if (e.target === button) return;
        openForRow(tr);
      });
    });
  }

  function plainCellText(cell) {
    if (!cell) return "";
    let text = "";
    cell.childNodes.forEach((node) => {
      if (node.nodeType === 3) text += node.textContent || "";
      else if (node.nodeType === 1 && !node.classList?.contains("ppb52InventoryBtn"))
        text += node.innerText || node.textContent || "";
    });
    return str(text);
  }

  function writePaperCell(cell, value) {
    if (!cell) return;
    const button = cell.querySelector?.(".ppb52InventoryBtn");
    Array.from(cell.childNodes).forEach((node) => {
      if (node !== button) node.remove();
    });
    if (value) cell.insertBefore(cell.ownerDocument.createTextNode(value), button || null);
    cell.dispatchEvent(new Event("input", { bubbles: true }));
    cell.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function openForRow(tr) {
    if (!tr || !tr.isConnected) return;
    const api = window[PICKER];
    if (!api) {
      setTimeout(() => openForRow(tr), 250);
      return;
    }
    api.install?.();
    activePaperRow = tr;
    activePaperDoc = tr.ownerDocument;
    const cells = tr.children;
    const style = plainCellText(cells[2]);
    const colour = plainCellText(cells[3]);
    const query = [style, colour].filter(Boolean).join(" ");

    setFake("style", style);
    setFake("colour", colour);
    setFake("sku", "");
    setFake("sourceType", "");
    setFake("sourceRef", "");

    const row = ensureFakeRow();
    row.setAttribute("data-po-native-row", "1");
    api.open?.();
    row.removeAttribute("data-po-native-row");

    setTimeout(() => {
      const q = document.getElementById("sip72q");
      if (!q) return;
      q.value = query;
      q.dispatchEvent(new Event("input", { bubbles: true }));
      q.focus();
    }, 0);
  }

  function scheduleApply(e) {
    if (!activePaperRow || !activePaperRow.isConnected) return;
    if (!e?.target?.matches?.('[data-f="style"],[data-f="colour"],[data-f="sourceRef"]')) return;
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applySelection, 80);
  }

  function applySelection() {
    if (!activePaperRow || !activePaperRow.isConnected) return;
    const style = str(fake("style")?.value);
    const colour = str(fake("colour")?.value);
    const sourceRef = str(fake("sourceRef")?.value);
    if (!style && !colour && !sourceRef) return;

    const cells = activePaperRow.children;
    applying = true;
    try {
      if (style) writePaperCell(cells[2], style);
      if (colour) writePaperCell(cells[3], colour);
      if (sourceRef) writePaperCell(cells[4], sourceRef);
      activePaperRow.classList.add("ppb52Picked");
      activePaperRow.dataset.ppb52Inventory = sourceRef || style;
      if (cells[2])
        cells[2].title = sourceRef
          ? "Warehouse OS: " + sourceRef
          : "Warehouse OS inventory selected";
    } finally {
      applying = false;
    }
  }

  function scan() {
    try {
      const pd = deepestPaperDoc(window, 0);
      if (pd) {
        if (pd !== lastPaperDoc) {
          lastPaperDoc = pd;
          activePaperDoc = pd;
        }
        decoratePaper(pd);
      }
    } catch (error) {
      console.warn("PO Paper Inventory Bridge scan:", error?.message || error);
    }
  }

  function install() {
    ensureFakeRow();
    [120, 350, 700, 1200, 2000].forEach((ms) => setTimeout(scan, ms));
    setInterval(scan, 1200);
    outer?.addEventListener("load", () => {
      [120, 400, 900, 1600].forEach((ms) => setTimeout(scan, ms));
    });
  }

  window.RUNLUPOPaperInventoryBridgeV052 = {
    install,
    scan,
    open: () => {
      const pd = deepestPaperDoc(window, 0);
      const first = pd?.querySelector("#rows tr");
      if (first) openForRow(first);
    },
  };

  install();
})();
