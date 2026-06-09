## Context

The archived monorepo foundation created a working `frontend/` and `backend/` TypeScript workspace. It also introduced root-level files such as `.editorconfig`, `tsconfig.base.json`, `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`. That shape works for a TypeScript-only pnpm workspace, but the intended monorepo should remain open to future services that may use other languages or package managers.

This change narrows the root repository contract: root files coordinate projects, while each project owns its language, editor, package, and build settings.

## Goals / Non-Goals

**Goals:**

- Remove repository-root TypeScript configuration and dependencies.
- Move TypeScript configuration ownership into `frontend/` and `backend/`.
- Move editor configuration ownership into `frontend/` and `backend/`.
- Keep repository-level tool version management in `mise`.
- Remove repository-root Node package manager files.
- Move cross-project commands into `mise` tasks.
- Preserve the existing frontend and backend runtime behavior.

**Non-Goals:**

- Change frontend or backend away from TypeScript.
- Change frontend or backend away from pnpm.
- Add a non-TypeScript project in this change.
- Change DBML product features, backend API behavior, or frontend UI behavior.

## Decisions

### Keep root tooling language-neutral

The repository root may contain documentation, ignore rules, OpenSpec artifacts, and mise configuration. It must not contain TypeScript base configuration, TypeScript dependencies, Node package metadata, or pnpm workspace files because those choices should not apply to every future project.

Alternative considered: keep a root `tsconfig.base.json`. This reduces duplication between current services but creates a repository-wide TypeScript assumption.

### Use service-local TypeScript configuration

`frontend/` and `backend/` will each own complete TypeScript configuration. Shared compiler choices may be duplicated when they are intentionally the same, but there will be no root `extends` dependency.

Alternative considered: introduce a shared config package. That may become useful later if multiple TypeScript packages emerge, but it would still be a TypeScript-specific package and is unnecessary now.

### Use service-local editor configuration

`.editorconfig` will live under each project directory that needs editor conventions. This makes formatting policy opt-in per project rather than inherited by all future directories.

Alternative considered: keep root `.editorconfig`. It is convenient but applies policy to every future project whether or not it matches that project's ecosystem.

### Remove root pnpm workspace ownership

`frontend/` and `backend/` will each own their own `package.json`, `pnpm-lock.yaml`, and package-manager settings. The repository root will not contain `package.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`.

Alternative considered: keep a root pnpm workspace with minimal `packages` discovery. That still makes the root a Node/pnpm project and conflicts with the goal of supporting future non-pnpm projects.

### Use mise for repository-level tool management

Repository-level runtime/tool versions and cross-project commands should be expressed through mise. Service package manifests can still define package scripts and package dependencies, but root tool version policy and orchestration belong in mise rather than root package-manager files.

## Risks / Trade-offs

- Duplicated TypeScript options between frontend and backend -> Accept small duplication until a real shared TypeScript package need appears.
- Some pnpm workspace conveniences are lost -> Use mise tasks to run project-local pnpm commands from the repository root.
- Moving `.editorconfig` may remove conventions for root markdown/config files -> Keep root files simple and rely on project-local settings where code lives.
- Existing build artifacts may remain from prior verification runs -> Clean generated files as part of implementation before final verification.
