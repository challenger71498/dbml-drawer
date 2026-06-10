## MODIFIED Requirements

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
