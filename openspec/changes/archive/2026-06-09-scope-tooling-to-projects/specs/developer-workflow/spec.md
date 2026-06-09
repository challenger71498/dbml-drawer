## MODIFIED Requirements

### Requirement: Root development workflow

The repository SHALL provide mise tasks for running both services during development, with repository-level tool versions managed through mise.

#### Scenario: All services can be started from root

- **WHEN** a developer runs the repository development mise task
- **THEN** the command MUST start both frontend and backend development processes

#### Scenario: Individual services can be started from root

- **WHEN** a developer runs a service-specific development mise task
- **THEN** the command MUST start only the selected service

#### Scenario: Repository tools are managed by mise

- **WHEN** a developer inspects repository-level tool configuration
- **THEN** mise MUST be the source of truth for repository-level tool versions

### Requirement: Root verification workflow

The repository SHALL provide mise tasks for build, lint, test, and type checking without requiring root-level TypeScript configuration or root Node package-manager files.

#### Scenario: Workspace can be verified from root

- **WHEN** a developer runs the repository verification mise tasks
- **THEN** the commands MUST delegate to the matching scripts in workspace packages

#### Scenario: Root verification delegates language tooling

- **WHEN** a developer runs repository verification mise tasks
- **THEN** language-specific tools MUST execute from the owning project packages

### Requirement: Setup documentation

The repository SHALL document the basic local development workflow and the boundary between repository-level and project-level tooling.

#### Scenario: Developer can find setup instructions

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST describe dependency installation, service startup, and verification commands for the monorepo

#### Scenario: Developer can identify tooling ownership

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST state that mise owns repository-level tool versions and orchestration, while individual projects own language/editor/package configuration and lockfiles
