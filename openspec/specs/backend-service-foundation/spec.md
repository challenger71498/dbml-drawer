## Purpose

Define the backend service foundation for a TypeScript Fastify API service that can be developed, verified, and configured independently from other projects in the repository.

## Requirements

### Requirement: Backend API shell

The backend service SHALL provide a TypeScript HTTP API application shell.

#### Scenario: Backend starts locally

- **WHEN** a developer runs the backend development command
- **THEN** the backend service MUST start a local HTTP server

#### Scenario: Backend health endpoint responds

- **WHEN** a client requests the backend health endpoint
- **THEN** the backend service MUST return a successful JSON response identifying the service as healthy

### Requirement: Backend environment configuration

The backend service SHALL document its required local environment variables.

#### Scenario: Backend environment example exists

- **WHEN** a developer inspects `backend/`
- **THEN** an environment example file MUST describe the backend port and any reserved future configuration placeholders

### Requirement: Backend verification scripts

The backend service SHALL expose scripts for build, lint, test, type checking, formatting, coverage reporting, and dead-code detection, and SHALL own the TypeScript, editor, formatter, linter, coverage, dead-code, and package tooling configuration needed by those scripts.

#### Scenario: Backend can be verified independently

- **WHEN** a developer runs the backend verification scripts from the workspace
- **THEN** each script MUST execute without requiring frontend assets or a database connection

#### Scenario: Backend owns TypeScript configuration

- **WHEN** a developer inspects `backend/`
- **THEN** the backend TypeScript configuration MUST be complete without extending a repository-root TypeScript configuration file

#### Scenario: Backend owns editor configuration

- **WHEN** a developer inspects `backend/`
- **THEN** backend editor configuration MUST live under `backend/`

#### Scenario: Backend owns package tooling policy

- **WHEN** a developer inspects backend package configuration
- **THEN** backend-specific package tooling policy MUST live under `backend/` rather than the repository root

#### Scenario: Backend formatting can be checked

- **WHEN** a developer runs the backend format-check script
- **THEN** the script MUST verify backend formatting without modifying files

#### Scenario: Backend lint uses type information

- **WHEN** a developer runs the backend lint script
- **THEN** ESLint MUST evaluate TypeScript code with project type information

#### Scenario: Backend coverage can be reported

- **WHEN** a developer runs the backend coverage script
- **THEN** Vitest MUST produce a backend coverage report

#### Scenario: Backend dead code can be detected

- **WHEN** a developer runs the backend dead-code script
- **THEN** the script MUST check for unused backend files, exports, and dependencies
