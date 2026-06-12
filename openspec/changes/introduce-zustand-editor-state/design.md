## Context

The editor workspace currently coordinates multiple state categories from `EditorPage` and a few page-local hooks:

- `useEditorThemePreferences` owns theme modes, code editor theme mode, offscreen relation proxy settings, system theme resolution, and localStorage read/write helpers.
- `EditorPage` owns sidebar expansion/width, diagram hover/focus targets, source reveal wiring, and most prop composition.
- `DbmlDiagramPreview` owns relation line style, relation highlight mode, hovered proxy relation ids, React Flow viewport state, and rendering-local state.
- `useDbmlDocument` owns DBML text, layout algorithm/options, debounced validation, diagnostics, async parse/layout, and layout result state.

This is still workable, but the state surface has grown enough that route-level state composition is becoming difficult to reason about. Zustand can improve this if it is used as an editor-scoped state layer rather than as a dumping ground for all UI state.

The implementation should follow the existing FSD shape: editor-specific stores live under `frontend/src/pages/editor/model/` because they are currently used only by the editor page. They should not move to `shared` unless another route or feature actually consumes them.

## Goals / Non-Goals

**Goals:**

- Introduce Zustand for editor-scoped shared state.
- Make persistence explicit and centralized for editor preferences.
- Reduce route-level prop drilling where multiple editor panels need the same state.
- Separate store-worthy state from component-local state with a clear rule.
- Migrate in phases: preferences first, diagram interaction second, DBML document last.
- Preserve observable editor behavior throughout the migration while allowing
  internal state ownership and persisted storage format to change per phase.

**Non-Goals:**

- Do not introduce app-wide state management for unrelated routes.
- Do not move design tokens, rendering constants, or pure model helpers into Zustand.
- Do not rewrite diagram layout, proxy layout, or DBML parsing algorithms as part of this change.
- Do not force every `useState` into Zustand. Component-local state remains valid when it is isolated, ephemeral, or tied to third-party component mechanics.

## Decisions

### Decision: Use editor-scoped stores under `pages/editor/model`

Create stores near the editor model code:

```text
frontend/src/pages/editor/model/
  editor-preferences-store.ts
  editor-diagram-interaction-store.ts
  dbml-document-store.ts
```

Rationale:

- The state is currently editor-specific.
- Keeping stores in the editor slice avoids prematurely promoting editor behavior to `shared`.
- This respects the existing page-owned architecture while still reducing page component complexity.

Alternative considered: create `shared/store` or `app/store`. That would imply app-wide ownership before any non-editor consumer exists.

### Decision: Classify state before moving it

State SHOULD move to Zustand when at least one of these is true:

- It is shared across multiple sibling or distant editor components.
- It is persisted as an editor preference.
- It is needed by both an activity panel and the diagram/editor surface.
- It represents editor workflow state rather than purely visual state.

State SHOULD remain local when at least one of these is true:

- It is only used inside one component.
- It is high-frequency transient UI state where global subscriptions could create avoidable re-renders.
- It is a third-party integration detail, such as pointer capture refs or React Flow internal viewport mechanics.
- It is a derived value that can be computed from store state and props.
- It is temporary render state for lazy loading, suspense fallback, or DOM measurement.

Initial classification:

| State area | Store target | Notes |
| --- | --- | --- |
| Workspace theme mode | Zustand preferences | Persisted, used by page/settings/editor. |
| Code editor theme mode / override | Zustand preferences | Persisted and cross-panel. |
| Offscreen proxy settings | Zustand preferences | Persisted renderer preferences. |
| Sidebar expanded state and width | Zustand preferences | User preference; can be persisted consistently. |
| Relation line style / highlight mode | Zustand preferences | Renderer preference currently local to diagram; useful in settings later. |
| Focused diagram target | Zustand diagram interaction | Shared by diagram, source reveal, selection view, and sidebar content. |
| Hovered diagram target | Prefer local first; store only if needed | High-frequency. If moved, use fine-grained selectors and avoid broad subscriptions. |
| Hovered proxy relation ids | Local to diagram preview | Rendering-local hover state. |
| React Flow viewport | Local to diagram preview | Third-party viewport mechanics. |
| Pointer resize refs | Local refs | DOM interaction detail. |
| Suspense fallback/loading local UI | Local | Not workflow state. |
| DBML document text | Zustand document phase | Shared editor document state. |
| Layout algorithm/options | Zustand document phase | Document/rendering workflow state. |
| Diagnostics and layout result | Zustand document phase | Derived asynchronously from document state; migrate last. |
| Active relation ids/table ids | Derived selectors/helpers | Do not store duplicated derived sets. |

