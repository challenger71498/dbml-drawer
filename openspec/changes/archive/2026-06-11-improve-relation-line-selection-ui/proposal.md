## Why

Relation lines currently rely on a single solid active color, which makes dense DBML diagrams harder to scan because users cannot immediately distinguish the source side from the side that references it. Improving the line and selection colors will make table and column relationships easier to follow without changing the underlying diagram behavior.

## What Changes

- Render active relation lines with a directional gradient instead of a single solid active color.
- Allow users to choose the active relation line highlight mode: solid, gradient, or dynamic.
- Keep the source side of active relation lines in the table-title color.
- Render the side that references the source in the existing orange highlight color.
- When a table is selected, highlight the selected table border with the complementary color.
- When a column is selected, highlight source and reference column rows with their endpoint role colors.
- Preserve existing dimming, layering, line style selection, and hover/focus behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dbml-diagram-preview`: Extend relation line and selection visual requirements so active relationships communicate source and referenced sides with distinct colors.

## Impact

- Frontend DBML diagram relation edge rendering.
- Frontend DBML table node and column row selection styling.
- Diagram selection view model data passed to node and edge components.
- Existing diagram preview tests for relation highlighting and selection states.
