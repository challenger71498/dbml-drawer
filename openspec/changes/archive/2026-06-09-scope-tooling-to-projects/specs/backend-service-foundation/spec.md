## MODIFIED Requirements

### Requirement: Backend verification scripts

The backend service SHALL expose scripts for build, lint, test, and type checking, and SHALL own the TypeScript, editor, and package tooling configuration needed by those scripts.

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
