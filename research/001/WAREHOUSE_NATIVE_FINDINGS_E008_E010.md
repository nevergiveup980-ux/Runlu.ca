# Warehouse-Native Findings — E008 to E010

## Exact enumeration result

The finite policy spaces were independently checked with exact enumeration over all four urgency-input states.

| Resource class | Policies | Perfect policies* |
|---|---:|---:|
| R0 local deterministic | 16 | 0 |
| R1A one bit A -> B | 64 | 1 |
| R1B one bit B -> A | 64 | 1 |
| R2 full state | 256 | 4 |

*Perfect = conflict 0, deadlock 0, progress 1, urgent-priority satisfaction 1.

The attainable metric sets for R1A and R1B are identical, satisfying the symmetry invariant.

## Main finding

For this synthetic narrow-lane model, **one input-dependent communicated bit is sufficient to attain the same perfect operational metric tuple available under full state knowledge**:

conflict = 0  
deadlock = 0  
progress = 1  
urgent-priority = 1

By contrast, no zero-communication deterministic policy attains that tuple.

A zero-communication fixed-role policy can attain conflict=0, deadlock=0, progress=1, but its urgent-priority satisfaction is only 0.5. This cleanly identifies what the missing information is worth in this model.

## Example one-bit protocol

For A -> B, the perfect enumerated policy has ID [2,3]:
- A sends uA.
- A ENTERs iff uA=1.
- B's response table chooses the complementary safe action while using uA and uB so that the sole urgent mover receives priority.
- When urgencies are equal, the protocol uses a fixed safe role convention.

The B -> A benchmark has an equivalent symmetric solution.

## Interpretation

The first warehouse-native benchmark does not currently motivate Bell-style resources. Its central limitation is missing private state, and a single ordinary communicated urgency bit removes that limitation completely under the model.

This is an engineering result about the model, not yet a production Warehouse OS recommendation. Real deployment would still require timing, packet-loss, stale-state, fail-safe, human/vehicle safety, and adversarial/fault analysis.

## Research consequence

The next useful question is no longer whether shared randomness can replace communication here. It cannot convey the missing urgency bit. The next experiment should test how reliable that one-bit channel must be under loss, delay, corruption, and stale observations before a no-communication fallback becomes preferable.
