## Why

The editor currently treats development diagnostics and presets as a fixed side panel. That structure does not scale well as the editor gains more tool surfaces such as outline, relation inspection, diagram settings, export controls, or other editor-specific utilities.

This change introduces an editor-local inspector activity model so the DBML editor can expose multiple right-side tools through a consistent icon rail and expandable sidebar without turning the application header into an editor tool surface.

## What Changes

- Replace the fixed editor development tools sidebar concept with an editor inspector composed of:
  - an icon-only activity bar on the right side of the editor workspace
  - an expandable sidebar that renders the active activity panel
- Model diagnostics and DBML presets as editor inspector activities.
- Keep diagnostics and presets development-only for the current MVP.
- Allow the active activity to be expanded, collapsed, and switched without changing the main editor and diagram layout responsibilities.
- Preserve DBML validation and Monaco marker behavior even when diagnostics are hidden or collapsed.
- Establish an extension point for future editor activities without requiring `EditorPage` layout rewrites.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: Replace the fixed development diagnostics sidebar behavior with an extensible editor inspector activity bar and sidebar model.

## Impact

- Affected frontend code:
  - `frontend/src/pages/editor/ui/EditorPage.tsx`
  - editor-local sidebar, activity bar, diagnostics, and preset UI components under `frontend/src/pages/editor/ui/`
  - editor-local state/types under `frontend/src/pages/editor/model/` or `frontend/src/pages/editor/lib/` as needed
  - CSS module layout in `frontend/src/pages/editor/ui/EditorPage.module.css`
- Affected specs:
  - `openspec/specs/dbml-editor/spec.md`
- Tests:
  - editor page behavior tests for activity visibility, expand/collapse, panel switching, diagnostics, and preset selection
- No backend API, persistence, authentication, routing, or package manager layout changes are expected.
