## Why

The DBML renderer/editor is expected to grow beyond a single browser-only tool into a web service with accounts, saved preferences, and shareable resources. Establishing a two-service monorepo now gives the project a clear place for frontend work, backend API work, and future shared contracts before feature implementation begins.

## What Changes

- Introduce a pnpm workspace monorepo with separate `frontend/` and `backend/` service directories.
- Establish the frontend as a TypeScript React application suitable for DBML editing and diagram rendering features.
- Establish the backend as a TypeScript HTTP API service suitable for future account, settings, persistence, and sharing features.
- Add root-level developer commands for installing, running, building, linting, and testing the workspace.
- Define environment configuration boundaries for frontend and backend services.
- Keep DBML editor, DBML rendering, authentication, database persistence, and user settings implementation out of this foundation change.

## Capabilities

### New Capabilities

- `monorepo-workspace`: Repository-level workspace structure, package boundaries, and package manager behavior.
- `frontend-service-foundation`: Initial frontend service shell and runtime contract.
- `backend-service-foundation`: Initial backend service shell and runtime contract.
- `developer-workflow`: Root-level commands and quality gates for developing both services.

### Modified Capabilities

None.

## Impact

- Creates new `frontend/` and `backend/` project directories.
- Adds root workspace package metadata and pnpm workspace configuration.
- Adds initial TypeScript, build, lint, test, and dev-server tooling.
- Establishes frontend/backend service boundaries before feature-specific proposals are created.
