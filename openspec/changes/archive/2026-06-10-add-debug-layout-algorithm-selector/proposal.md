## Why

The DBML diagram preview currently uses a single hard-coded ELK layout algorithm, which makes it difficult to compare how different ELK algorithms behave against dense DBML schemas.

This change adds a development-only layout algorithm selector so every available ELK algorithm can be tested in the editor before deciding which algorithms are useful enough to expose to general users.

## What Changes

- Add a development-only diagram layout settings activity to the editor inspector.
- Provide a selector that includes all ELK layout algorithms available from the bundled `elkjs` runtime.
- Provide curated controls for selected ELK sub-options that are useful for layout experimentation.
- Recompute the diagram layout when a developer changes the selected algorithm.
- Recompute the diagram layout when a developer changes a curated layout option.
- Keep the default layout algorithm as the current layered layout.
- Keep the selector hidden outside frontend editor dev mode.
- Preserve the existing diagram rendering controls and relation line style behavior.
- Establish a path for later promoting selected algorithms from debug-only controls to general user-facing diagram options.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: Add a development-only editor inspector activity for diagram layout settings.
- `dbml-diagram-preview`: Allow automatic diagram layout to be computed with a selected ELK layout algorithm instead of only the hard-coded default.

## Impact

- Affected frontend code:
  - `frontend/src/pages/editor/model/dbml-document.ts`
  - editor-local layout setting and curated option types under `frontend/src/pages/editor/model/`
  - `frontend/src/pages/editor/lib/layout-dbml-diagram.ts`
  - editor inspector activity wiring in `frontend/src/pages/editor/ui/EditorPage.tsx`
  - new editor-local diagram layout settings UI under `frontend/src/pages/editor/ui/`
  - CSS module styles in `frontend/src/pages/editor/ui/EditorPage.module.css`
- Affected specs:
  - `openspec/specs/dbml-editor/spec.md`
  - `openspec/specs/dbml-diagram-preview/spec.md`
- Tests:
  - editor page tests for dev-only visibility, selecting an algorithm, changing curated options, and hiding controls outside dev mode
  - layout tests for passing selected algorithms and option overrides into ELK layout computation
- No backend API, persistence, routing, authentication, or package manager changes are expected.
