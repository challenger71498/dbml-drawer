## Why

Offscreen relation proxy cards can currently overlap each other, active nodes, or fixed preview controls because collision handling is applied through multiple greedy passes. This makes proxy placement unstable in dense relation contexts and can cause cards to jump when viewport or obstacle conditions change.

## What Changes

- Add a selectable offscreen relation proxy collision layout mode so the existing legacy behavior can remain available while a new collision strategy is introduced.
- Introduce iterative and score proxy collision strategies that treat safe areas and active nodes as placement constraints before resolving proxy-proxy overlaps.
- Keep proxy placement modes (`line` and `parallel`) and transition modes independent from the collision strategy.
- Add regression tests for safe area avoidance, active node avoidance, proxy-proxy overlap resolution, and legacy/new strategy selection.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-diagram-preview`: Offscreen relation proxy layout shall support selectable collision strategies and shall provide iterative and score strategies that avoid safe areas, other active nodes, and other proxy cards where feasible.

## Impact

- Affected code: `frontend/src/pages/editor/lib/dbml-diagram-flow-proxy/*`, editor proxy settings/types, and focused proxy layout tests.
- Runtime dependencies: none planned.
- User-facing behavior: no forced migration; legacy collision handling remains selectable while the new strategy can be opted into.
