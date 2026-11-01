/**
 * RUNLU carpet planning prototype — isolated from production apps.
 * Units: feet for lengths, square feet for areas.
 * No automatic installation allowances or manufacturer defaults.
 */
export const RULES_VERSION = "0.1.0-draft";

function positive(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(name + " must be a positive finite number");
  }
  return value;
}

export function squareFeetToSquareYards(squareFeet) {
  if (typeof squareFeet !== "number" || !Number.isFinite(squareFeet) || squareFeet < 0) {
    throw new RangeError("squareFeet must be a nonnegative finite number");
  }
  return squareFeet / 9;
}

export function squareYardsToSquareFeet(squareYards) {
  if (typeof squareYards !== "number" || !Number.isFinite(squareYards) || squareYards < 0) {
    throw new RangeError("squareYards must be a nonnegative finite number");
  }
  return squareYards * 9;
}

/**
 * Checks one rectangular piece against one roll, without seaming.
 * All allowances are explicit; a missing required pattern repeat is not assumed zero.
 * This is a geometric feasibility check, NOT an installation recommendation.
 */
export function checkSingleCut({
  usableWidthFt, remainingLengthFt, pieceWidthFt, pieceLengthFt,
  widthAllowanceFt = 0, lengthAllowanceFt = 0,
  orientation = "fixed", patternMatchRequired = false,
  patternRepeatFt
}) {
  [usableWidthFt, remainingLengthFt, pieceWidthFt, pieceLengthFt].forEach(
    (v, i) => positive(v, ["usableWidthFt", "remainingLengthFt", "pieceWidthFt", "pieceLengthFt"][i])
  );
  for (const [name, value] of Object.entries({ widthAllowanceFt, lengthAllowanceFt })) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError(name + " must be a nonnegative finite number");
    }
  }
  if (!["fixed", "rotation-allowed"].includes(orientation)) {
    throw new RangeError("orientation must be fixed or rotation-allowed");
  }
  if (patternMatchRequired && (patternRepeatFt === undefined || patternRepeatFt === null)) {
    return { feasible: null, reason: "needs-product-pattern-repeat" };
  }
  if (patternRepeatFt !== undefined && patternRepeatFt !== null) positive(patternRepeatFt, "patternRepeatFt");
  const options = [[pieceWidthFt, pieceLengthFt, false]];
  if (orientation === "rotation-allowed") options.push([pieceLengthFt, pieceWidthFt, true]);
  for (const [width, length, rotated] of options) {
    const requiredWidthFt = width + widthAllowanceFt;
    // Pattern matching allowance must be provided separately by a product-specific rule.
    const requiredLengthFt = length + lengthAllowanceFt;
    if (requiredWidthFt <= usableWidthFt && requiredLengthFt <= remainingLengthFt) {
      return { feasible: true, rotated, requiredWidthFt, requiredLengthFt };
    }
  }
  return { feasible: false, reason: "dimensions-exceed-available-roll" };
}

export function checkDyeLotCompatibility(lots, { allowMixedLots = false } = {}) {
  if (!Array.isArray(lots) || lots.length === 0 || lots.some(x => typeof x !== "string" || !x.trim())) {
    throw new TypeError("lots must be a nonempty array of nonblank dye-lot strings");
  }
  const distinct = [...new Set(lots.map(x => x.trim()))];
  return { compatible: allowMixedLots || distinct.length === 1, distinctLots: distinct };
}
