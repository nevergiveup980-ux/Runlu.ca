// RUNLU Research 001 / Experiment 001
// Synthetic two-agent benchmark. No production dependencies.

const POLICIES = ["independent", "shared-rule", "correlation"];

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296);
}

function observe(world, r) {
  // Each agent receives noisy private evidence of whether GO is safe.
  const accuracy = 0.72;
  const truth = world.safe;
  const a = r() < accuracy ? truth : !truth;
  const b = r() < accuracy ? truth : !truth;
  return { a, b };
}

function decide(policy, obs, sharedBit, agent) {
  if (policy === "independent") return obs ? "GO" : "STOP";
  if (policy === "shared-rule") return obs ? "GO" : "STOP";
  // Correlation fallback: ambiguous/private evidence is coordinated by a
  // pre-agreed bit. This is classical and deliberately simple for baseline 001.
  if (!obs) return "STOP";
  return sharedBit === 1 ? "GO" : (agent === "A" ? "STOP" : "STOP");
}

function score(world, a, b) {
  const disagreement = a !== b;
  const unsafe = !world.safe && (a === "GO" || b === "GO");
  const success = world.safe && a === "GO" && b === "GO";
  const deadlock = world.safe && a === "STOP" && b === "STOP";
  return { disagreement, unsafe, success, deadlock };
}

export function runExperiment({ trials = 100000, seed = 20260920 } = {}) {
  const r = rng(seed);
  const out = {};
  for (const policy of POLICIES) {
    const m = { trials: 0, disagreement: 0, unsafe: 0, success: 0, deadlock: 0 };
    for (let i = 0; i < trials; i++) {
      const world = { safe: r() < 0.65 };
      const o = observe(world, r);
      const sharedBit = r() < 0.70 ? 1 : 0;
      const a = decide(policy, o.a, sharedBit, "A");
      const b = decide(policy, o.b, sharedBit, "B");
      const s = score(world, a, b);
      m.trials++;
      for (const k of ["disagreement","unsafe","success","deadlock"]) if (s[k]) m[k]++;
    }
    out[policy] = Object.fromEntries(Object.entries(m).map(([k,v]) =>
      k === "trials" ? [k,v] : [k, +(v / trials).toFixed(6)]
    ));
  }
  return { experiment: "RUNLU-R001-E001", seed, trials, results: out };
}

if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("simulator.js")) {
  console.log(JSON.stringify(runExperiment(), null, 2));
}
