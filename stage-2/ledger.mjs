// Offline integer-cent ledger. In-memory demonstration, NOT a durable transaction store.
export class BudgetLedger {
  #records = new Map();
  create(id, budgetCents) {
    if(typeof id !== 'string' || !id || this.#records.has(id)) throw Error('Duplicate or invalid id');
    if(!Number.isSafeInteger(budgetCents) || budgetCents <= 0) throw Error('Invalid budget');
    this.#records.set(id, { budgetCents, spentCents: 0, reservations: new Map(), events: [] });
  }
  reserve(id, attemptId, cents) {
    const r = this.#get(id);
    if(typeof attemptId !== 'string' || !attemptId || r.reservations.has(attemptId)) throw Error('Duplicate attempt');
    if(!Number.isSafeInteger(cents) || cents <= 0) throw Error('Invalid reservation');
    const outstanding = [...r.reservations.values()].reduce((n, v) => n + v, 0);
    if(r.spentCents + outstanding + cents > r.budgetCents) throw Error('Budget exceeded');
    r.reservations.set(attemptId, cents);
    r.events.push({ type: 'RESERVE', attemptId, cents });
  }
  settle(id, attemptId, actualCents) {
    const r = this.#get(id), reserved = r.reservations.get(attemptId);
    if(reserved === undefined) throw Error('Unknown reservation');
    if(!Number.isSafeInteger(actualCents) || actualCents < 0 || actualCents > reserved) throw Error('Billing requires reconciliation');
    r.spentCents += actualCents;
    r.reservations.delete(attemptId);
    r.events.push({ type: 'SETTLE', attemptId, cents: actualCents });
  }
  // Unknown billing must remain reserved until externally reconciled.
  snapshot(id) {
    const r = this.#get(id);
    return { budgetCents: r.budgetCents, spentCents: r.spentCents,
      reservedCents: [...r.reservations.values()].reduce((n, v) => n + v, 0),
      pendingAttemptIds: [...r.reservations.keys()], events: structuredClone(r.events) };
  }
  #get(id) { const r = this.#records.get(id); if(!r) throw Error('Unknown job'); return r; }
}
