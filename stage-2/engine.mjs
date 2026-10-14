// RUNLU STAGE 2.0 — internal server-side decision engine.
// Never bundle this module, model prices, or provider credentials into public client code.
export const FORMATS = Object.freeze({
  cinematic: { maxSeconds: 180, motion: 1, label: "AI cinematic shots" },
  story: { maxSeconds: 900, motion: 0.35, label: "Narration and mixed-media story" },
  longform: { maxSeconds: 3600, motion: 0.08, label: "Chapter-based longform" }
});
export const QUALITY = Object.freeze({
  standard: { videoRateUsd: 0.05, overheadUsd: 0.7, retryMultiplier: 1.3 },
  enhanced: { videoRateUsd: 0.10, overheadUsd: 1.5, retryMultiplier: 1.5 },
  premium: { videoRateUsd: 0.40, overheadUsd: 3.5, retryMultiplier: 1.7 }
});
// Rates above are illustrative engineering fixtures, NOT verified supplier quotations.
// Prices and exchange rates must be fetched/maintained server-side before sales launch.
export function validateRequest(input) {
  const durationSeconds = Number(input?.durationSeconds);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 5 || durationSeconds > 3600) throw new Error("Duration must be 5–3600 seconds");
  if (!Object.hasOwn(QUALITY, input?.quality)) throw new Error("Unsupported quality");
  if (!Object.hasOwn(FORMATS, input?.format)) throw new Error("Unsupported format");
  if (durationSeconds > FORMATS[input.format].maxSeconds) throw new Error("Duration exceeds format limit");
  return { durationSeconds, quality: input.quality, format: input.format };
}
export function estimateInternalCost(input, settings) {
  const r = validateRequest(input);
  const q = QUALITY[r.quality], f = FORMATS[r.format];
  const usdToCad = Number(settings?.usdToCad);
  const audioCad = Number(settings?.audioCad ?? 0);
  const platformCad = Number(settings?.platformCad ?? 0);
  if (![usdToCad,audioCad,platformCad].every(Number.isFinite) || usdToCad <= 0 || audioCad < 0 || platformCad < 0) throw new Error("Invalid internal cost settings");
  const generatedSeconds = Math.ceil(r.durationSeconds * f.motion);
  const videoUsd = generatedSeconds * q.videoRateUsd * q.retryMultiplier;
  const estimatedCad = (videoUsd + q.overheadUsd) * usdToCad + audioCad + platformCad;
  return { ...r, generatedSeconds, estimatedCad: Number(estimatedCad.toFixed(2)), provisional: true };
}
export function quoteInternal(input, settings) {
  const cost = estimateInternalCost(input, settings);
  const minMargin = Number(settings.minGrossMargin);
  const competitorCad = Number(settings.competitorCad);
  const targetDiscount = Number(settings.targetDiscount);
  if (![minMargin,competitorCad,targetDiscount].every(Number.isFinite) || minMargin < 0 || minMargin >= 1 || targetDiscount < 0 || targetDiscount >= 1 || competitorCad <= 0) throw new Error("Invalid pricing settings");
  const floorCad = cost.estimatedCad / (1-minMargin);
  const competitiveCad = competitorCad * (1-targetDiscount);
  const eligible = competitiveCad >= floorCad;
  return { ...cost, floorCad: Number(floorCad.toFixed(2)), targetCad: Number(competitiveCad.toFixed(2)), eligible, status: eligible ? "INTERNAL_REVIEW" : "NOT_VIABLE", warning: "Simulation only. Not a customer price or purchase offer." };
}
// Only explicitly approved public fields may leave the server.
export function toPublicOffer(approved) {
  if (approved?.status !== "APPROVED" || !Number.isFinite(approved?.finalCad) || approved.finalCad <= 0) throw new Error("Quote not approved");
  return { currency: "CAD", price: Number(approved.finalCad.toFixed(2)), durationSeconds: approved.durationSeconds, quality: approved.quality, format: approved.format };
}
