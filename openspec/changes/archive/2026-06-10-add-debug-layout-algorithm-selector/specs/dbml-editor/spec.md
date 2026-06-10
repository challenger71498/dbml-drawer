## ADDED Requirements

### Requirement: Development diagram layout settings

The frontend SHALL expose diagram layout algorithm settings as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Layout settings activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a layout settings activity control in the editor inspector activity bar

#### Scenario: Layout settings activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the layout settings activity control or layout settings inspector panel

#### Scenario: Bundled ELK algorithms are available

- **WHEN** the layout settings activity panel is expanded and bundled ELK algorithm metadata is available
- **THEN** the panel MUST provide every layout algorithm exposed by the bundled `elkjs` runtime as a selectable option

#### Scenario: Layered algorithm is the default

- **WHEN** the editor workspace first renders
- **THEN** the selected diagram layout algorithm MUST be the current layered ELK layout algorithm

#### Scenario: Developer selects layout algorithm

- **WHEN** a developer selects a layout algorithm from the layout settings activity panel
- **THEN** the editor workspace MUST update the selected diagram layout algorithm for the current page session

#### Scenario: Curated layout options are available

- **WHEN** the selected layout algorithm has curated layout options
- **THEN** the layout settings activity panel MUST provide controls for those curated layout options

#### Scenario: Developer changes curated layout option

- **WHEN** a developer changes a curated layout option in the layout settings activity panel
- **THEN** the editor workspace MUST update that layout option for the current page session

#### Scenario: Layout algorithm setting is session-local

- **WHEN** the editor workspace is reloaded
- **THEN** the selected diagram layout algorithm and curated layout options MUST return to their default values
