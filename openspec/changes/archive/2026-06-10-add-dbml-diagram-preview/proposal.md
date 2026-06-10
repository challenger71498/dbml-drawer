## Why

The DBML editor currently validates and highlights source text, but it does not show the database structure that the user is authoring. Adding a diagram preview makes `/editor` useful as a visual ERD workspace and establishes the renderer architecture before later features such as export, saved layouts, and standalone viewing.

## What Changes

- Add a DBML diagram preview to the `/editor` workspace.
- Parse valid DBML into parsed DBML entities using `@dbml/core` model types where available.
- Build renderer-independent DBML diagram entities that wrap parsed DBML entities and add diagram metadata such as stable ids, column ports, table dimensions, and relation endpoints.
- Use ELK as the automatic layout and routing engine for table positions, fixed-order column ports, and orthogonal relation routes.
- Use React Flow as the interactive rendering layer for table nodes, routed relation edges, viewport pan/zoom, and fit-view behavior.
- Keep diagram code in the existing `pages/editor` slice until the renderer is reused by another route or page.
- Preserve responsive editing by deriving diagram state from debounced, valid DBML and avoiding unnecessary React re-renders.

## Capabilities

### New Capabilities

- `dbml-diagram-preview`: Defines DBML diagram entity construction, ELK layout/routing, React Flow rendering, and invalid DBML preview behavior.

### Modified Capabilities

- `dbml-editor`: The `/editor` workspace shall include a diagram preview alongside the existing Monaco editor and diagnostics.

## Impact

- Frontend dependencies: add React Flow and ELK layout packages to `frontend/package.json`.
- Frontend code: extend `frontend/src/pages/editor` with diagram domain models, layout adapters, React Flow mapping, and diagram UI components.
- Frontend tests: add unit coverage for DBML-to-diagram transformation and layout/renderer mapping boundaries, plus UI coverage for preview states.
- Build impact: frontend bundle size will increase; diagram-heavy modules should be structured to support lazy loading or isolated imports.
- Backend impact: none for this MVP.
