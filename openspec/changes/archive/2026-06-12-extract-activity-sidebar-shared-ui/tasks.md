## 1. Shared Activity Sidebar Package

- [x] 1.1 Create `frontend/src/shared/ui/activity-sidebar/` with a public `index.ts`, domain-free types, `ActivitySidebar`, `useActivitySidebar`, and a scoped CSS module.
- [x] 1.2 Move reusable sidebar chrome from `EditorSidebarShell` into `ActivitySidebar`, including side, panel placement, top/bottom groups, panel header, close button, optional resize handle, and accessibility attributes.
- [x] 1.3 Move generic active item, expanded state, close/toggle behavior, width state, pointer resize, keyboard resize, and width clamping into `useActivitySidebar`.
- [x] 1.4 Ensure `shared/ui/activity-sidebar` imports no editor, DBML, diagnostics, layout, theme setting, or diagram domain modules.

## 2. Editor Integration

- [x] 2.1 Refactor `EditorInspector` to use `ActivitySidebar` and `useActivitySidebar` while keeping editor-specific activity mapping and panel rendering in `pages/editor`.
- [x] 2.2 Refactor the left DBML editor sidebar in `EditorPage` to use the shared activity sidebar primitives and preserve current expand, close, resize, and source reveal behavior.
- [x] 2.3 Remove or replace the page-local `EditorSidebarShell` once both editor sidebars consume the shared package.
- [x] 2.4 Keep DBML editor, diagnostics, presets, diagram settings, editor settings, and diagram state ownership in the editor page boundary.

## 3. Styling

- [x] 3.1 Move sidebar-specific CSS from `EditorPage.module.css` into the shared activity sidebar CSS module.
- [x] 3.2 Keep page layout, editor workspace grid, diagram, table node, proxy card, and editor-specific panel content styles in editor-owned CSS.
- [x] 3.3 Verify left and right sidebars still match the current visual treatment across light, light-solarized, and dark themes.

## 4. Verification

- [x] 4.1 Update or add tests covering activity group rendering, panel toggling, close behavior, resize semantics, and editor sidebar integration.
- [x] 4.2 Run frontend format, TypeScript, lint, and targeted tests for editor sidebar behavior.
- [x] 4.3 Run OpenSpec validation for `extract-activity-sidebar-shared-ui`.
