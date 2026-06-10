## ADDED Requirements

### Requirement: Repository initialization workflow

The repository SHALL provide a mise initialization workflow that creates service-local environment files and installs project dependencies.

#### Scenario: Repository init creates service env files

- **WHEN** a developer runs the repository initialization mise task
- **THEN** the command MUST create frontend and backend `.env` files from their project-local `.env.example` files when those `.env` files do not already exist

#### Scenario: Repository init preserves existing env files

- **WHEN** a project-local `.env` file already exists
- **THEN** the repository initialization mise task MUST NOT overwrite that file

#### Scenario: Repository init installs dependencies

- **WHEN** a developer runs the repository initialization mise task
- **THEN** the command MUST install frontend and backend project dependencies

#### Scenario: Env files can be initialized without dependency install

- **WHEN** a developer runs the repository env initialization mise task
- **THEN** the command MUST create service-local `.env` files without installing dependencies
