## Context

The editor preview currently has three related rendering domains:

- DBML diagram models in `pages/editor/model`, such as `DbmlDiagram` and `LayoutedDbmlDiagram`.
- React Flow adapter code in `pages/editor/lib/map-dbml-diagram-flow.ts`, which converts a layouted diagram into `Node` and `Edge` values.
- Offscreen relation proxy behavior, currently spread across `pages/editor/model/dbml-offscreen-relation-proxies.ts`, `pages/editor/model/dbml-offscreen-relation-proxy-layout.ts`, `pages/editor/model/dbml-offscreen-relation-proxy-transition.ts`, and `DbmlDiagramPreview.tsx`.

Offscreen relation proxies behave like a preview extension on top of React Flow. They are not React Flow nodes, but they depend on the React Flow viewport, mutate React Flow edge data through endpoint overrides, optionally adjust original node opacity, and render their own overlay above the React Flow canvas.

## Goals / Non-Goals

**Goals:**

- Treat offscreen relation proxies as a DBML diagram flow extension rather than core preview component logic.
- Rename `map-dbml-diagram-flow.ts` to `dbml-diagram-flow.ts` to make the React Flow adapter domain explicit.
- Move proxy calculation and flow element adaptation under `pages/editor/lib/dbml-diagram-flow-proxy`.
- Move proxy overlay JSX into a dedicated UI component while keeping visual behavior unchanged.
- Keep `DbmlDiagramPreview` focused on composing base flow elements, React Flow rendering, viewport synchronization, and extension rendering.
- Improve testability by making proxy candidate selection, placement, obstacle handling, transition, and flow element adaptation independently testable.

**Non-Goals:**

- Do not introduce a generic plugin registry or public plugin API.
- Do not change offscreen relation proxy settings, visibility rules, placement behavior, collision behavior, transition behavior, or interactions.
- Do not introduce new runtime dependencies.
- Do not move DBML source models or layout models out of the editor page slice.

## Decisions

### Use a flow extension module, not a plugin framework

Create a concrete `dbml-diagram-flow-proxy` module that receives the base DBML diagram flow state plus preview context and returns proxy flow state. This keeps the extension boundary explicit without adding a registry, lifecycle hooks, or generalized plugin ordering before there are multiple extensions.

Alternative considered: introduce a generic `DbmlDiagramFlowExtension` plugin interface. This was rejected for now because only one extension exists and a generic lifecycle would add abstraction before the second use case proves the shape.

### Keep proxy extension code in `pages/editor/lib`

Place the proxy extension under `pages/editor/lib/dbml-diagram-flow-proxy` because it adapts editor page data into rendering-specific flow state. The proxy state depends on `LayoutedDbmlDiagram`, React Flow viewport data, and React Flow edge endpoint overrides, so it is not a pure DBML model.

Alternative considered: split proxy code between `model/proxy` and `lib/proxy`. This was rejected because the current proxy exists only for the diagram preview rendering workflow, and splitting the domain would create parallel folders without a stable independent model boundary.

### Keep overlay rendering in `pages/editor/ui`

Move proxy JSX into a `DbmlDiagramFlowProxyOverlay` component under `pages/editor/ui`. The lib module should produce proxy layouts and flow element updates, while UI owns DOM structure, CSS classes, event binding, and accessibility labels.

Alternative considered: return React nodes from the proxy extension. This was rejected because it would make the lib adapter own UI rendering and blur the current FSD segment boundary.

### Split proxy internals by responsibility

Organize the proxy extension around small modules:

- `proxy.ts`: proxy candidate selection and represented relation/column content.
- `placement.ts`: initial line and parallel proxy placement.
- `obstacles.ts`: safe-area and active table obstacle generation.
- `collision.ts` or `screen-geometry.ts`: rectangle overlap, overlap area, clamp, and stack positioning primitives.
- `card-metrics.ts`: proxy card sizing.
- `transition.ts`: opacity and morph handoff state.
- `endpoints.ts`: proxy relation endpoint calculation.
- `flow-elements.ts`: React Flow edge endpoint override and original node opacity adaptation.
- `create-proxy-flow-state.ts`: facade that composes the above modules.

The facade should be the only function used by `DbmlDiagramPreview` for proxy calculations.

### Preserve current behavior before improving algorithms

The first refactor should be behavior-preserving. Collision or placement algorithm changes can follow after module boundaries and regression tests are in place.

## Risks / Trade-offs

- Behavior regression during file movement and extraction -> Mitigate with focused tests covering existing proxy visibility, placement, active-node avoidance, transition, endpoint override, and overlay interaction behavior.
- New module boundaries could still leak React Flow details too broadly -> Mitigate by confining React Flow-specific element mutation to `flow-elements.ts` and endpoint position types to `endpoints.ts`.
- `DbmlDiagramPreview` may remain large after extraction -> Mitigate by extracting overlay and proxy state first, then reassessing remaining preview responsibilities separately.
- Naming churn can cause noisy imports -> Mitigate by updating imports in one pass and exposing stable exports from `dbml-diagram-flow-proxy/index.ts`.

## Migration Plan

1. Rename `map-dbml-diagram-flow.ts` to `dbml-diagram-flow.ts` and update imports.
2. Create `pages/editor/lib/dbml-diagram-flow-proxy` and move proxy calculation modules into it without changing behavior.
3. Extract `DbmlDiagramFlowProxyOverlay` from `DbmlDiagramPreview`.
4. Replace inline proxy orchestration in `DbmlDiagramPreview` with a single proxy flow state composition call.
5. Move or expand tests to cover the extracted modules and run frontend quality checks.

## Open Questions

- Should the extension facade expose a single `createDbmlDiagramFlowProxyState` function or a hook-like `useDbmlDiagramFlowProxyState` wrapper for memoization in the UI layer?
- Should `screen-geometry.ts` remain private to the proxy extension until another editor flow feature needs it?
