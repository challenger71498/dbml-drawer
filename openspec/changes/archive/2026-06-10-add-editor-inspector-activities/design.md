## Context

The `/editor` page currently owns the DBML editor, diagram preview, validation state, diagnostics, and development DBML presets. Development tools are exposed through a fixed right sidebar that combines diagnostics and presets into one panel.

That shape is sufficient for one debug surface, but it does not scale to multiple editor-specific tools. Future editor tools may include schema outline, diagram settings, relation inspection, export actions, table search, or layout controls. These tools should belong to the editor workspace rather than the application navigation header.

The frontend currently follows a conservative Feature-Sliced Design approach: editor-only code lives in `frontend/src/pages/editor/`. Because this inspector is used only by the editor page today, it should remain in the editor page slice rather than being promoted to `widgets/` or `features/`.

## Goals / Non-Goals

**Goals:**

- Introduce an editor-local inspector shell with an icon-only activity bar and expandable sidebar.
- Model diagnostics and DBML presets as inspector activities.
- Keep diagnostics and DBML presets available only in editor dev mode.
- Make the inspector extensible so future editor activities can be added without rewriting the main `EditorPage` layout.
- Preserve existing DBML validation, Monaco markers, diagram preview, and preset replacement behavior.
- Keep dev-only panel content conditionally loaded so production mode does not eagerly load debug UI.

**Non-Goals:**

- Introduce a global application header, global navigation shell, or app-wide sidebar.
- Move editor code to `widgets/`, `features/`, or `entities/`.
- Persist the active inspector activity or collapsed state.
- Add production-facing inspector activities.
- Add new backend APIs, authentication, account settings, or saved user preferences.
- Redesign the DBML editor, Monaco integration, or diagram rendering.

## Decisions

### Keep the inspector inside `pages/editor`

The inspector is editor-specific and currently has one consumer: `EditorPage`. Per FSD, it should remain local to the page slice until real reuse appears.

Alternative considered: create `widgets/editor-inspector`. That would imply a reusable cross-page UI block before the project has another page that consumes it. This adds public API and import-boundary surface area without a current benefit.

### Use an activity registry model

Represent each inspector entry as an activity definition with a stable id, accessible label, optional badge metadata, and a panel renderer.

Expected shape:

```ts
type EditorInspectorActivityId = 'diagnostics' | 'presets'

type EditorInspectorActivity = {
  id: EditorInspectorActivityId
  label: string
  panelLabel: string
  renderPanel: () => React.ReactNode
}
```

The first implementation can keep the definitions local to `EditorPage` or a nearby editor UI/lib module. The important boundary is that `EditorPage` composes available activities, while `EditorInspector` owns activity bar rendering, active activity selection, and expand/collapse behavior.

Alternative considered: hard-code diagnostics and presets branches inside `EditorInspector`. That is simpler for the current two panels, but it would make each future activity require editing the shell internals.

### Separate activity bar state from panel content

The inspector state should track:

```ts
type EditorInspectorPanel = EditorInspectorActivityId | null

type EditorInspectorState = {
  activePanel: EditorInspectorPanel
  isExpanded: boolean
}
```

Behavior:

- Selecting an inactive activity sets it active and expands the sidebar.
- Selecting the active activity toggles sidebar expansion.
- Selecting a different activity while expanded keeps the sidebar expanded and swaps panel content.
- Closing the sidebar collapses it and clears the active activity selection.
- If no activities are available, the inspector should not render.

This keeps the icon rail as a lightweight editor tool surface without implying a tool is still selected after its panel is closed.

### Prefer button disclosure semantics over ARIA tabs for MVP

Although the visual model resembles vertical tabs, each activity button also acts as an expand/collapse toggle for the active sidebar. A button with `aria-label`, `aria-controls`, `aria-expanded`, and a visible selected state is the better MVP fit than implementing the full WAI-ARIA tabs keyboard model.

If the inspector later becomes a pure tabbed panel with always-visible content, it can be revisited as an ARIA tablist.

### Keep dev-only tools conditionally available

Diagnostics and presets remain dev-only activities. Production mode should not show these activity buttons or their sidebar content.

To keep bundle behavior aligned with the current implementation, heavy or dev-only panel content should remain lazy-loadable. The inspector shell and activity bar can be lightweight static UI, while panel content can be loaded only when dev mode is enabled and the panel is needed.

### Keep icon dependency optional for implementation

The UX target is icon-only activity buttons. If an icon library is already available, use it. If not, the implementation may either:

- introduce a small icon dependency such as `lucide-react`, or
- use local lightweight icon components scoped to the editor page.

The proposal does not require a new dependency. If a dependency is added during implementation, it should be limited to the frontend project.

## Risks / Trade-offs

- [Risk] The activity registry may be slightly more abstraction than two dev tools need today. → Mitigation: keep it local to `pages/editor`, avoid generic framework code, and only model the minimum fields required by current and near-future activities.
- [Risk] Icon-only controls can be inaccessible if labels are omitted. → Mitigation: every activity button must have an accessible label and state via ARIA attributes.
- [Risk] Sidebar layout changes can break editor/diagram sizing. → Mitigation: keep the main editor workspace and inspector as separate grid columns, and test collapsed, expanded, and small viewport layouts.
- [Risk] Dev-only tools may accidentally enter production UI. → Mitigation: activity registration must filter dev-only activities by editor dev mode, and tests must cover production mode.
- [Risk] Lazy panel loading can complicate tests. → Mitigation: keep panel boundaries simple and assert behavior through user-visible controls and text.

## Migration Plan

1. Replace the fixed `EditorDevTools` sidebar with the new inspector shell while preserving diagnostics and preset behavior.
2. Update CSS grid classes so the editor page supports three states: no inspector, activity rail only, and expanded inspector sidebar.
3. Update tests to assert activity-based behavior instead of fixed diagnostics sidebar behavior.
4. Run frontend quality checks.

Rollback is straightforward because the change is local to the editor page UI. Reverting the editor inspector components and restoring the previous `EditorDevTools` usage should restore the current behavior.
