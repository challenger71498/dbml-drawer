## Why

The editor page now has both left and right sidebars with similar chrome: activity bars, icon buttons, expanded panels, headers, and optional close/resize controls. Keeping those shells separately implemented makes style drift and accessibility regressions likely as the editor grows more tabs.

## What Changes

- Extract the shared editor sidebar shell styling and structure into page-local reusable UI components.
- Keep tab/panel content owned by each activity, passed into the shared shell as children or render output.
- Preserve the current left DBML editor sidebar behavior, including toggle, resize, and diagram workspace sizing.
- Preserve the current right inspector behavior, including multiple activities, active activity switching, and close behavior.
- Avoid moving this into a cross-page `widgets` or `shared` layer until the same shell is reused outside the editor page.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: Clarify that editor sidebars use a shared shell for common activity bar and panel chrome while preserving activity-specific content and behavior.

## Impact

- Affected frontend code:
  - `frontend/src/pages/editor/ui/EditorPage.tsx`
  - `frontend/src/pages/editor/ui/EditorInspector.tsx`
  - `frontend/src/pages/editor/ui/EditorPage.module.css`
  - new page-local editor sidebar shell component(s) under `frontend/src/pages/editor/ui/`
- Affected tests:
  - `frontend/src/pages/editor/ui/EditorPage.test.tsx`
- No new runtime dependencies.
- No route, DBML parsing, diagram layout, or persistence changes.
