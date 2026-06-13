## 1. Flow Adapter Rename

- [x] 1.1 Rename `frontend/src/pages/editor/lib/map-dbml-diagram-flow.ts` to `frontend/src/pages/editor/lib/dbml-diagram-flow.ts`.
- [x] 1.2 Update imports in editor UI, edge rendering, tests, and app tests to use `dbml-diagram-flow`.
- [x] 1.3 Verify the renamed adapter still exports the base DBML diagram flow types and `mapDbmlDiagramToFlow`.

## 2. Proxy Flow Extension Module

- [x] 2.1 Create `frontend/src/pages/editor/lib/dbml-diagram-flow-proxy/` with an `index.ts` public entry point.
- [x] 2.2 Move offscreen proxy candidate selection from `model/dbml-offscreen-relation-proxies.ts` into the proxy flow extension module.
- [x] 2.3 Move proxy card metrics, placement, obstacle generation, collision/stack geometry, and transition logic into focused proxy extension files.
- [x] 2.4 Move proxy relation endpoint and flow element adaptation logic out of `DbmlDiagramPreview.tsx` into the proxy extension module.
- [x] 2.5 Add a single proxy flow state facade that composes proxy candidates, layouts, transitions, edge endpoint overrides, and original node opacity changes.

## 3. Proxy Overlay UI

- [x] 3.1 Extract `OffscreenRelationProxyOverlay` and proxy content JSX from `DbmlDiagramPreview.tsx` into `frontend/src/pages/editor/ui/DbmlDiagramFlowProxyOverlay.tsx`.
- [x] 3.2 Keep overlay event behavior for proxy activation, table focus, column focus, and relation hover unchanged.
- [x] 3.3 Keep proxy CSS class usage and visual structure compatible with existing table node styling.

## 4. Preview Composition

- [x] 4.1 Replace inline proxy orchestration in `DbmlDiagramPreview.tsx` with the proxy flow state facade.
- [x] 4.2 Ensure disabled proxy settings skip proxy-specific flow element overrides and overlay rendering.
- [x] 4.3 Ensure enabled proxy settings pass adapted flow elements to React Flow and render the extracted proxy overlay outside the React Flow node list.

## 5. Tests and Verification

- [x] 5.1 Move existing offscreen proxy tests to the new module paths and keep their current assertions passing.
- [x] 5.2 Add or update tests for proxy flow element endpoint overrides and original node opacity adaptation.
- [x] 5.3 Add or update preview tests to verify proxy overlay rendering remains outside React Flow nodes.
- [x] 5.4 Run the frontend test and typecheck commands relevant to the refactor.
