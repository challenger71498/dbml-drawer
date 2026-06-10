## 1. Shared Sidebar Shell

- [x] 1.1 Create page-local editor sidebar shell component(s) under `frontend/src/pages/editor/ui/`.
- [x] 1.2 Add shared activity bar and icon activity button rendering with preserved accessible labels and pressed/expanded state attributes.
- [x] 1.3 Add shared expanded panel frame and header rendering that accepts caller-owned panel content.
- [x] 1.4 Support side variants for left and right sidebar chrome without moving the component outside the editor page slice.
- [x] 1.5 Keep sidebar side and panel placement as separate shell inputs.
- [x] 1.6 Make the shared shell own the expanded panel title header.
- [x] 1.7 Add a shared icon-only close button to expanded panel headers.

## 2. Left Sidebar Migration

- [x] 2.1 Replace the inline left DBML editor activity bar and panel markup in `EditorPage` with the shared sidebar shell.
- [x] 2.2 Preserve DBML editor ref, value, diagnostics, and `onChange` wiring.
- [x] 2.3 Preserve left sidebar toggle behavior and page grid expanded/collapsed classes.
- [x] 2.4 Preserve DBML editor sidebar resize handle semantics, width state, and diagram workspace sizing.
- [x] 2.5 Remove the DBML editor sidebar maximum resize limit while preserving its minimum width.
- [x] 2.6 Add left DBML editor panel close behavior through the shared header.

## 3. Right Sidebar Migration

- [x] 3.1 Update `EditorInspector` to use the shared sidebar shell for activity bar, activity buttons, panel frame, header, and close affordance.
- [x] 3.2 Preserve right inspector activity selection, activity switching, collapse, close, and focus behavior.
- [x] 3.3 Keep diagnostics, presets, and diagram settings panel content owned by their current activity renderers.
- [x] 3.4 Render right inspector panels to the left of the right activity bar.
- [x] 3.5 Add right inspector sidebar resizing without a maximum resize limit.
- [x] 3.6 Remove duplicate panel title headers from activity-specific panel content.

## 4. Styling Consolidation

- [x] 4.1 Move duplicated left/right activity bar, activity button, panel, header, and close styles into shared editor sidebar CSS selectors.
- [x] 4.2 Keep side-specific border, layout, resize, and responsive differences explicit.
- [x] 4.3 Remove obsolete sidebar CSS selectors after both sidebars use the shared shell.

## 5. Verification

- [x] 5.1 Update editor page tests to assert shared sidebar accessibility behavior for left and right activity controls.
- [x] 5.2 Verify DBML editor sidebar toggle and resize behavior remains covered.
- [x] 5.3 Verify right inspector activity switching and close behavior remains covered.
- [x] 5.4 Run targeted editor tests.
- [x] 5.5 Add coverage for right inspector resizing.
- [x] 5.6 Run full frontend tests, typecheck, lint, and format check.
- [x] 5.7 Add coverage for left DBML editor panel close behavior.
