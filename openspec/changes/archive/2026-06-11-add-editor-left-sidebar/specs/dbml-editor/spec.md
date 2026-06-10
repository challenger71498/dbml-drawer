## ADDED Requirements

### Requirement: Editor left sidebar

The DBML editor workspace SHALL provide a left-side sidebar for DBML authoring content.

#### Scenario: Left sidebar renders in editor workspace

- **WHEN** a user opens the `/editor` frontend route
- **THEN** the workspace MUST render a narrow left-side activity bar using visual styling consistent with the right-side editor inspector activity bar

#### Scenario: Left sidebar spans editor page chrome

- **WHEN** the editor page header is rendered
- **THEN** the left-side activity bar and expanded DBML editor sidebar panel MUST align with the full editor page height like the right-side inspector rather than starting below the editor page header

#### Scenario: Editor activity toggles left sidebar

- **WHEN** a user activates the DBML editor control in the left-side activity bar
- **THEN** the workspace MUST toggle the DBML editor sidebar panel between expanded and collapsed states

#### Scenario: DBML editor is hosted in left sidebar

- **WHEN** the DBML editor sidebar panel is expanded
- **THEN** the panel MUST contain the DBML code editor as its initial content

#### Scenario: Diagram remains primary workspace content

- **WHEN** the left activity bar is rendered and the DBML editor panel is expanded or collapsed
- **THEN** the DBML diagram preview MUST remain visible in the main workspace area outside the left activity bar and panel

#### Scenario: DBML editor sidebar width is resizable

- **WHEN** the DBML editor sidebar panel is expanded
- **THEN** the workspace MUST provide a control for resizing the sidebar width while preserving the diagram preview in the remaining main workspace

#### Scenario: DBML editing behavior is preserved

- **WHEN** a user edits DBML text in the left sidebar editor
- **THEN** the workspace MUST update the current DBML document state, validation diagnostics, Monaco markers, and diagram preview as before

#### Scenario: Diagram source reveal targets left sidebar editor

- **WHEN** a user focuses a table or column in the diagram preview
- **THEN** the workspace MUST reveal the corresponding DBML source range in the left sidebar code editor

#### Scenario: Right inspector remains independent

- **WHEN** right-side editor inspector activities are available
- **THEN** the left sidebar MUST NOT replace, hide, or change the behavior of the right-side inspector activity bar and panels
