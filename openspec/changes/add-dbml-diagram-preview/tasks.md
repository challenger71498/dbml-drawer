## 1. Dependencies and Structure

- [x] 1.1 Add React Flow and ELK dependencies to the frontend project.
- [x] 1.2 Add editor-page module files for parsed DBML aliases, diagram entities, layout entities, diagram builders, layout adapters, React Flow mappers, and diagram UI components.
- [x] 1.3 Keep diagram code inside `frontend/src/pages/editor` and expose only the existing page public API needed by the app router.

## 2. Parsed DBML and Diagram Domain

- [x] 2.1 Define parsed DBML entity aliases that reuse `@dbml/core` model types where available.
- [x] 2.2 Define `DbmlDiagram`, `DbmlDiagramTable`, `DbmlDiagramColumn`, `DbmlDiagramPort`, and `DbmlDiagramRelation` entities that wrap parsed DBML entities without mutating them.
- [x] 2.3 Implement DBML parsing and diagram construction from valid source text.
- [x] 2.4 Convert DBML refs into column-level diagram relations with stable table, column, and port identifiers.
- [x] 2.5 Add unit tests for table, column, port, and relation construction.

## 3. ELK Layout and Routing

- [x] 3.1 Implement conversion from `DbmlDiagram` to an ELK graph with table nodes, fixed-order column ports, and relation edges.
- [x] 3.2 Configure ELK layered layout with rightward direction, fixed-order ports, spacing, and orthogonal routing.
- [x] 3.3 Implement conversion from ELK layout results into layouted diagram entities with table coordinates and routed edge sections.
- [x] 3.4 Add tests for port order preservation and relation route mapping.

## 4. React Flow Rendering

- [x] 4.1 Implement `DbmlDiagramPreview` using React Flow as the diagram viewport.
- [x] 4.2 Implement `DbmlTableNode` with table header, column rows, key metadata, and column-level handles.
- [x] 4.3 Implement `DbmlRelationEdge` that renders ELK route sections as a custom SVG path.
- [x] 4.4 Implement mapping from layouted diagram entities to React Flow nodes and edges.
- [x] 4.5 Add fit-view behavior for newly rendered valid diagrams.

## 5. Editor Integration

- [x] 5.1 Extend the editor document model to derive diagram input from debounced valid DBML.
- [x] 5.2 Render the diagram preview alongside the Monaco editor and diagnostics in `/editor`.
- [x] 5.3 Preserve the last valid diagram when the current DBML becomes invalid.
- [x] 5.4 Show a preview-paused state while diagnostics block diagram refresh.
- [x] 5.5 Show an empty diagram state for valid DBML with no renderable tables.

## 6. Quality and Performance

- [x] 6.1 Add UI tests for valid diagram rendering, invalid preview pause, and empty diagram state.
- [x] 6.2 Ensure diagram computation avoids layout recomputation for unchanged debounced valid documents.
- [x] 6.3 Review imports and component boundaries for bundle-size and re-render risks.
- [x] 6.4 Run frontend quality checks.
- [x] 6.5 Run repository quality checks.