### Decision: Migrate in phases

Phase 1: preferences store

- Add `zustand`.
- Replace `useEditorThemePreferences` with a Zustand-backed preferences API.
- Use Zustand `persist` middleware for persisted fields.
- Keep system theme subscription as a small hook/helper that updates or derives resolved theme state.
- Move sidebar width/expanded state and relation rendering preferences if doing so does not require changing user-visible behavior.

Phase 2: diagram interaction store

- Move focused diagram target to a store.
- Evaluate hovered target carefully. If hover remains local, keep the active target calculation near the diagram composition. If hover moves to a store, use selectors so hover updates do not rerender unrelated panels.
- Keep derived relation ids as selectors or memoized helpers instead of storing duplicate sets.

Phase 3: DBML document store

- Move document text, selected layout algorithm, and option values to a document store.
- Migrate validation/layout lifecycle after the synchronous state shape is stable.
- Keep parse/layout code in existing pure library functions.
- Ensure stale async layout results cannot overwrite newer document state.

### Decision: Keep derived state out of stores

Stores should contain source-of-truth values and actions. Values such as `resolvedWorkspaceTheme`, `resolvedCodeEditorTheme`, active relation ids, focused table ids, and endpoint column id sets should be derived through selectors or existing pure helpers.

Rationale:

- Avoids duplicated state that can drift.
- Makes tests focus on source state and derivation rules separately.

### Decision: Prefer idiomatic phase implementations over legacy compatibility

The migration should remain phased, but each phase should be implemented using
the common Zustand pattern for that state category rather than carrying
compatibility adapters from the previous local state implementation.

For Phase 1 preferences:

- Use one Zustand `persist` key for the editor preference store.
- Use `partialize` to make the persisted shape explicit.
- Use `merge` and normalizer helpers to keep invalid persisted values from
  leaking into runtime state.
- Do not preserve the previous per-setting localStorage keys or introduce a
  legacy storage bridge.

Existing editor defaults should remain unchanged. Editor route rendering, DBML
validation, diagram updates, proxy settings, and theme resolution should behave
as before.

## Risks / Trade-offs

- **Risk: Zustand becomes a global bucket for unrelated state** → Mitigation: keep stores editor-scoped and require the local-vs-store classification before moving state.
- **Risk: Hover state causes broad rerenders** → Mitigation: keep hover local initially or use fine-grained selectors with narrowly subscribed components.
- **Risk: Persist middleware changes stored preference compatibility** → Mitigation: accept the phase-level storage format change, keep defaults stable, and cover persisted Zustand state normalization with tests.
- **Risk: DBML async layout migration introduces stale update bugs** → Mitigation: migrate document state last and keep stale-result guards equivalent to the current hook.
- **Risk: Store actions hide important business rules** → Mitigation: keep pure parsing, layout, selection, and theme resolution helpers as separate functions and call them from stores/selectors.

## Migration Plan

1. Add Zustand dependency and preference store tests.
2. Migrate preferences while keeping existing UI behavior and replacing legacy per-setting storage with a single Zustand persist key.
3. Migrate diagram interaction state after preference migration is stable.
4. Migrate DBML document state and async validation/layout lifecycle last.
5. Run frontend typecheck, lint, targeted tests, and relevant editor tests after each phase.

Rollback is straightforward per phase: each phase should be committed separately so a problematic store migration can be reverted without losing earlier phases.

## Open Questions

- Should sidebar width/expanded state be persisted immediately, or only moved into the store without persistence first?
- Should hovered diagram target remain local indefinitely, or move to a store once a concrete cross-component consumer appears?
- Should DBML document text eventually be persisted, or should this migration preserve the current session-only behavior?
