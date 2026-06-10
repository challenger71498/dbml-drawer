## ADDED Requirements

### Requirement: Editor inspector activity bar

The DBML editor workspace SHALL provide an editor-local inspector activity bar for editor-specific tools.

#### Scenario: Activity bar renders available activities

- **WHEN** the DBML editor workspace has one or more available inspector activities
- **THEN** the workspace MUST render a right-side activity bar with one control per available activity

#### Scenario: Activity controls are icon-only and accessible

- **WHEN** an inspector activity control is rendered
- **THEN** the control MUST be visually icon-only and MUST provide an accessible label describing the activity

#### Scenario: Activity bar is hidden when no activities are available

- **WHEN** the DBML editor workspace has no available inspector activities
- **THEN** the workspace MUST NOT render an empty inspector activity bar

### Requirement: Editor inspector sidebar

The DBML editor workspace SHALL provide an expandable right-side inspector sidebar that displays the active inspector activity panel.

#### Scenario: Selecting an inactive activity expands sidebar

- **WHEN** a user activates an inspector activity that is not currently active
- **THEN** the workspace MUST select that activity and expand the inspector sidebar with that activity panel

#### Scenario: Selecting active activity toggles sidebar

- **WHEN** a user activates the currently active inspector activity
- **THEN** the workspace MUST toggle the inspector sidebar between expanded and collapsed states

#### Scenario: Switching activity preserves expanded sidebar

- **WHEN** the inspector sidebar is expanded and a user activates a different inspector activity
- **THEN** the workspace MUST keep the sidebar expanded and replace the panel content with the newly selected activity panel

#### Scenario: Collapsed inspector clears selected activity

- **WHEN** the inspector sidebar is collapsed
- **THEN** the workspace MUST NOT keep any activity visibly selected in the activity bar

#### Scenario: Sidebar can be closed from panel

- **WHEN** the inspector sidebar is expanded and a user activates the sidebar close control
- **THEN** the workspace MUST collapse the inspector sidebar while preserving access to the activity bar

### Requirement: Extensible editor inspector activities

The DBML editor workspace SHALL define inspector activities as composable activity definitions so future editor tools can be added without rewriting the main editor layout.

#### Scenario: Activity definition provides metadata

- **WHEN** an inspector activity is registered
- **THEN** it MUST provide a stable identifier, accessible label, and panel renderer

#### Scenario: Activity definition renders panel content

- **WHEN** an inspector activity becomes active and the sidebar is expanded
- **THEN** the workspace MUST render the panel content provided by that activity definition

#### Scenario: Editor page layout remains activity-agnostic

- **WHEN** a new inspector activity is added
- **THEN** the editor workspace grid and primary editor layout MUST remain unchanged by that activity addition

## MODIFIED Requirements

### Requirement: Development-only editor diagnostics sidebar

The frontend SHALL expose DBML diagnostics as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Diagnostics activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a diagnostics activity control in the editor inspector activity bar

#### Scenario: Diagnostics activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the diagnostics activity control or diagnostics inspector panel

#### Scenario: Diagnostics panel shows validation errors

- **WHEN** DBML validation returns diagnostics and the diagnostics activity panel is expanded
- **THEN** the workspace MUST display those diagnostics in the diagnostics inspector panel

#### Scenario: Monaco markers remain available

- **WHEN** DBML validation returns diagnostics outside frontend development mode
- **THEN** Monaco validation markers MUST still be available for diagnostics that include source positions

### Requirement: Collapsible diagnostics sidebar

The frontend SHALL allow developers to collapse and expand the editor inspector sidebar that hosts the diagnostics activity panel.

#### Scenario: Developer collapses diagnostics activity

- **WHEN** the diagnostics activity is active and the inspector sidebar is expanded
- **THEN** activating the diagnostics activity control or sidebar close control MUST collapse the inspector sidebar while preserving the diagnostics activity control

#### Scenario: Developer expands diagnostics activity

- **WHEN** the diagnostics activity is active and the inspector sidebar is collapsed
- **THEN** activating the diagnostics activity control MUST expand the inspector sidebar and show the diagnostics panel content

#### Scenario: Collapse state is local to the page session

- **WHEN** the editor workspace is reloaded
- **THEN** the inspector sidebar MUST use its default state for the new page session

### Requirement: Development DBML presets

The frontend SHALL expose DBML test presets as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Presets activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a presets activity control in the editor inspector activity bar

#### Scenario: Presets activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the presets activity control or presets inspector panel

#### Scenario: Simple preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a simple DBML preset MUST be available for testing a small schema

#### Scenario: Complex preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a complex DBML preset MUST be available for testing multiple related tables

#### Scenario: Very complex preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a very complex DBML preset MUST be available for testing many tables, many columns, and dense relation rendering

#### Scenario: Developer applies a preset

- **WHEN** a developer selects a DBML test preset from the presets activity panel
- **THEN** the editor workspace MUST replace the current editor document with that preset document
