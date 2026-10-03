import { runExperiment } from "./simulator.js";

const accuracies = [0.55,0.60,0.65,0.70,0.72,0.75,0.80,0.85,0.90,0.95];
const rows = accuracies.map(accuracy => runExperiment({ trials: 100000, seed: 20260920, accuracy }));
console.log(JSON.stringify({ experiment:"RUNLU-R001-E001-SENSITIVITY", rows }, null, 2));
