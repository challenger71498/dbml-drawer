## ADDED Requirements

### Requirement: Workspace package boundaries

The repository SHALL define a pnpm workspace with separate `frontend` and `backend` packages.

#### Scenario: Workspace packages are discoverable

- **WHEN** a developer installs dependencies from the repository root
- **THEN** the package manager MUST recognize `frontend/` and `backend/` as workspace packages

#### Scenario: Services remain separate

- **WHEN** a developer inspects the repository structure
- **THEN** frontend application files MUST live under `frontend/` and backend application files MUST live under `backend/`

### Requirement: Root package metadata

The repository SHALL provide root package metadata for workspace-level scripts and dependency management.

#### Scenario: Root scripts are available

- **WHEN** a developer reads the root package manifest
- **THEN** it MUST expose scripts for developing, building, linting, testing, and type checking the workspace

#### Scenario: Root package is private

- **WHEN** a developer reads the root package manifest
- **THEN** it MUST mark the root package as private to prevent accidental publication
