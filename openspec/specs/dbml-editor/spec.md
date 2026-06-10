## Purpose

Define the frontend DBML editor authoring capability.

## Requirements

### Requirement: DBML editor workspace

The frontend SHALL provide a DBML editor workspace at the `/editor` route as the primary authoring surface with DBML text editing, diagnostics, and diagram preview.

#### Scenario: Editor workspace renders

- **WHEN** a user opens the `/editor` frontend route
- **THEN** the application MUST render a DBML editor workspace

#### Scenario: Editor route is addressable

- **WHEN** a user navigates directly to `/editor`
- **THEN** the frontend MUST show the DBML editor workspace without requiring any prior navigation state

#### Scenario: Sample DBML is available

- **WHEN** the DBML editor workspace first loads
- **THEN** the editor MUST contain an initial DBML sample document

#### Scenario: User can edit DBML text

- **WHEN** a user changes the editor content
- **THEN** the workspace MUST update the current DBML document state

#### Scenario: Diagram preview is available

- **WHEN** the DBML editor workspace renders
- **THEN** the workspace MUST include a DBML diagram preview for the current document

### Requirement: Monaco-based DBML editing

The frontend SHALL use Monaco Editor for DBML text editing.

#### Scenario: Monaco editor is used

- **WHEN** the DBML editor workspace renders
- **THEN** the DBML text input MUST be backed by Monaco Editor

#### Scenario: DBML language is registered

- **WHEN** Monaco initializes for the editor workspace
- **THEN** the frontend MUST register DBML as an editor language

### Requirement: DBML syntax highlighting

The editor SHALL provide syntax highlighting for DBML content.

#### Scenario: DBML keywords are highlighted

- **WHEN** the editor displays DBML content containing DBML keywords
- **THEN** Monaco MUST tokenize those keywords as DBML language tokens

#### Scenario: DBML structural tokens are highlighted

- **WHEN** the editor displays DBML content containing braces, brackets, strings, comments, identifiers, or relationship operators
- **THEN** Monaco MUST tokenize those structures for DBML syntax highlighting

### Requirement: DBML validation

The frontend SHALL validate DBML content in the browser without requiring backend persistence, authentication, or network access.

#### Scenario: Valid DBML clears diagnostics

- **WHEN** the current DBML document is valid
- **THEN** the workspace MUST show no validation errors for that document

#### Scenario: Invalid DBML creates diagnostics

- **WHEN** the current DBML document contains invalid DBML
- **THEN** the workspace MUST create validation diagnostics describing the parsing failure

#### Scenario: Validation follows editor changes

- **WHEN** a user edits the DBML document
- **THEN** validation MUST run after the edit without requiring an explicit submit action

### Requirement: DBML diagnostics display

The frontend SHALL display DBML validation diagnostics in the editor workspace.

#### Scenario: Diagnostics panel shows validation errors

- **WHEN** DBML validation returns errors
- **THEN** the workspace MUST display those errors in a diagnostics panel

#### Scenario: Editor markers show validation errors

- **WHEN** DBML validation returns errors with source positions
- **THEN** Monaco MUST display validation markers at the corresponding editor positions

#### Scenario: Diagnostics handle missing positions

- **WHEN** DBML validation returns an error without a source position
- **THEN** the workspace MUST still display the error message in the diagnostics panel

### Requirement: Responsive editing

The editor workspace SHALL keep editing responsive while DBML validation runs.

#### Scenario: Validation is debounced

- **WHEN** a user types continuously in the editor
- **THEN** validation MUST be delayed or coalesced to avoid validating every keystroke synchronously

#### Scenario: Stale diagnostics are replaced

- **WHEN** a newer validation result is available for the current document
- **THEN** the workspace MUST replace diagnostics from older document states

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
