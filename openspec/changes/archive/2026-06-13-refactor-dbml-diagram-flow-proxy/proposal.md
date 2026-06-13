## Why

Offscreen relation proxy behavior is currently split across model helpers and `DbmlDiagramPreview`, making proxy placement, collision handling, transition state, edge endpoint overrides, and overlay rendering difficult to reason about independently. Refactoring this into a DBML diagram flow proxy extension will reduce the preview component's responsibilities while preserving the existing proxy behavior.

## What Changes

- Rename the React Flow adapter from `map-dbml-diagram-flow.ts` to `dbml-diagram-flow.ts` so the file name represents the DBML diagram flow domain rather than only one mapping function.
- Move offscreen relation proxy calculations into a focused `dbml-diagram-flow-proxy` module under the editor page's flow adapter layer.
- Split proxy responsibilities into smaller units for proxy candidate selection, card metrics, placement, obstacle generation, collision/stack geometry, transition state, edge endpoint overrides, and flow element updates.
- Move proxy overlay JSX out of `DbmlDiagramPreview` into a dedicated UI component that renders proxy flow state.
- Keep the existing user-facing offscreen relation proxy behavior, settings, transitions, relation line rerouting, and interactions unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-diagram-preview`: Clarify that offscreen relation proxies are a diagram flow extension that may render an overlay outside React Flow nodes while preserving existing proxy behavior.

## Impact

- Affected frontend files include the editor diagram flow adapter, DBML diagram preview, offscreen relation proxy model helpers, proxy tests, and import paths for `DbmlDiagramFlowElements` and relation edge data types.
- No backend, persistence, API, or dependency changes are expected.
- No breaking user-facing behavior is intended.
