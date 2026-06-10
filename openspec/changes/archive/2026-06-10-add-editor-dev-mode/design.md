## Context

The `/editor` page currently composes Monaco editing, diagram preview, and a diagnostics sidebar in one route-level page slice. The diagnostics sidebar is useful while building the parser, marker, and diagram pipeline, but it is developer tooling rather than part of the normal authoring surface. The page also starts from a single DBML sample, which makes manual testing of diagram layout and validation scenarios slow.

The frontend follows a pages-first FSD approach. Since these controls are only used by `/editor`, the implementation should remain inside `frontend/src/pages/editor` instead of introducing `widgets`, `features`, or `entities`.

## Goals / Non-Goals

**Goals:**

- Hide the diagnostics sidebar and DBML test preset controls unless the frontend dev mode flag is enabled.
- Provide a development-only diagnostics sidebar that can be collapsed and expanded.
- Provide development-only DBML presets that replace the editor document with simple, complex, and very complex test schemas.
- Document the dev mode flag in `frontend/.env.example` so local setup is explicit.
- Include environment file initialization in the repository `mise run init` workflow while keeping generated `.env` files service-local.
- Keep production `/editor` focused on the primary authoring experience: DBML text editing and diagram preview.
- Preserve editing responsiveness and avoid introducing unnecessary production bundle cost.

**Non-Goals:**

- Persisting the collapsed state, selected preset, or editor content.
- Adding backend APIs or user-specific settings.
- Adding a reusable widget or shared feature layer for dev tooling.
- Changing Monaco marker behavior; editor markers may continue to surface validation issues independent of the dev sidebar.
- Loading frontend runtime environment values directly from the repository root `.env`.

## Decisions

### Keep dev tooling inside the editor page slice

Development controls will live under `frontend/src/pages/editor` because they are only used by the `/editor` route. This matches FSD's "start simple, extract when needed" rule and avoids creating speculative `features` or `widgets` layers.

Alternative considered: create a reusable diagnostics widget. Rejected because there is no second page using it.

### Gate developer UI with an explicit frontend environment flag

The editor page will derive a boolean development mode from an explicit Vite environment variable documented in `frontend/.env.example`, for example `VITE_EDITOR_DEV_MODE=true`. The diagnostics sidebar and DBML preset controls will render only when this flag is enabled.

Alternative considered: use Vite's built-in `import.meta.env.DEV`. Rejected because it couples the UI to the command used to start the app instead of making the intended editor tooling mode explicit in frontend environment configuration.

Alternative considered: expose a user-facing toggle in all environments. Rejected because the current sidebar is primarily implementation/debugging support, not product UI.

### Treat DBML presets as editor-local test fixtures

DBML presets will be modeled as named sample documents in the editor page slice, for example in `lib/dbml-presets.ts`. The initial editor content can continue to use the simple/default preset, while development controls allow replacing the current document with other presets.

Alternative considered: store presets in `shared`. Rejected because these are DBML-domain test fixtures for one page, not generic infrastructure.

### Collapsed diagnostics state is local UI state

The diagnostics sidebar's collapsed state will be local page UI state. It does not need persistence because the feature exists to support development-time inspection and can reset on reload.

Alternative considered: localStorage persistence. Rejected for this MVP because it adds state versioning and storage behavior that does not change the core developer workflow.

### Avoid production cost for dev-only UI

Development controls should be conditionally rendered so production users do not see them. If implementation creates larger dev-only components or large preset documents, they should be separated enough that production code paths stay small and easy to remove from the rendered tree.

Alternative considered: always render controls and hide them with CSS. Rejected because it leaves developer UI in the production DOM and makes production behavior harder to verify.

### Initialize service-local env files through mise

The repository will provide `mise run init` as the normal local setup entry point. That task will run env initialization before dependency installation. Env initialization will copy `frontend/.env.example` to `frontend/.env` and `backend/.env.example` to `backend/.env` only when the destination file does not already exist.

Alternative considered: configure Vite to load the repository root `.env`. Rejected because it weakens service ownership of runtime configuration and conflicts with the existing project-local configuration boundary.

## Risks / Trade-offs

- Environment checks can make tests brittle if the test runner cannot vary env values. Mitigation: isolate the explicit dev mode flag behind a small function or prop seam so tests can cover both enabled and disabled rendering.
- Very complex DBML presets can slow down validation and layout during manual testing. Mitigation: keep presets representative but bounded, and rely on existing debounced validation/layout behavior.
- Preset selection replaces unsaved editor text. Mitigation: present presets as explicit development actions and keep the behavior out of production.
- Env initialization could overwrite local secrets if implemented naively. Mitigation: use no-clobber copy behavior so existing `.env` files are preserved.
