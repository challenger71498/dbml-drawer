## ADDED Requirements

### Requirement: Compact editor page header

The DBML editor workspace SHALL render one compact editor workspace header beside the editor sidebars and above the main workspace content.

#### Scenario: Editor header is the only page header

- **WHEN** the `/editor` workspace renders
- **THEN** the workspace MUST render a single editor page header
- **AND** the workspace MUST NOT render a separate preview section header

#### Scenario: Editor header sits beside sidebars

- **WHEN** the editor page header is rendered with left and right activity sidebars
- **THEN** the editor header MUST render inside the central workspace column beside the activity sidebars
- **AND** the left and right activity sidebars MUST remain full-height beside the workspace column

#### Scenario: Editor header uses compact activity-relative height

- **WHEN** the editor page header is rendered
- **THEN** its visual height MUST be four thirds of the current activity sidebar button height

#### Scenario: Editor header shows DBML title and note

- **WHEN** the current DBML document metadata contains a project name and note
- **THEN** the editor page header MUST show the project name in uppercase styling
- **AND** it MUST show the note below the project name with visual separation from the title

#### Scenario: Editor header omits missing note

- **WHEN** the current DBML document metadata does not contain a note
- **THEN** the editor page header MUST NOT show note fallback text
- **AND** it MUST NOT reserve visible note spacing

#### Scenario: Editor footer shows database type

- **WHEN** the current DBML document metadata contains a database type
- **THEN** the editor workspace MUST render a footer using the same visual height as the shared sidebar panel header
- **AND** the footer MUST show a database-shaped icon and the database type on the right side

#### Scenario: Editor footer omits missing database type

- **WHEN** the current DBML document metadata does not contain a database type
- **THEN** the editor workspace MUST NOT show database fallback text or database metadata in the footer

#### Scenario: Editor header handles missing metadata

- **WHEN** the current DBML document metadata is unavailable or incomplete
- **THEN** the editor page header and footer MUST render without breaking editor layout or diagram rendering

#### Scenario: Editor metadata persists through invalid DBML

- **GIVEN** the current DBML document previously parsed successfully with metadata
- **WHEN** the DBML document becomes invalid
- **THEN** the editor page header and footer MUST continue showing the last successfully parsed project name, note, and database type
- **AND** the invalid DBML warning MUST still be shown in the preview overlay

### Requirement: Settings-hosted diagram display controls

The DBML editor workspace SHALL host diagram routing controls and relation line style controls in the Settings panel.

#### Scenario: Routing controls move to settings

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide controls for Bezier, Step, and Rounded diagram edge routing modes

#### Scenario: Routing controls are removed from top chrome

- **WHEN** the editor workspace top chrome and preview overlays render
- **THEN** the Bezier, Step, and Rounded controls MUST NOT render in the former preview header or top toolbar location

#### Scenario: Relation style controls exist in settings

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide controls for Solid, Gradient, and Dynamic relation line style modes

#### Scenario: Settings controls use shared setting state

- **WHEN** a user changes diagram routing mode or relation line style mode in the Settings panel
- **THEN** the diagram preview MUST update using the same persisted settings state as existing diagram controls

#### Scenario: Dynamic relation style warns about battery life

- **WHEN** the Dynamic relation style mode is selected
- **THEN** the Dynamic control MUST use warning-colored active styling
- **AND** the Settings panel MUST show a warning that this option may impact battery life
- **AND** the preview compact relation style control MUST show the same warning as plain normal text below the control
