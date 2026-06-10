## Context

`EditorPage` currently owns the left DBML editor sidebar while `EditorInspector` owns the right inspector sidebar. The two sides are not identical, but they share substantial UI chrome: activity bars, icon-only activity buttons, expanded panel containers, panel headers, close/toggle affordances, borders, and page-height alignment.

The shared behavior is still editor-page-specific. It is not yet used by another route, so extracting to `widgets/` or `shared/ui` would add a wider architectural contract before there is cross-page reuse.

## Goals / Non-Goals

**Goals:**

- Extract page-local reusable sidebar shell components under `frontend/src/pages/editor/ui/`.
- Share common activity bar, activity button, panel frame, panel header, and optional resize handle behavior.
- Keep DBML editor, diagnostics, presets, and diagram settings panel content owned by their existing callers.
- Preserve current left sidebar toggle/resize behavior.
- Preserve current right inspector activity selection/close behavior.
- Reduce duplicated CSS selectors for left and right sidebar chrome.

**Non-Goals:**

- Do not move the shell to `widgets/` or `shared/ui`.
- Do not redesign the editor layout.
- Do not change DBML document state, Monaco wiring, diagram rendering, or inspector activity content.
- Do not introduce a global activity/sidebar framework.

## Decisions

### Use page-local components first

Create editor-local components such as `EditorSidebarShell`, `EditorActivityBar`, and/or `EditorActivityButton` in `pages/editor/ui`. This follows the current reuse scope: both consumers are inside the editor page.

Alternative considered: extracting to `widgets/editor-sidebar`. That is premature because no other page consumes this UI and the component would still depend on editor-specific activity semantics.

### Share chrome, not panel content

The shared shell should accept activity definitions and panel content through props or `children`. It should not know about DBML documents, diagnostics, presets, layout settings, or diagram selection.

This keeps domain wiring in `EditorPage` and `EditorInspector` while allowing the visual frame and accessibility behavior to stay consistent.

### Separate side from panel placement

The shell should support `side="left" | "right"` for side-specific styling, but panel placement must be a separate input. This prevents a physical side value from implicitly changing unrelated layout behavior.

The initial placements are:

- left sidebar: activity bar first, panel after the activity bar
- right sidebar: panel before the activity bar, so the panel opens toward the workspace

The shell should not force both sides into identical state models. Left still owns a single DBML editor activity and right still owns multiple inspector activities.

### Keep resize state owned by sidebar owners

The shell can render a resize handle, but `EditorPage` should own the DBML editor sidebar width and `EditorInspector` should own the right inspector width. Both sidebars should enforce a minimum width but no maximum width.

## Risks / Trade-offs

- Shared props can become too broad if the shell tries to model every activity behavior → keep the shell focused on chrome and let callers own selection/toggle state.
- CSS extraction can accidentally change layout specificity → move styles in small steps and preserve existing class behavior through tests.
- Left and right sidebars are similar but not symmetric → use explicit side variants instead of deriving behavior from side alone.
- Accessibility regressions are possible when moving activity buttons → preserve labels, `aria-controls`, `aria-expanded`, `aria-pressed`, and `role="separator"` semantics in tests.
