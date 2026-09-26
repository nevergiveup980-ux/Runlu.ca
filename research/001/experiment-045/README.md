# E045 Offline Calibration Runner

Run locally:

```bash
node research/001/experiment-045/calibrate.mjs research/001/experiment-045/sample.synthetic.jsonl
```

The sample file is synthetic and exists only to exercise the runner.

The program accepts JSONL or a simple comma-separated CSV with the E044 field names. It makes no network calls and writes nothing to production systems.

Treat outputs as calibration evidence only after E044 Phase 1 validates that the queue variables represent a real operational allocation decision.
