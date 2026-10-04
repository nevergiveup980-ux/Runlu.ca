# E025 — Local-Classical Impossibility Proof

Let A(x), B(y) be binary ENTER decisions for local states x,y in {0,1}.

Zero conflict and zero deadlock require exactly one ENTER for every input pair:

A(x) XOR B(y) = 1 for all x,y.

Fix y=0. Then A(0)=A(1), because both must be the complement of B(0).
Fix x=0. Then B(0)=B(1), because both must be the complement of A(0).

Thus both response functions are constant. The only zero-conflict/zero-deadlock deterministic solutions are the two fixed-role policies:
A always ENTER/B always WAIT, or the reverse.

When exactly one side is TIGHT and the two unequal states are symmetric, either fixed role chooses the TIGHT side in exactly one of the two cases. Therefore tight-priority=1/2.

A randomized classical strategy is a convex mixture of deterministic strategies. Since conflict and deadlock are nonnegative, a mixture with expected conflict=deadlock=0 can place positive weight only on deterministic zero-conflict/zero-deadlock strategies. Both such strategies have tight-priority=1/2, so every such mixture also has tight-priority=1/2.

Hence no local-classical strategy can attain:
(conflict, deadlock, tight-priority)=(0,0,1).
