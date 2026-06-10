## Context

The current frontend provides a Monaco-based DBML editor, syntax highlighting, debounced validation, and diagnostics at `/editor`. The next capability is a visual ERD preview for the same document.

The renderer must support column-level relationships. A single table may contain many columns and many refs, so relation edges cannot attach to a generic table-level point. Edges need stable source and target ports aligned with the related column rows.

The implementation will stay in the existing `pages/editor` slice because the diagram is only used by the editor route in this change. This follows the FSD "start simple, extract when reused" rule. A later `/viewer` route or embedded renderer can trigger extraction into `widgets/` or lower layers.

## Goals / Non-Goals

**Goals:**

- Render a DBML diagram preview inside `/editor` for valid DBML.
- Represent parsed DBML entities separately from diagram rendering entities.
- Reuse `@dbml/core` model types for parsed entities where available.
- Build `DbmlDiagram*` entities that wrap parsed entities and add renderer metadata only when needed.
- Use ELK for automatic table placement, fixed-order column ports, and orthogonal edge routing.
- Use React Flow as the interactive rendering shell for custom table nodes, custom routed edges, pan, zoom, and fit view.
- Keep ELK and React Flow adapter types from leaking into DBML parsing or diagram domain code.
- Structure expensive diagram work so it can be memoized, deferred, or lazy-loaded as the app grows.

**Non-Goals:**

- Persisting user-adjusted table positions.
- Manual layout editing or saved layout sync.
- Image, SVG, PDF, or SQL export.
- Backend parsing, backend layout, authentication, or collaboration.
- Complete visual support for every DBML construct such as notes, enums, table groups, sticky notes, and diagram views.
- Extracting a reusable `widgets/dbml-diagram` slice before the diagram is used outside `/editor`.

## Decisions

### Keep the diagram implementation inside `pages/editor`

The diagram is introduced as part of the editor workspace and has a single known consumer. The code will live under `frontend/src/pages/editor` with domain-specific files:

```text
frontend/src/pages/editor/
  model/
    dbml-entities.ts
    dbml-diagram.ts
    dbml-layout.ts
  lib/
    parse-dbml-document.ts
    create-dbml-diagram.ts
    layout-dbml-diagram.ts
    map-dbml-diagram-flow.ts
  ui/
    DbmlDiagramPreview.tsx
    DbmlTableNode.tsx
    DbmlRelationEdge.tsx
```

This avoids speculative `widgets/`, `features/`, or `entities/` layers. If the renderer is reused by another route, the slice can be extracted with a clearer public API.

Alternative considered: create `widgets/dbml-diagram` immediately. Rejected because FSD discourages reusable layers before actual reuse, and the editor-specific preview state would make the boundary premature.

### Separate parsed DBML entities from DBML diagram entities

Parsed entities come from `@dbml/core` and retain DBML semantics:

```ts
type DbmlDatabase = Database
type DbmlTable = Table
type DbmlColumn = Field
type DbmlRef = Ref
type DbmlEndpoint = Endpoint
```

Diagram entities wrap parsed entities only when rendering metadata is needed:

```ts
type DbmlDiagramTable = {
  id: string
  source: DbmlTable
  columns: DbmlDiagramColumn[]
  ports: DbmlDiagramPort[]
  size: DbmlDiagramSize
}
```

The parsed entity is never mutated with diagram ids, port ids, coordinates, or dimensions. This keeps DBML interpretation independent from layout and rendering.

Alternative considered: convert parsed DBML into plain copied DTOs. Rejected for MVP because it duplicates parser data and loses direct access to parser-provided model details.

### Treat ELK as the layout and routing engine

ELK receives renderer-independent `DbmlDiagram` data converted into an ELK graph:

```text
DbmlDiagramTable -> ELK node
DbmlDiagramPort  -> ELK port
DbmlDiagramRelation -> ELK edge
```

ELK is responsible for:

- table `x` and `y` positions
- table spacing and layer spacing
- fixed-order column port handling
- orthogonal edge routing
- routed edge sections and bend points

Initial layout options:

```ts
{
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.portConstraints': 'FIXED_ORDER',
  'elk.spacing.nodeNode': '48',
  'elk.layered.spacing.nodeNodeBetweenLayers': '96',
  'elk.spacing.edgeEdge': '12',
  'elk.spacing.portPort': '8',
}
```

Alternative considered: use React Flow's built-in edge routing only. Rejected because column-heavy ERDs need port-aware edge routes and stable column attachment points.

### Treat React Flow as the rendering and interaction layer

React Flow consumes layout results and renders:

- custom table nodes
- column row handles using stable port ids
- custom relation edges from ELK route sections
- pan, zoom, fit view, and viewport interactions

React Flow does not parse DBML, compute graph layout, decide column relationships, or mutate diagram entities. The adapter boundary converts layouted diagram data into React Flow nodes and edges.

Alternative considered: render SVG directly. Rejected for MVP because React Flow provides interaction infrastructure that would otherwise need to be built manually.

### Preserve editor responsiveness

Diagram construction and layout are derived from debounced, valid DBML rather than raw keystrokes. The UI should keep the last valid diagram visible while invalid DBML diagnostics are present, with a preview-paused state.

React performance constraints:

- derive diagram state with memoized inputs instead of effect-driven derived state where possible
- avoid inline component definitions in render paths
- use stable node and edge ids
- keep heavy imports isolated so diagram dependencies can be lazy-loaded later if bundle size becomes a bottleneck
- avoid re-running ELK layout on unchanged source

Alternative considered: recompute diagram layout on every Monaco change. Rejected because layout can become expensive and would degrade typing responsiveness.

## Risks / Trade-offs

- [Risk] Frontend bundle size increases due to React Flow and ELK. → Mitigation: isolate diagram modules and avoid broad barrel imports; consider lazy loading the diagram preview during implementation if build output grows materially.
- [Risk] ELK and React Flow coordinate systems may not align cleanly for custom routed edges. → Mitigation: introduce a dedicated adapter and tests around port ids, positions, and edge path mapping.
- [Risk] `@dbml/core` model classes may change shape across versions. → Mitigation: keep parsed entity aliases and extraction logic behind `createDbmlDiagram()`, with unit tests covering expected parser output.
- [Risk] Complex DBML can make layout slow. → Mitigation: run layout only for debounced valid documents and keep future web worker extraction possible by separating pure transformation/layout functions from React components.
- [Risk] Keeping the last valid diagram visible can confuse users while the current DBML is invalid. → Mitigation: show a visible preview-paused state whenever diagnostics prevent preview refresh.
