## Why

The diagram preview currently renders DBML structure but does not help users connect visual tables and columns back to the source DBML text. As diagrams become dense, users need quick hover feedback, persistent focus, z-order emphasis, and source navigation from the rendered diagram.

## What Changes

- Add table hover highlighting in the diagram preview for the hovered table and all relation lines connected to that table.
- Add table click focus in the diagram preview that persists the table and connected line highlight until another focus target replaces it.
- Add column hover highlighting in the diagram preview for the hovered column and all relation lines connected to that column.
- Add column click focus in the diagram preview that persists the column and connected line highlight until another focus target replaces it.
- Ensure focused or highlighted tables, columns, and connected relation lines render above non-active diagram elements.
- Move the Monaco editor cursor to the corresponding DBML table or column definition when a diagram table header or column row is clicked.
- Keep the interaction local to the `/editor` page and existing DBML diagram preview architecture.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-diagram-preview`: Adds table and column hover/focus interactions, active relation highlighting, and active element z-order behavior.
- `dbml-editor`: Adds source navigation from diagram table and column focus to the corresponding Monaco editor definition.

## Impact

- Affected frontend code is expected under `frontend/src/pages/editor`.
- DBML diagram table and column entities may need source-location metadata if available from `@dbml/core`; otherwise a page-local lookup can derive source ranges from the current DBML text.
- React Flow node and edge data will need active-state metadata or callbacks for hover/focus behavior.
- Monaco editor integration will need an imperative cursor/selection API from the editor component to the page-level diagram interaction.
- No backend, persistence, authentication, or new runtime service is required.
