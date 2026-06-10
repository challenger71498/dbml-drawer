## ADDED Requirements

### Requirement: Diagram table interaction

The diagram preview SHALL allow users to hover and focus rendered DBML tables.

#### Scenario: Hovering table highlights table and connected relations

- **WHEN** a user hovers a rendered table header in the diagram preview
- **THEN** the preview MUST visually highlight that table and every relation line connected to that table

#### Scenario: Leaving hovered table restores previous focus state

- **WHEN** a user stops hovering a rendered table header
- **THEN** the preview MUST remove the transient table hover highlight and MUST restore any existing focused table or column highlight

#### Scenario: Clicking table focuses table

- **WHEN** a user clicks a rendered table header in the diagram preview
- **THEN** the preview MUST set that table as the focused diagram target and MUST keep that table and its connected relation lines highlighted

#### Scenario: Focused table is replaced by another target

- **WHEN** a table is focused and a user clicks another rendered table header or column row
- **THEN** the preview MUST replace the previous focused target with the newly clicked diagram target

### Requirement: Diagram column interaction

The diagram preview SHALL allow users to hover and focus rendered DBML columns.

#### Scenario: Hovering column highlights column and connected relations

- **WHEN** a user hovers a rendered column row in the diagram preview
- **THEN** the preview MUST visually highlight that column and every relation line connected to that column

#### Scenario: Leaving hovered column restores previous focus state

- **WHEN** a user stops hovering a rendered column row
- **THEN** the preview MUST remove the transient column hover highlight and MUST restore any existing focused table or column highlight

#### Scenario: Clicking column focuses column

- **WHEN** a user clicks a rendered column row in the diagram preview
- **THEN** the preview MUST set that column as the focused diagram target and MUST keep that column and its connected relation lines highlighted

#### Scenario: Focused column is replaced by another target

- **WHEN** a column is focused and a user clicks another rendered table header or column row
- **THEN** the preview MUST replace the previous focused target with the newly clicked diagram target

### Requirement: Active diagram layering

The diagram preview SHALL render active diagram elements above inactive diagram elements.

#### Scenario: Active table appears above inactive tables

- **WHEN** a table is hovered or focused
- **THEN** that rendered table MUST appear above inactive rendered tables

#### Scenario: Active column appears above inactive content within table

- **WHEN** a column is hovered or focused
- **THEN** that rendered column row MUST be visually emphasized above inactive rows in the same table

#### Scenario: Active relation appears above inactive relations

- **WHEN** a relation line is connected to the active table or column target
- **THEN** that relation line MUST appear above inactive relation lines

### Requirement: Diagram interaction preserves rendering settings

The diagram preview SHALL preserve existing diagram rendering settings while users hover or focus tables and columns.

#### Scenario: Relation line style is preserved while focusing target

- **WHEN** a user has selected a relation line style and clicks a table header or column row
- **THEN** the preview MUST keep using the selected relation line style while applying focus highlights

#### Scenario: Relation line style is preserved while hovering target

- **WHEN** a user has selected a relation line style and hovers a table header or column row
- **THEN** the preview MUST keep using the selected relation line style while applying hover highlights
