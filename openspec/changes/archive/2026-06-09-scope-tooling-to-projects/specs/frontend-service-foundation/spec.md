## MODIFIED Requirements

### Requirement: Frontend verification scripts

The frontend service SHALL expose scripts for build, lint, test, and type checking, and SHALL own the TypeScript, editor, and package tooling configuration needed by those scripts.

#### Scenario: Frontend can be verified independently

- **WHEN** a developer runs the frontend verification scripts from the workspace
- **THEN** each script MUST execute without requiring the backend service to be running

#### Scenario: Frontend owns TypeScript configuration

- **WHEN** a developer inspects `frontend/`
- **THEN** the frontend TypeScript configuration MUST be complete without extending a repository-root TypeScript configuration file

#### Scenario: Frontend owns editor configuration

- **WHEN** a developer inspects `frontend/`
- **THEN** frontend editor configuration MUST live under `frontend/`

#### Scenario: Frontend owns package tooling policy

- **WHEN** a developer inspects frontend package configuration
- **THEN** frontend-specific package tooling policy MUST live under `frontend/` rather than the repository root
