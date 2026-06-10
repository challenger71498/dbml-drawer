## 1. Frontend Dependencies and Structure

- [x] 1.1 Add Monaco Editor integration and DBML parsing dependencies to `frontend/`.
- [x] 1.2 Reorganize `frontend/src/` into minimal FSD layers: `app/`, `pages/editor/`, and `shared/`.
- [x] 1.3 Add TypeScript and Vite path aliases for the FSD layers that exist.
- [x] 1.4 Preserve project-local package ownership and update the frontend lockfile.
- [x] 1.5 Add frontend route configuration that exposes the DBML editor page at `/editor`.

## 2. Monaco DBML Editor

- [x] 2.1 Add a Monaco-backed DBML editor component in the DBML editor page slice.
- [x] 2.2 Register the DBML Monaco language id during editor initialization.
- [x] 2.3 Add Monarch syntax tokenization for DBML keywords, structures, comments, strings, identifiers, and relationship operators.
- [x] 2.4 Seed the editor with an initial DBML sample document.
- [x] 2.5 Isolate Monaco-specific imports, options, refs, and cleanup so unrelated React modules do not pay unnecessary lifecycle or bundle cost.

## 3. DBML Validation and Diagnostics

- [x] 3.1 Add a DBML validation adapter that normalizes parser success and parser errors.
- [x] 3.2 Run validation from editor changes with debounce.
- [x] 3.3 Display validation diagnostics in a diagnostics panel.
- [x] 3.4 Publish positioned validation diagnostics to Monaco markers.
- [x] 3.5 Clear stale diagnostics when the current document validates successfully.
- [x] 3.6 Apply React performance patterns for editor state: stable callbacks, refs for transient editor objects, and derived display state instead of redundant state where practical.

## 4. User Interface Integration

- [x] 4.1 Replace the placeholder frontend shell with route-driven rendering for the `/editor` DBML editor workspace.
- [x] 4.2 Style the editor and diagnostics layout for desktop and narrow viewports.
- [x] 4.3 Keep the frontend independent of backend authentication, persistence, and network access for editor validation.

## 5. Tests and Verification

- [x] 5.1 Add tests for `/editor` route rendering and sample DBML availability.
- [x] 5.2 Add tests for validation adapter success and failure behavior.
- [x] 5.3 Add tests for diagnostics panel behavior.
- [x] 5.4 Update README if the frontend structure or editor workflow needs documentation.
- [x] 5.5 Run frontend install, format-check, lint, typecheck, test, coverage, dead-code, build, and repository quality checks.
