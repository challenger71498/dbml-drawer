## Why

The monorepo should stay open to future projects that may not use TypeScript, pnpm, or the same editor conventions. Root-level tooling must therefore remain minimal and repository-oriented, while each service owns its language, editor, package, dependency, and build configuration.

## What Changes

- Move TypeScript base configuration out of the repository root and into each TypeScript service.
- Move `.editorconfig` out of the repository root and into each project directory that needs it.
- Keep repository-level tool management centered on `mise`.
- Remove repository-root Node package manager files, including root `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`.
- Move cross-project orchestration to `mise` tasks.
- Remove repository-root TypeScript dependencies or configuration assumptions that would apply to future non-TypeScript projects.
- Keep frontend and backend implemented in TypeScript; this change affects configuration ownership, not service language.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `monorepo-workspace`: Clarify that the repository root must remain language-neutral and must not contain root Node package manager files.
- `developer-workflow`: Clarify that repository-wide tool management uses `mise`, while language/toolchain configuration belongs to individual projects.
- `frontend-service-foundation`: Require frontend-owned TypeScript, editor, and package/tooling configuration.
- `backend-service-foundation`: Require backend-owned TypeScript, editor, and package/tooling configuration.

## Impact

- Removes root `tsconfig.base.json` and replaces it with service-local TypeScript configuration.
- Moves root `.editorconfig` expectations into `frontend/` and `backend/`.
- Removes root `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`.
- Moves root scripts into `mise.toml` tasks.
- Requires reinstalling dependencies from each project directory after package-manager ownership changes.
