## MODIFIED Requirements

### Requirement: Frontend verification scripts

The frontend service SHALL expose scripts for build, lint, test, type checking, formatting, coverage reporting, and dead-code detection, and SHALL own the TypeScript, editor, formatter, linter, coverage, dead-code, and package tooling configuration needed by those scripts.

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

#### Scenario: Frontend formatting can be checked

- **WHEN** a developer runs the frontend format-check script
- **THEN** the script MUST verify frontend formatting without modifying files

#### Scenario: Frontend lint uses type information

- **WHEN** a developer runs the frontend lint script
- **THEN** ESLint MUST evaluate TypeScript code with project type information

#### Scenario: Frontend coverage can be reported

- **WHEN** a developer runs the frontend coverage script
- **THEN** Vitest MUST produce a frontend coverage report

#### Scenario: Frontend dead code can be detected

- **WHEN** a developer runs the frontend dead-code script
- **THEN** the script MUST check for unused frontend files, exports, and dependencies
