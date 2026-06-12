## Why

The editor workspace now coordinates DBML document state, diagram interaction, theme preferences, sidebar state, and renderer options from route-level React state and localStorage helpers. As the editor grows, this makes state ownership harder to reason about and increases prop drilling between page, sidebar, settings, editor, and diagram components.

Introducing Zustand as the editor state layer will give shared editor state explicit ownership while keeping short-lived component-only state local. The migration should be phased so each state boundary can be validated independently.

## What Changes

- Add Zustand to the frontend and introduce editor-scoped stores under the editor page model layer.
- Migrate editor state in phases:
  - Phase 1: editor preferences, including theme modes, code editor theme override, sidebar preferences, relation rendering preferences, and offscreen relation proxy options.
  - Phase 2: diagram interaction state, including focused and hovered diagram targets and relation selection inputs used by the editor workspace.
  - Phase 3: DBML document state, including document text, layout algorithm selection, layout option values, diagnostics, and layout lifecycle state.
  - Phase 4: refine store boundaries after Phase 3 by splitting independent source-of-truth groups:
    - DBML editor state owns DBML code text.
    - Editor settings state owns user-controlled settings, including layout algorithm and layout option values.
    - Diagram state is reserved for actual diagram result/position state, such as layouted diagram data or future user-moved node positions, if that state needs store ownership.
    - `useDbmlDocument` remains the composition hook that reads the code/settings stores, runs validation and layout orchestration, and returns the combined workflow shape used by the editor page.
- Define a clear decision rule for what belongs in Zustand versus component-local React state.
- Preserve existing user-facing editor behavior, persistence behavior, validation behavior, and diagram rendering behavior during the migration.
- Keep store boundaries editor-scoped unless a future feature needs the same state outside the editor route.

## Capabilities

### New Capabilities

- `editor-state-management`: Defines how the DBML editor workspace owns shared, persistent, and cross-panel state with Zustand while retaining local React state for component-only or high-frequency transient UI concerns.

### Modified Capabilities

- None.

## Impact

- Frontend dependency set: add `zustand`.
- Affected frontend areas:
  - `frontend/src/pages/editor/model/`
  - `frontend/src/pages/editor/ui/EditorPage.tsx`
  - editor settings, inspector/sidebar shell usage, diagram preview wiring, and DBML document hook usage.
- Tests will need updates or additions around store initialization, persistence normalization, selectors, and unchanged editor behavior.
- Existing generated design token artifacts and OpenSpec design token capabilities are not affected.
