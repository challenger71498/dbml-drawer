## ADDED Requirements

### Requirement: Root development workflow

The repository SHALL provide root-level commands for running both services during development.

#### Scenario: All services can be started from root

- **WHEN** a developer runs the root development command
- **THEN** the command MUST start both frontend and backend development processes

#### Scenario: Individual services can be started from root

- **WHEN** a developer runs a service-specific root development command
- **THEN** the command MUST start only the selected service

### Requirement: Root verification workflow

The repository SHALL provide root-level commands for build, lint, test, and type checking.

#### Scenario: Workspace can be verified from root

- **WHEN** a developer runs the root verification commands
- **THEN** the commands MUST delegate to the matching scripts in workspace packages

### Requirement: Setup documentation

The repository SHALL document the basic local development workflow.

#### Scenario: Developer can find setup instructions

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST describe dependency installation, service startup, and verification commands for the monorepo
