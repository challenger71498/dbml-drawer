## ADDED Requirements

### Requirement: DBML diagram export

The frontend SHALL allow users to export the currently rendered DBML diagram from the editor workspace when a rendered diagram is available.

#### Scenario: Export uses current rendered diagram

- **WHEN** a user exports a diagram from the editor workspace
- **THEN** the exported output MUST represent the current rendered DBML diagram layout
- **AND** it MUST include all rendered tables and relation lines in the diagram bounds rather than only the currently visible viewport

#### Scenario: Export is unavailable without rendered diagram

- **WHEN** the editor workspace has no rendered DBML diagram available
- **THEN** the frontend MUST prevent PNG and HTML diagram export actions from producing a file

#### Scenario: Invalid document preserves visible export source

- **WHEN** the current DBML document is invalid and the preview is showing the last valid rendered diagram
- **THEN** exporting MUST use that visible rendered diagram rather than attempting to export the invalid document

#### Scenario: Export uses chosen file name

- **WHEN** a user provides a file name before exporting a rendered diagram
- **THEN** the downloaded file MUST use that file name with the selected export format extension

### Requirement: PNG diagram export

The frontend SHALL export the current rendered DBML diagram as a PNG image file.

#### Scenario: User exports PNG

- **WHEN** a user chooses PNG export for a rendered DBML diagram
- **THEN** the frontend MUST download a PNG file containing the rendered diagram

#### Scenario: PNG includes diagram visual styling

- **WHEN** a PNG export is produced
- **THEN** the PNG MUST include table cards, column rows, relation lines, active highlights when enabled, and the resolved diagram theme styling

### Requirement: HTML diagram export

The frontend SHALL export the current rendered DBML diagram as a standalone HTML file.

#### Scenario: User exports HTML

- **WHEN** a user chooses HTML export for a rendered DBML diagram
- **THEN** the frontend MUST download an HTML file containing the rendered diagram

#### Scenario: HTML export is standalone

- **WHEN** an exported HTML file is opened outside the editor application
- **THEN** it MUST render the diagram without requiring the DBML editor app bundle, React Flow runtime, backend access, or network access

#### Scenario: HTML includes diagram visual styling

- **WHEN** an HTML export is produced
- **THEN** the HTML MUST include the static styles needed to render table cards, column rows, relation lines, active highlights when enabled, and the resolved diagram theme styling

### Requirement: Export selection highlight option

The frontend SHALL let users choose whether the currently focused table or column highlight is included in exported diagrams.

#### Scenario: Focused target highlight is included

- **WHEN** a table or column is focused in the diagram and the user exports with selection highlighting enabled
- **THEN** the exported output MUST render the focused table or column and its active relation context with the same focus highlight semantics used by the live preview

#### Scenario: Focused target highlight is omitted

- **WHEN** a table or column is focused in the diagram and the user exports with selection highlighting disabled
- **THEN** the exported output MUST render the diagram without focused table, focused column, active relation, or dimmed inactive-element styling caused by that focused target

#### Scenario: No focused target

- **WHEN** no table or column is focused in the diagram
- **THEN** the selection highlighting option MUST NOT add active highlight styling to the exported output

#### Scenario: Hover state is not exported

- **WHEN** a user exports while a table or column is only transiently hovered
- **THEN** the exported output MUST NOT include hover-only highlighting unless that table or column is also the focused target and selection highlighting is enabled

### Requirement: Static export relation highlighting

The frontend SHALL normalize animated relation highlighting to a static export representation.

#### Scenario: Dynamic highlight exports as gradient

- **WHEN** the current relation highlight mode is `dynamic` and an exported diagram includes active relation highlighting
- **THEN** the exported output MUST render those active relation lines using the static gradient relation highlight style
- **AND** it MUST NOT render moving dynamic flow markers

#### Scenario: Gradient highlight exports as gradient

- **WHEN** the current relation highlight mode is `gradient` and an exported diagram includes active relation highlighting
- **THEN** the exported output MUST render active relation lines using the gradient relation highlight style

#### Scenario: Solid highlight exports as solid

- **WHEN** the current relation highlight mode is `solid` and an exported diagram includes active relation highlighting
- **THEN** the exported output MUST render active relation lines using the solid active relation highlight style
