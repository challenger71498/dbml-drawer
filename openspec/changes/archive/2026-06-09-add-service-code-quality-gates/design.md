## Context

The repository has two TypeScript services, each owning its own package metadata, lockfile, TypeScript configuration, editor configuration, lint configuration, tests, and build scripts. Repository-level commands are orchestrated through `mise` rather than a root Node package manager.

The current quality gates cover lint, typecheck, test, and build. This change adds four additional gates requested for the next quality baseline: formatting, type-aware linting, coverage reporting, and dead-code detection.

## Goals / Non-Goals

**Goals:**

- Add Prettier to both services for formatting and format checks.
- Add type-aware TypeScript ESLint rules to both services.
- Add Vitest coverage commands to both services.
- Add Knip checks to both services for unused files, exports, and dependencies.
- Add repository-level `mise` tasks that aggregate service-owned quality commands.
- Keep every Node dependency and package-manager setting inside `frontend/` or `backend/`.

**Non-Goals:**

- Add Playwright or browser E2E tests.
- Add security scanning, dependency vulnerability scanning, or secret scanning.
- Add commit hooks, pre-push hooks, or CI workflow files.
- Add root package-manager files.
- Enforce coverage thresholds in the first pass.

## Decisions

### Use Prettier for formatting

Prettier will own code formatting. ESLint will remain focused on correctness, maintainability, and framework-specific rules. Each service will define its own Prettier config and package scripts.

Alternative considered: use ESLint stylistic rules. This creates more lint configuration surface and mixes formatting concerns into linting.

### Use type-aware ESLint as the default lint gate

Each service will configure ESLint with TypeScript project information so linting can catch type-driven issues. This is stricter and slower than syntax-only linting, but the repository is still small enough that the added cost is acceptable.

Alternative considered: add a separate `lint:types` command. This can be introduced later if type-aware linting becomes too slow.

### Add coverage reporting without thresholds

Vitest coverage will be available through explicit service and repository tasks. This change will not enforce minimum thresholds because current tests are skeletal and early thresholds would create noise rather than signal.

Alternative considered: enforce an initial low threshold. That adds a gate but does not materially improve quality until the feature surface grows.

### Use Knip as a dead-code check

Knip will run per service and use service-local configuration. This keeps unused dependency/export/file detection aligned with the repository policy that projects own their own package and tool configuration.

Alternative considered: run one repository-level Knip config. That conflicts with the decision to avoid root Node package-manager ownership.

### Aggregate quality with mise

Repository-level quality commands will be mise tasks that delegate to service package scripts. The expected top-level command is `mise run quality`, which should run format checks, lint, typecheck, tests, coverage, dead-code checks, and builds.

## Risks / Trade-offs

- Type-aware ESLint may slow linting -> Keep project scopes narrow and revisit split lint tasks only if runtime becomes a problem.
- Knip can report false positives for framework entrypoints or config files -> Add service-local Knip config for known entrypoints and project files.
- Prettier may reformat existing files -> Treat formatting output as part of this change and avoid unrelated manual style edits.
- Coverage without thresholds may be ignored -> Document the command now and add thresholds in a later change when meaningful feature tests exist.
