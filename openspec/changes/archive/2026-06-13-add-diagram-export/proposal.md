## Why

Users can author and inspect DBML diagrams in the editor, but they cannot take the current visual diagram out of the app for documentation, review, or sharing. Exporting the rendered diagram as PNG or self-contained HTML makes the editor output usable outside the live workspace.

## What Changes

- Add an export action for the current valid DBML diagram from the editor workspace.
- Place the export action in the editor header's right-side action area so export is reachable as a workspace-level command.
- Support exporting the current diagram as PNG.
- Support exporting the current diagram as HTML that preserves the diagram structure and visual styling needed for standalone viewing.
- Add an export option for whether the current focused table or column highlight is included in the exported output.
- Add an export file name field that defaults to the same generated file name currently used for the diagram.
- When the active relation line style is `dynamic`, render exported active relations with the static gradient style instead of animated markers.
- Keep export unavailable or blocked when there is no current valid diagram to export.

## Capabilities

### New Capabilities

- `dbml-diagram-export`: Defines DBML diagram export formats, exportable diagram state, selection highlight inclusion, and dynamic-style fallback behavior.

### Modified Capabilities

- `dbml-editor`: Adds editor workspace export entry points and export option controls.
- `dbml-diagram-preview`: Defines how the current rendered diagram state is captured for export without changing the live preview interaction model.

## Impact

- Affected frontend code is expected under `frontend/src/pages/editor`.
- PNG export may require a browser-side DOM-to-image or SVG/canvas capture utility.
- HTML export will need a deterministic serialization path for the current diagram view and its required styles.
- Export behavior remains browser-local; no backend, authentication, or persistence changes are planned.
