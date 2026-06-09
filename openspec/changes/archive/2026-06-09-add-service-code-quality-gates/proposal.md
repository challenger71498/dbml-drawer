## Why

The repository has basic lint, typecheck, test, and build commands, but it does not yet enforce consistent formatting, type-aware linting, coverage reporting, or dead-code detection. Adding these gates now keeps service-level quality expectations explicit before the DBML editor and renderer features expand the codebase.

## What Changes

- Add Prettier formatting and format-check commands to both `frontend/` and `backend/`.
- Strengthen ESLint with type-aware TypeScript rules for both services.
- Add Vitest coverage commands for both services.
- Add Knip checks for unused files, exports, and dependencies in both services.
- Add mise aggregate tasks for formatting, format checks, coverage, dead-code checks, and an overall quality check.
- Update documentation to describe the service-owned quality gates.
- Keep Playwright, security scanning, commit hooks, and CI configuration out of this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-service-foundation`: Extend frontend verification scripts to include formatting, type-aware linting, coverage, and dead-code checks.
- `backend-service-foundation`: Extend backend verification scripts to include formatting, type-aware linting, coverage, and dead-code checks.
- `developer-workflow`: Extend mise verification tasks so repository-level quality commands delegate to project-owned tools.

## Impact

- Adds service-local formatter, lint, coverage, and dead-code detection dependencies and configuration.
- Updates `frontend/package.json`, `backend/package.json`, service-local tool configs, project lockfiles, and `mise.toml`.
- Updates documentation for new quality commands.
- May require tuning ESLint type-aware rules and Knip entry/project settings to avoid false positives.
