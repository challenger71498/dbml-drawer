## MODIFIED Requirements

### Requirement: Root verification workflow

The repository SHALL provide mise tasks for build, lint, test, type checking, formatting, coverage reporting, dead-code detection, and aggregate quality checks without requiring root-level TypeScript configuration or root Node package-manager files.

#### Scenario: Workspace can be verified from root

- **WHEN** a developer runs the repository verification mise tasks
- **THEN** the commands MUST delegate to the matching scripts in workspace packages

#### Scenario: Root verification delegates language tooling

- **WHEN** a developer runs repository verification mise tasks
- **THEN** language-specific tools MUST execute from the owning project packages

#### Scenario: Repository formatting can be checked from root

- **WHEN** a developer runs the repository format-check mise task
- **THEN** the command MUST delegate to frontend and backend format-check scripts

#### Scenario: Repository coverage can be reported from root

- **WHEN** a developer runs the repository coverage mise task
- **THEN** the command MUST delegate to frontend and backend coverage scripts

#### Scenario: Repository dead code can be checked from root

- **WHEN** a developer runs the repository dead-code mise task
- **THEN** the command MUST delegate to frontend and backend dead-code scripts

#### Scenario: Repository quality can be checked from root

- **WHEN** a developer runs the repository quality mise task
- **THEN** the command MUST run the repository format-check, lint, typecheck, test, coverage, dead-code, and build checks

### Requirement: Setup documentation

The repository SHALL document the basic local development workflow, the boundary between repository-level and project-level tooling, and the available quality gates.

#### Scenario: Developer can find setup instructions

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST describe dependency installation, service startup, and verification commands for the monorepo

#### Scenario: Developer can identify tooling ownership

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST state that mise owns repository-level tool versions and orchestration, while individual projects own language/editor/package configuration and lockfiles

#### Scenario: Developer can find quality commands

- **WHEN** a developer opens the repository documentation
- **THEN** it MUST describe formatting, linting, type checking, testing, coverage, dead-code, build, and aggregate quality commands
