# Experiment 003 — Complementary Action

## Question
Can a pre-shared classical correlation variable help two agents produce complementary actions (one GO, one YIELD) without communication?

## Warehouse-inspired abstraction
Two agents approach a constrained shared zone. Exactly one should proceed. A hidden state says which agent has priority. Each agent gets only a noisy private indication of its own priority status.

## Policies
- Independent: GO if local observation says priority; otherwise YIELD.
- Fixed role: A always GO, B always YIELD.
- Correlated tiebreak: local positive evidence permits GO; otherwise a pre-shared classical bit designates a GO role.

## Metrics
Correct priority resolution, complementary-action rate, collision rate, and deadlock rate.

## Scientific warning
The first correlated-tiebreak policy is intentionally simple and may perform poorly because an agent cannot know whether the other agent received conflicting evidence. A negative result is informative: correlation is not automatically useful merely because complementary actions are required.

No production Warehouse OS data is read or written.
