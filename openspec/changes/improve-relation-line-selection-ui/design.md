## Context

DBML diagram relations are already modeled with source and target endpoints, and React Flow edges receive the full relation data. Active relation lines currently switch from the default blue to a solid orange stroke when connected to the hovered or focused target.

Table and column selection state is computed in the diagram selection model and exposed through `DbmlDiagramSelectionViewContext`. Table nodes currently know which tables are connected to the active target, but they do not know which connected columns are source endpoints or reference endpoints for the current active context.

## Goals / Non-Goals

**Goals:**

- Make active relation lines communicate direction by coloring the source endpoint with the table-title color and the side that references it with orange.
- Highlight selected table borders and relation column rows with endpoint role colors.
- Keep existing hover/focus behavior, dimming, layering, viewport behavior, and relation line style controls intact.
- Keep the color behavior deterministic and testable.

**Non-Goals:**

- Change DBML parsing or relation source/target semantics.
- Add user-facing color customization.
- Add new relation editing or selection modes.
- Rework the ELK layout or React Flow routing logic.

## Decisions

1. Use existing relation source/target metadata as the direction contract.

   For DBML `a > b`, `b` is the source endpoint and `a` references that source. The source color maps to `sourceTableId` and `sourceColumnId`, and the reference color maps to `targetTableId` and `targetColumnId`. This keeps the feature tied to existing diagram entities instead of inferring direction from geometry, route shape, or rendered handle side.

   Alternative considered: infer color start/end from the rendered path coordinates. That would break when layout direction, routing style, or edge bends change.

2. Render active relation gradients in the edge component.

   `DbmlRelationEdge` already receives relation data and active state, so it is the lowest-impact place to create per-edge SVG gradients and apply them to the active stroke. The inactive and dimmed edge styles can stay as solid strokes.

   Alternative considered: apply global CSS gradients to all active edges. That would be difficult to align per edge and could collide when multiple edges are active.

3. Extend selection view data with endpoint-side highlight sets.

   The selection model should compute which columns are source endpoints and which columns reference those endpoints for the current active column target. Table nodes can then style the focused table border and endpoint column rows without duplicating relation traversal logic.

   Alternative considered: compute endpoint role columns inside each `DbmlTableNode`. That spreads graph traversal across rendered nodes and makes test coverage less focused.

4. Treat hover and focus consistently.

   The active target remains `hoveredTarget ?? focusedTarget`; directional color and endpoint role highlights should follow the same active target so transient hover previews match focused selection behavior.

## Risks / Trade-offs

- Gradient orientation can appear reversed if tied to screen coordinates instead of relation source/target semantics. Mitigation: generate gradients from the routed start point to end point for each relation, because the route is already source-to-target.
- Endpoint highlights may compete visually with the existing orange focused state. Mitigation: reserve orange for selected table borders and reference-side column emphasis, and use the table-title color for source-side column emphasis.
- Multiple active relations can mark the same column as a source or reference endpoint. Mitigation: store endpoint columns in sets and render each highlight once per row.
