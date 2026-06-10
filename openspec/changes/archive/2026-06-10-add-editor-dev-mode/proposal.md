## Why

The editor currently shows the diagnostics sidebar unconditionally, which exposes developer-oriented debugging UI in the normal authoring surface. Development builds also need richer DBML sample data so editor, validation, and diagram rendering behavior can be tested quickly without manually pasting large documents.

## What Changes

- Gate the diagnostics sidebar so it is visible only in the frontend development environment.
- Add a collapsible diagnostics sidebar state for development builds.
- Add a development-only DBML preset selector with multiple sample documents, including simple, complex, and very complex schemas.
- Document the frontend dev mode environment variable in `frontend/.env.example`.
- Add repository mise initialization tasks that create service-local `.env` files from `.env.example` files without overwriting existing local values.
- Keep production editor behavior focused on editing and diagram preview without the diagnostics sidebar or test preset controls.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: The editor workspace gains development-only diagnostics tooling and DBML test preset controls.
- `developer-workflow`: The repository initialization workflow creates service-local environment files before dependency installation.

## Impact

- Affected frontend code is expected to stay within `frontend/src/pages/editor` unless a shared, non-domain utility is needed.
- `frontend/.env.example` will document the dev mode flag required to enable editor-only development tooling locally.
- `mise.toml` will gain root and service-specific env initialization tasks.
- `README.md` will document `mise run init` and `mise run env:init`.
- No backend API changes are required.
- No new runtime service dependency is expected.
- UI tests should cover production hiding behavior, development visibility, collapsible diagnostics, and preset selection.
