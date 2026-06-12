## Why

The editor now has left and right activity sidebars with matching chrome, panel headers, resize behavior, and top/bottom activity placement. Keeping that sidebar shell and controller logic inside `pages/editor` makes the page harder to maintain and prevents the same interaction pattern from being reused by future pages.

## What Changes

- Extract the domain-free activity sidebar UI into `frontend/src/shared/ui/activity-sidebar/`.
- Rename the reusable sidebar concept from the editor-specific `EditorSidebarShell` shape to an `ActivitySidebar` shared UI component.
- Add a generic `useActivitySidebar` controller hook for UI-only sidebar state such as active item, expanded state, close/toggle behavior, width, and resize handlers.
- Keep editor-specific activity definitions, icons, panel content, DBML document logic, diagnostics, settings, presets, and diagram settings in `pages/editor`.
- Reduce `EditorInspector` to an editor-specific adapter that maps editor activities to the shared activity sidebar contract.
- Update the left DBML editor sidebar and right editor inspector to use the same shared activity sidebar UI/controller primitives while preserving current behavior.
- Move activity sidebar CSS out of `EditorPage.module.css` into a shared sidebar CSS module.

## Capabilities

### New Capabilities

- `activity-sidebar`: Defines the shared, domain-free activity sidebar UI and controller behavior.

### Modified Capabilities

- `dbml-editor`: Updates the editor sidebar shell requirement so the DBML editor workspace consumes the shared activity sidebar while preserving existing left/right sidebar behavior.

## Impact

- Affected frontend code:
  - `frontend/src/shared/ui/activity-sidebar/`
  - `frontend/src/pages/editor/ui/EditorSidebarShell.tsx`
  - `frontend/src/pages/editor/ui/EditorInspector.tsx`
  - `frontend/src/pages/editor/ui/EditorPage.tsx`
  - `frontend/src/pages/editor/ui/EditorPage.module.css`
  - related editor sidebar tests
- No backend, API, persistence, or dependency changes are expected.
- The shared activity sidebar MUST remain domain-free and MUST NOT import editor, DBML, diagnostics, layout, or theme-setting domain modules.
