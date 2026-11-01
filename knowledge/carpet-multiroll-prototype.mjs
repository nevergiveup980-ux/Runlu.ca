/**
 * Conservative multi-room / multi-roll planner prototype.
 * Each rectangular room cut consumes the FULL usable width of one roll for
 * its required length. This deliberately does not optimize side-by-side cuts,
 * reuse offcuts, or solve seams/pattern matching.
 * Dimensions in feet. Never connected to production.
 */
import { checkSingleCut } from "./carpet-rules-prototype.mjs";

export function allocateFullWidthCuts({ rolls, rooms, allowMixedLots = false }) {
  if (!Array.isArray(rolls) || !rolls.length || !Array.isArray(rooms) || !rooms.length) {
    throw new TypeError("nonempty rolls and rooms arrays required");
  }
  const seen = new Set();
  const available = rolls.map((r) => {
    if (!r || typeof r.id !== "string" || !r.id.trim() || seen.has(r.id)) {
      throw new TypeError("roll ids must be unique nonblank strings");
    }
    seen.add(r.id);
    if (typeof r.dyeLot !== "string" || !r.dyeLot.trim()) throw new TypeError("dyeLot required");
    for (const k of ["usableWidthFt", "remainingLengthFt"]) {
      if (typeof r[k] !== "number" || !Number.isFinite(r[k]) || r[k] <= 0) {
        throw new RangeError(k + " must be positive");
      }
    }
    return { ...r, remainingLengthFt: r.remainingLengthFt };
  });
  const ids = new Set();
  const cuts = rooms.map((r) => {
    if (!r || typeof r.id !== "string" || !r.id.trim() || ids.has(r.id)) {
      throw new TypeError("room ids must be unique nonblank strings");
    }
    ids.add(r.id);
    // Reject unknown patterns instead of pretending no pattern waste.
    if (r.patternMatchRequired) return { id:r.id, status:"needs-pattern-plan" };
    // Validate dimensions and allowances before allocation.
    checkSingleCut({
      usableWidthFt: Number.MAX_VALUE, remainingLengthFt: Number.MAX_VALUE,
      pieceWidthFt:r.widthFt, pieceLengthFt:r.lengthFt,
      widthAllowanceFt:r.widthAllowanceFt ?? 0,
      lengthAllowanceFt:r.lengthAllowanceFt ?? 0,
      orientation:r.orientation ?? "fixed"
    });
    return { ...r, status:"pending" };
  });
  const assigned = [], unassigned = [];
  let selectedLot = null;
  // First-fit, input order, no claim of globally optimal allocation.
  for (const cut of cuts) {
    if (cut.status === "needs-pattern-plan") {
      unassigned.push({ roomId:cut.id, reason:"needs-pattern-plan" });
      continue;
    }
    let match = null;
    for (const roll of available) {
      if (!allowMixedLots && selectedLot !== null && roll.dyeLot !== selectedLot) continue;
      const fit = checkSingleCut({
        usableWidthFt:roll.usableWidthFt, remainingLengthFt:roll.remainingLengthFt,
        pieceWidthFt:cut.widthFt, pieceLengthFt:cut.lengthFt,
        widthAllowanceFt:cut.widthAllowanceFt ?? 0,
        lengthAllowanceFt:cut.lengthAllowanceFt ?? 0,
        orientation:cut.orientation ?? "fixed"
      });
      if (fit.feasible) { match={roll,fit}; break; }
    }
    if (!match) {
      unassigned.push({roomId:cut.id,reason:"no-compatible-full-width-roll"});
      continue;
    }
    const {roll,fit}=match;
    if (selectedLot === null) selectedLot = roll.dyeLot;
    roll.remainingLengthFt -= fit.requiredLengthFt;
    assigned.push({
      roomId:cut.id, rollId:roll.id, dyeLot:roll.dyeLot,
      rotated:fit.rotated, consumedLengthFt:fit.requiredLengthFt,
      consumedAreaSf:roll.usableWidthFt * fit.requiredLengthFt,
      cutAreaSf:fit.requiredWidthFt * fit.requiredLengthFt
    });
  }
  return {
    algorithm:"first-fit-full-width-v0.1",
    complete:unassigned.length===0,
    assigned, unassigned,
    rolls:available.map(r=>({id:r.id,dyeLot:r.dyeLot,remainingLengthFt:r.remainingLengthFt})),
    limitations:["No side-by-side packing","No seam layout","No pattern matching","No offcut reuse","No global optimization"]
  };
}
