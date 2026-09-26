// RUNLU Research 001 / Experiment 001
// Paired synthetic two-agent benchmark. No production dependencies.

const POLICIES = ["independent", "shared-rule", "correlation"];

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296);
}

function makeScenarios(trials, seed, accuracy = 0.72) {
  const r = rng(seed);
  const scenarios = [];
  for (let i = 0; i < trials; i++) {
    const safe = r() < 0.65;
    const aObs = r() < accuracy ? safe : !safe;
    const bObs = r() < accuracy ? safe : !safe;
    // Pre-shared classical correlation variable, sampled before decisions.
    const sharedBit = r() < 0.70 ? 1 : 0;
    scenarios.push({ safe, aObs, bObs, sharedBit });
  }
  return scenarios;
}

function decide(policy, obs, sharedBit) {
  if (policy === "independent") return obs ? "GO" : "STOP";

  // A genuinely different conservative common fallback baseline.
  // It sacrifices throughput whenever communication is unavailable.
  if (policy === "shared-rule") return "STOP";

  // Classical correlated fallback baseline: local positive evidence is necessary,
  // and the pre-shared bit gates GO for both agents.
  if (!obs) return "STOP";
  return sharedBit ? "GO" : "STOP";
}

function score(world, a, b) {
  return {
    disagreement: a !== b,
    unsafe: !world.safe && (a === "GO" || b === "GO"),
    success: world.safe && a === "GO" && b === "GO",
    deadlock: world.safe && a === "STOP" && b === "STOP"
  };
}

export function runExperiment({ trials = 100000, seed = 20260920, accuracy = 0.72 } = {}) {
  // Critical fairness rule: every policy is evaluated on the exact same trials.
  const scenarios = makeScenarios(trials, seed, accuracy);
  const out = {};

  for (const policy of POLICIES) {
    const m = { trials: 0, disagreement: 0, unsafe: 0, success: 0, deadlock: 0 };
    for (const x of scenarios) {
      const a = decide(policy, x.aObs, x.sharedBit);
      const b = decide(policy, x.bObs, x.sharedBit);
      const s = score(x, a, b);
      m.trials++;
      for (const k of ["disagreement","unsafe","success","deadlock"]) if (s[k]) m[k]++;
    }
    out[policy] = Object.fromEntries(Object.entries(m).map(([k,v]) =>
      k === "trials" ? [k,v] : [k, +(v / trials).toFixed(6)]
    ));
  }

  return {
    experiment: "RUNLU-R001-E001",
    design: "paired",
    seed, trials, accuracy,
    results: out
  };
}

if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("simulator.js")) {
  console.log(JSON.stringify(runExperiment(), null, 2));
}
