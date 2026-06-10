## ADDED Requirements

### Requirement: Development-only editor diagnostics sidebar

The frontend SHALL show the diagnostics sidebar in the DBML editor workspace only when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Diagnostics sidebar appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render the diagnostics sidebar

#### Scenario: Diagnostics sidebar is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the diagnostics sidebar

#### Scenario: Monaco markers remain available

- **WHEN** DBML validation returns diagnostics outside frontend development mode
- **THEN** Monaco validation markers MUST still be available for diagnostics that include source positions

### Requirement: Collapsible diagnostics sidebar

The frontend SHALL allow developers to collapse and expand the diagnostics sidebar in the DBML editor workspace.

#### Scenario: Developer collapses diagnostics

- **WHEN** the diagnostics sidebar is visible and a developer activates the collapse control
- **THEN** the editor workspace MUST hide the diagnostics panel content while preserving access to an expand control

#### Scenario: Developer expands diagnostics

- **WHEN** the diagnostics sidebar is collapsed and a developer activates the expand control
- **THEN** the editor workspace MUST show the diagnostics panel content again

#### Scenario: Collapse state is local to the page session

- **WHEN** the editor workspace is reloaded
- **THEN** the diagnostics sidebar collapse state MAY reset to its default value

### Requirement: Development DBML presets

The frontend SHALL provide DBML test presets in the DBML editor workspace only when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Preset controls appear in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render controls for choosing DBML test presets

#### Scenario: Preset controls are hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render DBML test preset controls

#### Scenario: Simple preset is available

- **WHEN** the DBML preset controls are visible
- **THEN** a simple DBML preset MUST be available for testing a small schema

#### Scenario: Complex preset is available

- **WHEN** the DBML preset controls are visible
- **THEN** a complex DBML preset MUST be available for testing multiple related tables

#### Scenario: Very complex preset is available

- **WHEN** the DBML preset controls are visible
- **THEN** a very complex DBML preset MUST be available for testing many tables, many columns, and dense relation rendering

#### Scenario: Developer applies a preset

- **WHEN** a developer selects a DBML test preset
- **THEN** the editor workspace MUST replace the current editor document with that preset document

### Requirement: Editor dev mode environment documentation

The frontend SHALL document the environment configuration required to enable editor dev mode.

#### Scenario: Dev mode flag is documented

- **WHEN** a developer reads `frontend/.env.example`
- **THEN** the example environment file MUST include the frontend editor dev mode flag and an example value
