# DBML Drawer

DBML Drawer is a monorepo for a DBML editor and renderer web service.

## Workspace

- `frontend/`: Vite, React, and TypeScript web application
- `backend/`: Fastify, Node.js, and TypeScript HTTP API

## Tooling Ownership

Repository-level tool versions are managed with `mise`.

Project-level language, editor, package, dependency, formatter, linter, test, coverage, dead-code, and build configuration lives inside each project directory. For example, TypeScript, `.editorconfig`, `package.json`, and project lockfiles are owned by `frontend/` and `backend/`, not by the repository root.

## Setup

Install repository tools:

```sh
mise install
```

Install project dependencies from the repository root:

```sh
mise run install
```

Copy local environment examples as needed:

```sh
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Development

Run both services:

```sh
mise run dev
```

Run one service:

```sh
mise run frontend:dev
mise run backend:dev
```

Default local URLs:

- Frontend editor: `http://localhost:5173/editor`
- Backend health: `http://localhost:3000/health`

## Frontend Structure

Frontend source follows a minimal Feature-Sliced Design shape:

- `frontend/src/app/`: app bootstrap, routing, and global styles
- `frontend/src/pages/editor/`: `/editor` DBML editor page, including Monaco integration and DBML validation
- `frontend/src/shared/`: reusable infrastructure without DBML workflow logic

## Verification

Run repository checks from the root:

```sh
mise run format:check
mise run lint
mise run typecheck
mise run test
mise run coverage
mise run dead-code
mise run build
```

Run the full quality gate:

```sh
mise run quality
```

Run a project-specific quality command:

```sh
mise run frontend:format
mise run frontend:coverage
mise run frontend:dead-code
mise run backend:format
mise run backend:coverage
mise run backend:dead-code
```
