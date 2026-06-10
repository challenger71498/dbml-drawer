## Why

DBML Drawer needs a first usable authoring surface before diagram rendering can become useful. A Monaco-based DBML editor creates the core workflow for writing DBML, validating syntax, and later feeding the same document state into rendering features.

## What Changes

- Add a frontend DBML editor workspace as the initial product experience.
- Use Monaco Editor as the editor engine for DBML authoring.
- Register DBML syntax highlighting for Monaco.
- Validate DBML content in the browser and show diagnostics without requiring backend persistence or authentication.
- Introduce a sample DBML document so the editor is useful on first load.
- Organize frontend code with Feature-Sliced Design principles, starting conservatively with `app/`, `pages/`, and `shared/`.
- Keep DBML diagram rendering, file import/export, account integration, persistence, collaboration, and advanced language intelligence out of this MVP.

## Capabilities

### New Capabilities

- `dbml-editor`: Covers browser-based DBML authoring, Monaco syntax highlighting, local validation, diagnostics display, and editor workspace behavior.

### Modified Capabilities

None.

## Impact

- Adds Monaco Editor and DBML parsing/validation dependencies to `frontend/`.
- Reorganizes frontend source code toward an FSD-compatible structure under `frontend/src/`.
- Adds frontend components, hooks, language registration, validation utilities, tests, and styles for the DBML editor workspace.
- Updates documentation for the editor workflow if new commands or notable frontend structure are introduced.
- Does not require backend API changes.
