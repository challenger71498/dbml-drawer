## Context

The editor page currently owns the DBML text, validation state, parsed diagram, layouted diagram, Monaco editor, and React Flow preview under `frontend/src/pages/editor`. Diagram rendering already distinguishes parsed DBML entities, DBML diagram entities, layouted diagram entities, and React Flow elements. Table and column diagram entities keep references to `@dbml/core` `Table` and `Field` objects, and those model types expose `token.start` and `token.end` source positions.

The new interaction crosses the diagram and editor surfaces: the user interacts with a rendered React Flow node, the diagram updates highlight/focus state, and Monaco moves the cursor to the corresponding DBML source definition. Per FSD, this remains page-local because the behavior is only used by `/editor` and does not yet justify a shared feature or entity layer.

## Goals / Non-Goals

**Goals:**

- Highlight hovered tables and their connected relation lines.
- Persist focus for clicked tables and connected relation lines.
- Highlight hovered columns and their connected relation lines.
- Persist focus for clicked columns and connected relation lines.
- Raise active nodes, column rows, and relation lines above inactive diagram elements.
- Move the Monaco cursor to the clicked table or column definition.
- Keep interaction state local, explicit, and testable.

**Non-Goals:**

- Persist focused table or column across reloads.
- Add multi-select or range selection.
- Add keyboard navigation for diagram selection.
- Add backend persistence or user-specific diagram selection settings.
- Rework the DBML parsing pipeline or introduce a global state manager.

## Decisions

### Keep selection state in `EditorPage`

The interaction state should be owned by the editor page because it coordinates two child surfaces: `DbmlDiagramPreview` and `DbmlCodeEditor`. The state model should distinguish transient hover from persistent focus:

- `hoveredTarget: DbmlDiagramSelectionTarget | null`
- `focusedTarget: DbmlDiagramSelectionTarget | null`

The active target used for styling should prefer hover over focus while hovering is present, then fall back to focus. This makes hover responsive without clearing the user's clicked focus.

Alternative considered: store selection inside `DbmlDiagramPreview`. That would simplify diagram rendering but would make Monaco source navigation an upward side effect or callback chain without a single owner for the combined editor experience.

### Model table and column targets explicitly

Use a small page-local model for selection targets:

- table target: `{ type: 'table', tableId }`
- column target: `{ type: 'column', tableId, columnId }`

Relation highlighting should be derived from the active target and the existing `LayoutedDbmlDiagramRelation` fields:

- table target matches relations whose `sourceTableId` or `targetTableId` equals the active table.
- column target matches relations whose `sourceColumnId` or `targetColumnId` equals the active column.

Alternative considered: store the set of active relation ids directly in state. Deriving keeps state minimal and avoids stale relation ids after document changes.

### Use `@dbml/core` token positions for source navigation

Table and column diagram entities already reference parsed `Table` and `Field` objects. These inherit a `token` with one-based `line` and `column` source coordinates and zero-based `offset` values. Cursor navigation should use the table source token for table header clicks and the column source token for column row clicks.

The editor component should expose a focused navigation API rather than leaking the full Monaco editor instance. A page-level ref can call something equivalent to:

- move cursor to start line/column
- reveal the position near the center of the editor
- focus Monaco

Alternative considered: derive source locations by scanning the raw DBML string. This is less reliable with quoted identifiers, schemas, comments, duplicate column names, and formatting differences. It can remain a fallback only if a token is missing.

### Pass callbacks and active metadata through React Flow data

`mapDbmlDiagramToFlow` should accept diagram interaction inputs and add them to node and edge data:

- active target
- hovered/focused status for table nodes
- active relation status for relation edges
- table and column event callbacks

`DbmlTableNode` should handle header/column hover and click events with those callbacks. `DbmlRelationEdge` should render active styles based on edge data. This keeps React Flow as the rendering engine and avoids direct DOM queries.

Alternative considered: use React Flow's built-in node selection state. It operates at node level and does not naturally represent column-level focus or editor cursor navigation, so custom data is a better fit.

### Z-order should follow React Flow layering where possible

Focused or hovered diagram elements need to appear above inactive elements. The implementation should use React Flow-supported mechanisms first:

- set higher node `zIndex` for active table nodes
- set higher edge `zIndex` or active edge style for connected relation edges
- apply active CSS classes to column rows within the active node

If React Flow edge/node layering conflicts, the implementation may additionally use CSS classes on active nodes and edges, but it should avoid imperative DOM mutation.

### Preserve rendering performance

The diagram can contain many tables, columns, and relation lines. Active relation lookups should be derived with `Set` or `Map` in memoized code rather than recalculating by nested scans in every node render. Component callbacks should be stable enough to avoid unnecessary full React Flow re-renders beyond the expected highlight state changes.

## Risks / Trade-offs

- Source tokens might be missing or point to generated/injected DBML constructs → Treat missing token as a no-op for cursor navigation while still applying diagram focus.
- Hovering dense diagrams can update active state frequently → Keep hover state primitive, derive relation ids with memoized sets, and avoid global state subscriptions.
- Raising edges and nodes can visually overlap handles or labels → Prefer consistent active z-index values and test with dense DBML presets.
- Column focus inside a table node is more granular than React Flow node selection → Keep column active styling inside `DbmlTableNode` instead of trying to represent columns as separate React Flow nodes.
- Current diagram line style options are local state in `DbmlDiagramPreview` → Selection/focus additions must preserve those options and not reset line style on hover or focus.
