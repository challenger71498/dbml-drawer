## Purpose

Define the repository workspace boundaries for a language-neutral monorepo with separate frontend and backend services and repository-level orchestration through mise.

## Requirements

### Requirement: Workspace package boundaries

The repository SHALL define a multi-project layout with separate `frontend` and `backend` projects, while keeping the repository root language-neutral and free of Node package-manager ownership.

#### Scenario: Workspace packages are discoverable

- **WHEN** a developer inspects the repository root
- **THEN** the root MUST NOT contain `package.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`

#### Scenario: Services remain separate

- **WHEN** a developer inspects the repository structure
- **THEN** frontend application files MUST live under `frontend/` and backend application files MUST live under `backend/`

#### Scenario: Root workspace configuration is language-neutral

- **WHEN** a developer inspects root repository configuration
- **THEN** it MUST NOT define TypeScript configuration, TypeScript dependencies, Node package metadata, pnpm workspace metadata, or service-specific package policy

### Requirement: Root package metadata

The repository SHALL NOT provide root package metadata; cross-project commands SHALL be owned by repository-level mise tasks.

#### Scenario: Root scripts are available

- **WHEN** a developer inspects the repository root
- **THEN** there MUST NOT be a root package manifest for workspace scripts

#### Scenario: Root package is private

- **WHEN** a developer needs repository-level development or verification commands
- **THEN** those commands MUST be available through mise tasks

#### Scenario: Root package has no TypeScript dependency

- **WHEN** a developer inspects repository-root files
- **THEN** root package metadata MUST NOT declare TypeScript or TypeScript-specific tooling because root package metadata MUST NOT exist
