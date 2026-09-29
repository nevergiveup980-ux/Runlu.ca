# Experiment 096 — Multi-Layer Dependency Hypergraph

## Purpose
E095 treated each observer as belonging to one critical-root cluster. E096 removes that simplification. An observer may simultaneously share calibration, preprocessing software, and training/label provenance with different peers.

## Model
Create a bipartite provenance graph:
OBSERVER <-> DEPENDENCY_ROOT

Root layers:
CALIBRATION
SOFTWARE
LABEL_SOURCE

Two observers are dependency-connected when a path exists through any declared critical root. Connected components expose bridge observers that merge apparently separate single-layer clusters.

## Caution
Connectivity means a declared pathway for correlated failure exists. It does not mean every failure propagates across every edge, nor that all connected evidence is identical.
