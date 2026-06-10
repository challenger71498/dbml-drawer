## 1. Dev Mode Boundaries

- [x] 1.1 Add an editor-local development mode boundary based on an explicit frontend environment flag.
- [x] 1.2 Document the frontend editor dev mode flag in `frontend/.env.example`.
- [x] 1.3 Update `EditorPage` composition so diagnostics sidebar and preset controls are rendered only when editor dev mode is enabled.
- [x] 1.4 Ensure production editor layout remains focused on the code editor and diagram preview.

## 2. Diagnostics Sidebar

- [x] 2.1 Add local UI state for collapsing and expanding the development diagnostics sidebar.
- [x] 2.2 Add an accessible collapse/expand control that preserves access to the diagnostics sidebar while collapsed.
- [x] 2.3 Update styling so expanded, collapsed, and production layouts remain stable across desktop-sized editor viewports.

## 3. DBML Test Presets

- [x] 3.1 Replace the single sample-only model with named editor-local DBML presets.
- [x] 3.2 Add simple, complex, and very complex DBML preset documents.
- [x] 3.3 Add development-only preset controls that replace the current editor document when selected.
- [x] 3.4 Keep the initial editor document behavior deterministic by using a default preset.

## 4. Tests and Quality

- [x] 4.1 Add or update tests for development-mode diagnostics visibility.
- [x] 4.2 Add or update tests for production-mode diagnostics hiding while Monaco markers remain supported.
- [x] 4.3 Add or update tests for diagnostics collapse and expand behavior.
- [x] 4.4 Add or update tests for DBML preset selection.
- [x] 4.5 Run frontend quality checks.
- [x] 4.6 Run repository quality checks.

## 5. Repository Initialization

- [x] 5.1 Add mise tasks for repository and service-local env initialization.
- [x] 5.2 Include env initialization in the repository `init` mise task before dependency installation.
- [x] 5.3 Update setup documentation to use the repository `init` and `env:init` tasks.
- [x] 5.4 Add developer workflow delta spec coverage for service-local env initialization.
- [x] 5.5 Verify mise task discovery and repository quality checks.
