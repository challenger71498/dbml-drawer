## ADDED Requirements

### Requirement: Diagram-driven editor source navigation

The DBML editor workspace SHALL move the Monaco editor cursor to the DBML source definition for diagram targets that users focus from the diagram preview.

#### Scenario: Clicking table moves cursor to table definition

- **WHEN** a user clicks a rendered table header in the diagram preview
- **THEN** the Monaco editor cursor MUST move to the corresponding DBML table definition

#### Scenario: Clicking column moves cursor to column definition

- **WHEN** a user clicks a rendered column row in the diagram preview
- **THEN** the Monaco editor cursor MUST move to the corresponding DBML column definition

#### Scenario: Editor reveals focused source position

- **WHEN** the Monaco editor cursor is moved because of a diagram table or column focus
- **THEN** the Monaco editor MUST reveal the cursor position within the editor viewport

#### Scenario: Editor receives focus after diagram source navigation

- **WHEN** the Monaco editor cursor is moved because of a diagram table or column focus
- **THEN** the Monaco editor MUST receive input focus

#### Scenario: Missing source token does not block diagram focus

- **WHEN** a user clicks a rendered table header or column row whose DBML source token is unavailable
- **THEN** the diagram preview MUST still focus the clicked diagram target and the editor cursor movement MUST be skipped
