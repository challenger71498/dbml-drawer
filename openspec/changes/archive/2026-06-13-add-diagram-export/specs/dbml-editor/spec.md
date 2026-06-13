## ADDED Requirements

### Requirement: Editor diagram export controls

The DBML editor workspace SHALL provide controls for exporting the current rendered diagram.

#### Scenario: Export control is available

- **WHEN** a rendered DBML diagram is available in the editor workspace
- **THEN** the workspace MUST provide an export control for the current diagram in the editor header's right-side action area

#### Scenario: Export control remains header-level

- **WHEN** the editor workspace renders sidebars, inspector panels, settings panels, or preview overlays
- **THEN** the diagram export control MUST remain a header-level workspace action rather than being hosted inside those panels or overlays

#### Scenario: Export formats are selectable

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide PNG and HTML export format choices

#### Scenario: Selection highlight option is available

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide an option for including the currently focused table or column highlight in the exported output

#### Scenario: File name input is available

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide a file name input
- **AND** the default file name MUST match the generated diagram export file name used when the user does not customize it

#### Scenario: Export control blocks missing diagram

- **WHEN** no rendered DBML diagram is available in the editor workspace
- **THEN** the workspace MUST disable or otherwise block PNG and HTML export actions

#### Scenario: Export options are per action

- **WHEN** a user changes the export format, file name, or selection highlight option
- **THEN** the workspace MUST NOT persist those choices as editor settings or change the live diagram rendering settings

### Requirement: Editor export downloads

The DBML editor workspace SHALL start a browser download for successful diagram export actions.

#### Scenario: PNG export downloads file

- **WHEN** a user confirms PNG export for a rendered DBML diagram
- **THEN** the workspace MUST start a browser download for a `.png` file

#### Scenario: HTML export downloads file

- **WHEN** a user confirms HTML export for a rendered DBML diagram
- **THEN** the workspace MUST start a browser download for a `.html` file

#### Scenario: Export failure is surfaced

- **WHEN** diagram export fails before a file can be downloaded
- **THEN** the workspace MUST surface a non-success export state without clearing the current diagram or editor document
