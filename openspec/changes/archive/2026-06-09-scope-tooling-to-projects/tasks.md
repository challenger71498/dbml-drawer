## 1. Root Tooling Boundary

- [x] 1.1 Add or update `mise.toml` so repository-level tool versions are managed by mise.
- [x] 1.2 Remove repository-root TypeScript configuration.
- [x] 1.3 Remove repository-root editor configuration.
- [x] 1.4 Remove repository-root Node package-manager files.
- [x] 1.5 Add mise tasks for cross-project development and verification commands.

## 2. Frontend Project Ownership

- [x] 2.1 Move frontend editor configuration under `frontend/`.
- [x] 2.2 Make `frontend/tsconfig.json` complete without extending a repository-root TypeScript config.
- [x] 2.3 Ensure frontend package scripts continue to own build, lint, test, and type-check tooling.

## 3. Backend Project Ownership

- [x] 3.1 Move backend editor configuration under `backend/`.
- [x] 3.2 Make `backend/tsconfig.json` complete without extending a repository-root TypeScript config.
- [x] 3.3 Ensure backend package scripts continue to own build, lint, test, and type-check tooling.

## 4. Cleanup and Verification

- [x] 4.1 Remove generated build artifacts that should not be tracked.
- [x] 4.2 Update documentation to explain root versus project-level tooling ownership.
- [x] 4.3 Reinstall dependencies from each project directory after package-manager configuration changes.
- [x] 4.4 Run repository lint, typecheck, test, and build mise tasks.
