## ADDED Requirements

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

The backend service SHALL expose scripts for build, lint, test, and type checking.

#### Scenario: Backend can be verified independently

- **WHEN** a developer runs the backend verification scripts from the workspace
- **THEN** each script MUST execute without requiring frontend assets or a database connection
