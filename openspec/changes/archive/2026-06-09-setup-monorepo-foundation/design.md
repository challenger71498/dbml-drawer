## Context

The repository currently contains OpenSpec planning artifacts but no application workspace. The product direction now calls for a web service with two first-class services: a frontend DBML workspace and a backend API that can later support accounts, saved settings, persistence, and sharing.

The foundation should make future feature work predictable without forcing implementation of those features now. The initial implementation should therefore create service boundaries, scripts, and health checks rather than application-specific DBML behavior.

## Goals / Non-Goals

**Goals:**

- Create a pnpm workspace monorepo with `frontend/` and `backend/` packages.
- Use TypeScript across both services.
- Provide a frontend service shell suitable for DBML editor and diagram-rendering features.
- Provide a backend HTTP API service shell suitable for future account, settings, persistence, and sharing features.
- Provide root-level commands that run common development and verification workflows.
- Keep service configuration explicit through environment examples.

**Non-Goals:**

- Implement DBML parsing, syntax highlighting, diagram rendering, or export.
- Implement authentication, user accounts, database persistence, or settings storage.
- Add shared package directories before a concrete shared contract exists.
- Introduce production deployment infrastructure.

## Decisions

### Use pnpm workspaces for the monorepo

The repository will use a root `package.json` and `pnpm-workspace.yaml` with `frontend` and `backend` as workspace packages. This keeps dependency installation and script orchestration simple while preserving independent package boundaries.

Alternative considered: Turborepo. It can be added later if build caching and task graph orchestration become valuable, but it is unnecessary for a two-package foundation.

### Use Vite, React, and TypeScript for `frontend/`

The frontend will start as a Vite React TypeScript app. This fits a browser-heavy editor and diagram tool, provides fast local feedback, and avoids server-rendering complexity before there is a user-facing need for it.

Alternative considered: Next.js. It is useful for server-rendered pages and integrated backend routes, but the chosen architecture already separates frontend and backend services.

### Use Fastify, Node.js, and TypeScript for `backend/`

The backend will start as a Fastify HTTP API running on Node.js. This gives the project a mature Node-focused server framework with strong performance, plugin support, schema-driven validation options, and room for future auth, persistence, and API contracts.

Alternative considered: Hono. It is smaller and has a clean web-standard API, but Fastify is a better fit for a Node backend that is expected to grow into account, settings, persistence, and service integration features.

### Keep persistence out of the foundation

The foundation will not select or configure a database. Backend environment configuration can reserve space for future database URLs, but account storage and settings persistence should be introduced by their own feature proposals.

Alternative considered: adding PostgreSQL and an ORM immediately. That would make future account work easier but adds setup cost before the data model is known.

### Add minimal quality gates

Both services will expose scripts for development, build, lint, test, and type checking where applicable. Root scripts will delegate to workspace packages so future feature changes have a consistent verification path.

## Risks / Trade-offs

- Two-service structure increases setup overhead before backend features exist -> Keep the backend shell minimal with only a health endpoint.
- Deferring database choice may require later migration of backend configuration -> Keep environment naming explicit and avoid persistence assumptions in early code.
- Frontend and backend contracts can drift -> Add a future proposal for shared API contracts once the first real backend feature is defined.
- Fastify plugin choices may need adjustment for auth or persistence -> Keep framework-specific code concentrated in the backend entrypoint, plugin registration, and route modules.
