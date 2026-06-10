## 1. Selection Model

- [x] 1.1 Add page-local diagram selection target types for table and column focus.
- [x] 1.2 Add helper logic to derive the active target from hover and focus state, preferring hover over focus.
- [x] 1.3 Add helper logic to derive active relation ids from the active target and current layouted diagram.

## 2. Diagram Interaction Wiring

- [x] 2.1 Extend `mapDbmlDiagramToFlow` inputs and node/edge data with active state and interaction callbacks.
- [x] 2.2 Update `DbmlDiagramPreview` to receive hover/focus state, active relation ids, and table/column event callbacks.
- [x] 2.3 Update `DbmlTableNode` so table headers emit hover, leave, and click events.
- [x] 2.4 Update `DbmlTableNode` so column rows emit hover, leave, and click events.
- [x] 2.5 Update `DbmlRelationEdge` so active relation edges render with highlighted styling and higher z-order while preserving the selected line style.

## 3. Visual Highlighting

- [x] 3.1 Add table active styling for hovered or focused tables.
- [x] 3.2 Add column active styling for hovered or focused columns.
- [x] 3.3 Add inactive-state styling if needed so active elements remain visually distinct in dense diagrams.
- [x] 3.4 Add React Flow node and edge z-index handling so active diagram elements render above inactive elements.

## 4. Editor Source Navigation

- [x] 4.1 Extend `DbmlCodeEditor` with a narrow imperative navigation API for moving to a DBML source token position.
- [x] 4.2 Use `@dbml/core` table and field token positions to navigate from clicked table and column targets.
- [x] 4.3 Ensure source navigation reveals the target position and focuses Monaco after diagram-driven navigation.
- [x] 4.4 Ensure missing source tokens skip editor navigation without blocking diagram focus.

## 5. Verification

- [x] 5.1 Add unit tests for active relation derivation for table and column targets.
- [x] 5.2 Add React tests for table hover, table focus, and relation highlight behavior.
- [x] 5.3 Add React tests for column hover, column focus, and relation highlight behavior.
- [x] 5.4 Add React tests for diagram-driven Monaco cursor navigation.
- [x] 5.5 Run `openspec validate add-diagram-selection-focus --strict`.
- [x] 5.6 Run `mise run quality`.
